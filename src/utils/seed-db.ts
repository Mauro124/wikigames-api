import { challengesRepository } from '@features/challenges/data/firestore-challenges.repository';
import { logger } from '@shared/services/logger.service';

async function seed() {
  const today = new Date().toISOString().split('T')[0];

  const initialChallenge = {
    id: today,
    lang: 'en',
    targetTitle: 'Philosophy',
    challenges: [
      {
        id: 1,
        startTitle: 'Earth',
        endTitle: 'Philosophy',
        minClicks: 3,
        difficulty: 'Easy' as const,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await challengesRepository.save(initialChallenge);
    logger.info(`Seeded initial challenge for ${today}`);
  } catch (error) {
    logger.error({ msg: 'Seeding failed', error });
  }
}

seed();
