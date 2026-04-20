import { db, admin } from '@config/firebase.config';

export abstract class BaseFirestoreRepository<T extends { id?: string }> {
  constructor(protected collectionName: string) {}

  protected get collection() {
    return db.collection(this.collectionName);
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T;
  }

  protected async persist(id: string, data: Omit<T, 'id'>): Promise<void> {
    await this.collection.doc(id).set(
      {
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
