import { BaseFirestoreRepository } from '@shared/data/base-firestore.repository';
import { GameResult } from '../domain/result.entity';
import { ResultsRepository } from '../domain/results.repository';

export class FirestoreResultsRepository
  extends BaseFirestoreRepository<GameResult>
  implements ResultsRepository
{
  constructor() {
    super('results');
  }

  async save(result: GameResult): Promise<void> {
    const id = `${result.challengeId}_${result.userId}`;
    await this.persist(id, result);
  }

  async findByChallenge(challengeId: string): Promise<GameResult[]> {
    const snapshot = await this.collection.where('challengeId', '==', challengeId).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as GameResult);
  }

  async exists(challengeId: string, userId: string): Promise<boolean> {
    const id = `${challengeId}_${userId}`;
    const doc = await this.collection.doc(id).get();
    return doc.exists;
  }
}

export const resultsRepository = new FirestoreResultsRepository();
