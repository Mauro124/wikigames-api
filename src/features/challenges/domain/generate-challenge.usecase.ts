import { Challenge } from './challenge.entity';
import { wikipediaFeedService } from '../data/wikipedia-feed.service';
import { challengesRepository } from '../data/firestore-challenges.repository';
import { CATEGORIES } from './categories';
import { logger } from '@shared/services/logger.service';

export class GenerateChallengeUseCase {
  /**
   * Generates 30 days of challenges (10 per day) starting from a specific date.
   */
  async generateMonthlyBatch(startDate: Date): Promise<number> {
    let totalGenerated = 0;
    const lang = 'en';

    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dateId = currentDate.toISOString().split('T')[0];

      // Assign one category per day (wrap around if CATEGORIES.length < 30)
      const category = CATEGORIES[day % CATEGORIES.length];
      logger.info(`Generating challenges for ${dateId} (Category: ${category})`);

      const pool = await wikipediaFeedService.getRandomArticlesFromCategory(lang, category, 100);

      if (pool.length < 2) {
        logger.warn(`Pool for category ${category} too small. Skipping.`);
        continue;
      }

      let challengesForDay = 0;
      let attempts = 0;
      const maxAttempts = 50;

      while (challengesForDay < 10 && attempts < maxAttempts) {
        attempts++;
        const start = pool[Math.floor(Math.random() * pool.length)];
        const end = pool[Math.floor(Math.random() * pool.length)];

        if (start === end) continue;

        const reachable = await this.isReachable(lang, start, end);
        if (reachable) {
          const challenge: Challenge = {
            id: `${dateId}_${challengesForDay}`,
            startTitle: start,
            endTitle: end,
            lang,
            category,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await challengesRepository.save(challenge);
          challengesForDay++;
          totalGenerated++;
        }
      }

      logger.info(`Finished ${dateId}: ${challengesForDay} challenges generated.`);
    }

    return totalGenerated;
  }

  /**
   * Verifies if a path exists between start and end within 6 clicks using BFS.
   */
  async isReachable(lang: string, start: string, end: string): Promise<boolean> {
    const queue: string[] = [start];
    const visited = new Set<string>([start]);
    const depth = new Map<string, number>([[start, 0]]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDepth = depth.get(current)!;

      if (currentDepth >= 6) continue;

      const links = await wikipediaFeedService.getLinksForPage(lang, current);

      for (const link of links) {
        if (link === end) return true;
        if (!visited.has(link)) {
          visited.add(link);
          depth.set(link, currentDepth + 1);
          queue.push(link);
        }
        // Early exit for BFS breadth to avoid memory issues
        if (queue.length > 1000) break;
      }
      if (queue.length > 1000) break;
    }

    return false;
  }
}

export const generateChallengeUseCase = new GenerateChallengeUseCase();
