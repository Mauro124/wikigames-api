import { challengesRepository } from '@features/challenges/data/firestore-challenges.repository';
import { admin } from '@config/firebase.config';
import { logger } from '@shared/services/logger.service';

async function seed() {
  const today = new Date().toISOString().split('T')[0];

  const initialChallenge = {
    id: today,
    startTitle: 'Earth',
    endTitle: 'Philosophy',
    lang: 'en',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await challengesRepository.save(initialChallenge);
    logger.info(`Seeded initial challenge for ${today}`);
  } catch (error) {
    logger.error({ msg: 'Seeding failed', error });
  }
}

seed();
