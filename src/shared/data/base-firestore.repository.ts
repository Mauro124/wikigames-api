import { Firestore, DocumentData, CollectionReference } from '@google-cloud/firestore';
import { db } from '@config/firebase.config';
import { BaseEntity } from '../domain/base.entity';

export abstract class BaseFirestoreRepository<T extends BaseEntity> {
  protected collectionName: string;
  protected db: Firestore = db;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collection(): CollectionReference {
    return this.db.collection(this.collectionName);
  }

  protected mapDoc(id: string, data: DocumentData): T {
    return {
      id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as T;
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return this.mapDoc(doc.id, doc.data()!);
  }

  async create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date();
    const docRef = this.collection.doc();
    const data = {
      ...entity,
      createdAt: now,
      updatedAt: now,
    };
    await docRef.set(data);
    return this.mapDoc(docRef.id, data);
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    const now = new Date();
    const docRef = this.collection.doc(id);
    const data = {
      ...entity,
      updatedAt: now,
    };
    await docRef.update(data);
    const updated = await docRef.get();
    return this.mapDoc(updated.id, updated.data()!);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  protected async persist(id: string, entity: any): Promise<void> {
    const now = new Date();
    const data = {
      ...entity,
      updatedAt: now,
      createdAt: entity.createdAt || now,
    };
    await this.collection.doc(id).set(data);
  }

  async findAll(): Promise<T[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => this.mapDoc(doc.id, doc.data()));
  }
}
