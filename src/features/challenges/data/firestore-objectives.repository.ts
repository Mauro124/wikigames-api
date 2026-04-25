import { BaseFirestoreRepository } from '@shared/data/base-firestore.repository';
import { Objective } from '../domain/objective.entity';
import { ObjectivesRepository } from '../domain/objectives.repository';

export class FirestoreObjectivesRepository
  extends BaseFirestoreRepository<Objective>
  implements ObjectivesRepository
{
  constructor(db?: any) {
    super('objectives', db);
  }

  async findNextForLang(lang: string): Promise<Objective | null> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where('lang', '==', lang)
      .orderBy('lastUsedAt', 'asc')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return this.mapDoc(doc.id, doc.data());
  }

  async markAsUsed(id: string): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return;

    const data = doc.data();
    const currentUsage = data?.usageCount || 0;

    await docRef.update({
      usageCount: currentUsage + 1,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async save(objective: Objective): Promise<void> {
    await this.create(objective);
  }
}
