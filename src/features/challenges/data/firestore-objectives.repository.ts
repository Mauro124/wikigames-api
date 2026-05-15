import { BaseFirestoreRepository } from '@shared/data/base-firestore.repository';
import { Objective } from '../domain/objective.entity';
import { ObjectivesRepository } from '../domain/objectives.repository';
import { logger } from '@shared/services/logger.service';

export class FirestoreObjectivesRepository
  extends BaseFirestoreRepository<Objective>
  implements ObjectivesRepository
{
  constructor(db?: any) {
    super('objectives', db);
  }

  async findNextForLang(lang: string, excludeIds: string[] = []): Promise<Objective | null> {
    const fetchLimit = Math.max(1, excludeIds.length + 1);

    const snapshot = await this.db
      .collection(this.collectionName)
      .where('lang', '==', lang)
      .orderBy('lastUsedAt', 'asc')
      .orderBy('__name__', 'asc')
      .limit(fetchLimit)
      .get();

    if (snapshot.empty) return null;

    for (const doc of snapshot.docs) {
      if (!excludeIds.includes(doc.id)) {
        const objective = this.mapDoc(doc.id, doc.data());
        return objective;
      }
    }

    return null;
  }

  async markAsUsed(id: string): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      logger.error(`Attempted to mark non-existent objective as used: ${id}`);
      return;
    }

    const data = doc.data();
    const currentUsage = data?.usageCount || 0;
    const now = new Date();

    await docRef.update({
      usageCount: currentUsage + 1,
      lastUsedAt: now,
      updatedAt: now,
    });
    
    logger.info(`Objective marked as used: ${id} (New usage count: ${currentUsage + 1})`);
  }

  async save(objective: Objective): Promise<void> {
    await this.create(objective);
  }

  async createBatch(
    objectives: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<void> {
    const batch = this.db.batch();
    const now = new Date();

    for (const obj of objectives) {
      const docRef = this.db.collection(this.collectionName).doc();
      batch.set(docRef, {
        ...obj,
        createdAt: now,
        updatedAt: now,
      });
    }

    await batch.commit();
  }
}
