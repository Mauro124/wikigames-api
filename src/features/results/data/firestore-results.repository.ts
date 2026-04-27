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
    const { userId, challengeId } = result;
    const docRef = this.db.collection('users').doc(userId).collection('results').doc(challengeId);
    await docRef.set({
      ...result,
      updatedAt: new Date(),
      createdAt: result.createdAt || new Date(),
    });
  }

  async findByChallenge(challengeId: string): Promise<GameResult[]> {
    const snapshot = await this.db
      .collectionGroup('results')
      .where('challengeId', '==', challengeId)
      .get();
    return snapshot.docs.map((doc) => this.mapDoc(doc.id, doc.data()));
  }

  async exists(challengeId: string, userId: string): Promise<boolean> {
    const doc = await this.db
      .collection('users')
      .doc(userId)
      .collection('results')
      .doc(challengeId)
      .get();
    return doc.exists;
  }
}
