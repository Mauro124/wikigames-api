import { BaseFirestoreRepository } from '@shared/data/base-firestore.repository';
import { DailyStats } from '../domain/stats.entity';
import { StatsRepository } from '../domain/stats.repository';
import { admin } from '@config/firebase.config';

export class FirestoreStatsRepository
  extends BaseFirestoreRepository<DailyStats>
  implements StatsRepository
{
  constructor() {
    super('stats');
  }

  async save(stats: DailyStats): Promise<void> {
    const { id, ...data } = stats;
    await this.persist(id, data);
  }

  async incrementStats(
    challengeId: string,
    clicks: number,
    timeSeconds: number,
    isSurrender = false,
  ): Promise<void> {
    const docRef = this.collection.doc(challengeId);

    if (isSurrender) {
      await docRef.set(
        {
          totalLosses: admin.firestore.FieldValue.increment(1),
          updatedAt: new Date(),
        },
        { merge: true },
      );
      return;
    }

    // Bucket clicks: cap at 20
    const bucket = clicks > 20 ? '20plus' : clicks.toString();

    await docRef.set(
      {
        totalWins: admin.firestore.FieldValue.increment(1),
        sumClicks: admin.firestore.FieldValue.increment(clicks),
        sumTime: admin.firestore.FieldValue.increment(timeSeconds),
        [`distribution.${bucket}`]: admin.firestore.FieldValue.increment(1),
        updatedAt: new Date(),
      },
      { merge: true },
    );
  }
}
