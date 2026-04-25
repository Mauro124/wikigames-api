import { Challenge, SingleChallenge } from './challenge.entity';
import { wikipediaFeedService } from '../data/wikipedia-feed.service';
import { challengesRepository } from '../data/firestore-challenges.repository';
import { objectivesRepository } from '../data/firestore-objectives.repository';
import { logger } from '@shared/services/logger.service';
import { STARTERS } from './starters';

export class GenerateChallengeUseCase {
  /**
   * Generates 30 days of challenges (10 per day) starting from a specific date and language.
   */
  async generateMonthlyBatch(startDate: Date, lang: string = 'en'): Promise<number> {
    let totalGenerated = 0;

    const languageStarters = STARTERS[lang] || STARTERS['en'];

    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dateId = currentDate.toISOString().split('T')[0];

      const objective = await objectivesRepository.findNextForLang(lang);
      if (!objective) {
        logger.error(`No objectives found in registry for ${lang}. Skipping ${dateId}.`);
        continue;
      }

      const targetTitle = objective.title;

      logger.info(
        `Generating challenges for ${dateId} (Lang: ${lang}, Target: ${targetTitle})`,
      );

      const poolStart = languageStarters;

      const challengesForDay: SingleChallenge[] = [];
      let attempts = 0;
      const maxAttempts = 50;

      while (challengesForDay.length < 10 && attempts < maxAttempts) {
        attempts++;
        const start = poolStart[Math.floor(Math.random() * poolStart.length)];

        if (start === targetTitle) continue;

        // Skip if already in list
        if (challengesForDay.some((c) => c.startTitle === start)) continue;

        const minClicks = await this.findShortestPath(lang, start, targetTitle);
        if (minClicks > 0) {
          const difficulty = this.calculateDifficulty(minClicks);
          challengesForDay.push({
            id: challengesForDay.length + 1,
            startTitle: start,
            endTitle: targetTitle,
            minClicks,
            difficulty,
          });
        }
      }

      if (challengesForDay.length > 0) {
        try {
          const challenge: Challenge = {
            id: dateId,
            lang,
            targetTitle,
            challenges: challengesForDay,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await challengesRepository.save(challenge);
          await objectivesRepository.markAsUsed(objective.id, lang);
          totalGenerated += challengesForDay.length;
          logger.info(
            `Finished ${dateId} (${lang}): ${challengesForDay.length} challenges generated.`,
          );
        } catch (error) {
          logger.error({ msg: 'Failed to save daily challenges', dateId, lang, error });
        }
      }
    }

    return totalGenerated;
  }

  public calculateDifficulty(minClicks: number): 'Easy' | 'Medium' | 'Hard' {
    if (minClicks <= 3) return 'Easy';
    if (minClicks <= 5) return 'Medium';
    return 'Hard';
  }

  /**
   * Verifies if a path exists between start and end using Bidirectional BFS.
   * Returns shortest path length or 0 if not found within limits.
   */
  public async findShortestPath(lang: string, start: string, end: string): Promise<number> {
    const startQueue: string[] = [start];
    const endQueue: string[] = [end];

    const startDist = new Map<string, number>([[start, 0]]);
    const endDist = new Map<string, number>([[end, 0]]);

    const limit = 500; // Max nodes to expand per side

    while (startQueue.length > 0 && endQueue.length > 0) {
      // Expand forward
      if (startQueue.length <= endQueue.length) {
        const result = await this.expandFrontier(
          lang,
          startQueue,
          startDist,
          endDist,
          'forward',
          limit,
        );
        if (result !== -1) return result;
      } else {
        // Expand backward
        const result = await this.expandFrontier(
          lang,
          endQueue,
          endDist,
          startDist,
          'backward',
          limit,
        );
        if (result !== -1) return result;
      }

      if (startDist.size > limit || endDist.size > limit) break;
    }

    return 0;
  }

  private async expandFrontier(
    lang: string,
    queue: string[],
    distances: Map<string, number>,
    otherDistances: Map<string, number>,
    direction: 'forward' | 'backward',
    limit: number,
  ): Promise<number> {
    const current = queue.shift()!;
    const currentDist = distances.get(current)!;

    if (currentDist >= 6) return -1;

    const neighbors =
      direction === 'forward'
        ? await wikipediaFeedService.getLinksForPage(lang, current)
        : await wikipediaFeedService.getBacklinksForPage(lang, current);

    for (const neighbor of neighbors) {
      if (otherDistances.has(neighbor)) {
        return currentDist + 1 + otherDistances.get(neighbor)!;
      }

      if (!distances.has(neighbor)) {
        distances.set(neighbor, currentDist + 1);
        queue.push(neighbor);
      }

      if (distances.size > limit) break;
    }

    return -1;
  }
}

export const generateChallengeUseCase = new GenerateChallengeUseCase();
