import { DateTime } from 'luxon';
import { wikipediaFeedService } from '../data/wikipedia-feed.service';
import { challengesRepository } from '../data/firestore-challenges.repository';
import { logger } from '@shared/services/logger.service';
import { Challenge } from './challenge.entity';

export class GenerateChallengeUseCase {
  private FORBIDDEN_KEYWORDS = [
    'Main_Page',
    'List_of',
    'File:',
    'Category:',
    'Portal:',
    'Special:',
    'Template:',
  ];

  async execute(dateStr?: string, force = false): Promise<Challenge> {
    const targetDate = dateStr ? DateTime.fromISO(dateStr) : DateTime.now().plus({ days: 1 });
    const id = targetDate.toFormat('yyyy-MM-dd');
    const datePath = targetDate.toFormat('yyyy/MM/dd');

    // 1. Check if already exists
    const existing = await challengesRepository.findById(id);
    if (existing && !force) {
      logger.info({ msg: 'Challenge already exists, skipping', id });
      return existing;
    }

    // 2. Fetch Feed
    const feed = await wikipediaFeedService.fetchFeed(datePath);

    // 3. Selection & Filtering
    // Wikipedia sometimes doesn't have 'mostread' for very early UTC hours. 
    // Fallback to Featured Article or a generic start if mostread is missing.
    let startTitle = 'Earth'; // Hardcoded safe fallback

    if (feed.mostread && feed.mostread.articles && feed.mostread.articles.length > 0) {
      const filteredStart = feed.mostread.articles
        .map((a) => a.article)
        .filter((title) => !this.FORBIDDEN_KEYWORDS.some((k) => title.includes(k)));

      if (filteredStart.length > 0) {
        startTitle = filteredStart[0];
      }
    } else {
      logger.warn({ msg: 'Mostread missing in feed, using fallback startTitle', id });
    }

    const endTitle = feed.tfa?.title || 'Philosophy';

    const challenge: Challenge = {
      id,
      startTitle,
      endTitle,
      lang: 'en',
      createdAt: new Date(),
    };

    await challengesRepository.save(challenge);
    logger.info({ msg: 'New challenge generated', id, startTitle, endTitle });

    return challenge;
  }
}

export const generateChallengeUseCase = new GenerateChallengeUseCase();
