import { challengesRepository } from '@features/challenges/data/firestore-challenges.repository';
import { categoriesRepository } from '@features/challenges/data/firestore-categories.repository';
import { logger } from '@shared/services/logger.service';

async function seed() {
  // Seed Categories
  const categories = [
    { id: 'sci', name: 'Science', localNames: { en: 'Science', es: 'Ciencia' }, active: true },
    { id: 'hist', name: 'History', localNames: { en: 'History', es: 'Historia' }, active: true },
    { id: 'geo', name: 'Geography', localNames: { en: 'Geography', es: 'Geografía' }, active: true },
  ];

  for (const cat of categories) {
    await categoriesRepository.save(cat as any);
  }

  const today = new Date().toISOString().split('T')[0];
...

  const initialChallenge = {
    id: today,
    lang: 'en',
    categoryStart: 'Seed',
    categoryEnd: 'Seed',
    challenges: [{ id: 1, startTitle: 'Earth', endTitle: 'Philosophy', minClicks: 3, difficulty: 'Easy' as const }],
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
