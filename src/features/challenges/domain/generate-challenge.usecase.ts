import { Challenge, SingleChallenge } from './challenge.entity';
import { WikipediaFeedService } from '../data/wikipedia-feed.service';
import { ChallengesRepository } from '../domain/challenges.repository';
import { ObjectivesRepository } from '../domain/objectives.repository';
import { logger } from '@shared/services/logger.service';
import { STARTERS } from './starters';

export class GenerateChallengeUseCase {
  constructor(
    private readonly wikipediaFeedService: WikipediaFeedService,
    private readonly challengesRepository: ChallengesRepository,
    private readonly objectivesRepository: ObjectivesRepository,
  ) {}

  /**
   * Generates 30 days of challenges (10 per day) starting from a specific date and language.
   */
  async generateMonthlyBatch(startDate: Date, lang: string = 'en'): Promise<number> {
    let totalGenerated = 0;
    const usedObjectiveIds: string[] = [];
    const usedObjectiveTitles: string[] = [];

    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);

      const { count, usedId, usedTitle } = await this.generateForDate(
        currentDate,
        lang,
        [...usedObjectiveIds],
        [...usedObjectiveTitles],
      );
      totalGenerated += count;

      if (usedId) {
        usedObjectiveIds.push(usedId);
      }
      if (usedTitle) {
        usedObjectiveTitles.push(usedTitle);
      }
    }

    return totalGenerated;
  }

  /**
   * Generates challenges (10) for a single specific date and language.
   */
  async generateForDate(
    date: Date,
    lang: string = 'en',
    excludeIds: string[] = [],
    excludeTitles: string[] = [],
  ): Promise<{ count: number; usedId: string | null; usedTitle: string | null }> {
    const languageStarters = STARTERS[lang] || STARTERS['en'];
    const dateId = date.toISOString().split('T')[0];

    // Try to find an objective that hasn't been used in this batch (by ID and Title)
    let objective = null;
    let localExcludes = [...excludeIds];

    while (true) {
      const candidate = await this.objectivesRepository.findNextForLang(lang, localExcludes);
      if (!candidate) break;

      if (excludeTitles.includes(candidate.title)) {
        localExcludes.push(candidate.id);
        continue;
      }

      objective = candidate;
      break;
    }

    if (!objective) {
      logger.error(`No unique objectives found in registry for ${lang}. Skipping ${dateId}.`);
      return { count: 0, usedId: null, usedTitle: null };
    }

    const targetTitle = objective.title;

    logger.info(
      `Generating challenges for ${dateId} (Lang: ${lang}, Target: ${targetTitle}, ObjID: ${objective.id})`,
    );

    const targetDescription = (await this.wikipediaFeedService.getPageExtract(lang, targetTitle)) || undefined;

    const poolStart = [...languageStarters].sort(() => Math.random() - 0.5);

    const challengesForDay: SingleChallenge[] = [];
    let attempts = 0;
    const maxAttempts = Math.min(poolStart.length, 50);

    while (challengesForDay.length < 10 && attempts < maxAttempts) {
      const start = poolStart[attempts];
      attempts++;

      if (start === targetTitle) continue;

      // Skip if already in list
      if (challengesForDay.some((c) => c.startTitle === start)) continue;

      const path = await this.findShortestPath(lang, start, targetTitle);
      if (path && path.length > 0) {
        const minClicks = path.length - 1;
        const difficulty = this.calculateDifficulty(minClicks);
        challengesForDay.push({
          id: challengesForDay.length + 1,
          startTitle: start,
          endTitle: targetTitle,
          minClicks,
          difficulty,
          perfectPath: path,
        });
        logger.info(`Found path: ${start} -> ${targetTitle} (${minClicks} clicks, ${difficulty})`);
      }
    }

    // Always mark objective as used to avoid getting stuck on an impossible target
    await this.objectivesRepository.markAsUsed(objective.id);

    if (challengesForDay.length > 0) {
      try {
        const challenge: Challenge = {
          id: dateId,
          lang,
          targetTitle,
          targetDescription,
          challenges: challengesForDay,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.challengesRepository.save(challenge);
        logger.info(
          `Finished ${dateId} (${lang}): ${challengesForDay.length} challenges generated.`,
        );
        return { count: challengesForDay.length, usedId: objective.id, usedTitle: targetTitle };
      } catch (error) {
        logger.error({ msg: 'Failed to save daily challenges', dateId, lang, error });
        return { count: 0, usedId: objective.id, usedTitle: targetTitle };
      }
    }

    logger.warn(
      `Failed to generate any challenges for ${dateId} (Lang: ${lang}, Target: ${targetTitle}) after ${attempts} attempts`,
    );
    return { count: 0, usedId: objective.id, usedTitle: targetTitle };
  }

  public calculateDifficulty(minClicks: number): 'Easy' | 'Medium' | 'Hard' {
    if (minClicks <= 2) return 'Easy';
    if (minClicks <= 4) return 'Medium';
    return 'Hard';
  }

  /**
   * Verifies if a path exists between start and end using Bidirectional BFS.
   * Returns shortest path as an array of titles or null if not found.
   */
  public async findShortestPath(lang: string, start: string, end: string): Promise<string[] | null> {
    if (start === end) return [start];

    const startQueue: string[] = [start];
    const endQueue: string[] = [end];

    const startParents = new Map<string, string | null>([[start, null]]);
    const endParents = new Map<string, string | null>([[end, null]]);

    const startDist = new Map<string, number>([[start, 0]]);
    const endDist = new Map<string, number>([[end, 0]]);

    let startExpanded = 0;
    let endExpanded = 0;
    const expansionLimit = 200;

    while (startQueue.length > 0 && endQueue.length > 0) {
      if (startExpanded >= expansionLimit && endExpanded >= expansionLimit) break;

      // Expand forward
      if (
        startQueue.length > 0 &&
        (startQueue.length <= endQueue.length || endExpanded >= expansionLimit) &&
        startExpanded < expansionLimit
      ) {
        const meetingPoint = await this.expandFrontier(
          lang,
          startQueue,
          startParents,
          startDist,
          endParents,
          'forward',
        );
        startExpanded++;
        if (meetingPoint !== null) {
          return this.reconstructPath(startParents, endParents, meetingPoint);
        }
      } else if (endQueue.length > 0 && endExpanded < expansionLimit) {
        // Expand backward
        const meetingPoint = await this.expandFrontier(
          lang,
          endQueue,
          endParents,
          endDist,
          startParents,
          'backward',
        );
        endExpanded++;
        if (meetingPoint !== null) {
          return this.reconstructPath(startParents, endParents, meetingPoint);
        }
      } else {
        break;
      }
    }

    return null;
  }

  private async expandFrontier(
    lang: string,
    queue: string[],
    parents: Map<string, string | null>,
    distances: Map<string, number>,
    otherParents: Map<string, string | null>,
    direction: 'forward' | 'backward',
  ): Promise<string | null> {
    const current = queue.shift()!;
    const currentDist = distances.get(current) || 0;

    if (currentDist >= 5) return null;

    const neighbors =
      direction === 'forward'
        ? await this.wikipediaFeedService.getLinksForPage(lang, current)
        : await this.wikipediaFeedService.getBacklinksForPage(lang, current);

    for (const neighbor of neighbors) {
      if (otherParents.has(neighbor)) {
        // Meeting point found!
        if (!parents.has(neighbor)) {
          parents.set(neighbor, current);
          distances.set(neighbor, currentDist + 1);
        }
        return neighbor;
      }

      if (!parents.has(neighbor)) {
        parents.set(neighbor, current);
        distances.set(neighbor, currentDist + 1);
        queue.push(neighbor);
      }
    }

    return null;
  }

  private reconstructPath(
    startParents: Map<string, string | null>,
    endParents: Map<string, string | null>,
    meetingPoint: string,
  ): string[] {
    const pathFromStart: string[] = [];
    let current: string | null = meetingPoint;
    while (current !== null) {
      pathFromStart.unshift(current);
      current = startParents.get(current) ?? null;
    }

    const pathFromEnd: string[] = [];
    current = endParents.get(meetingPoint) ?? null;
    while (current !== null) {
      pathFromEnd.push(current);
      current = endParents.get(current) ?? null;
    }

    return [...pathFromStart, ...pathFromEnd];
  }
}
