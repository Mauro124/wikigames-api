import { BaseFirestoreRepository } from '@shared/data/base-firestore.repository';
import { Challenge } from '../domain/challenge.entity';
import { ChallengesRepository } from '../domain/challenges.repository';

export class FirestoreChallengesRepository
  extends BaseFirestoreRepository<Challenge>
  implements ChallengesRepository
{
  constructor() {
    super('challenges');
  }

  async save(challenge: Challenge): Promise<void> {
    const { id, ...data } = challenge;
    await this.persist(id, data);
  }
}

export const challengesRepository = new FirestoreChallengesRepository();
