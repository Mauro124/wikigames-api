import { CollectionReference, DocumentData } from '@google-cloud/firestore';
import { BaseFirestoreRepository } from '@shared/data/base-firestore.repository';
import { Challenge } from '../domain/challenge.entity';
import { ChallengesRepository } from '../domain/challenges.repository';

export class FirestoreChallengesRepository
  extends BaseFirestoreRepository<Challenge>
  implements ChallengesRepository
{
  constructor(db?: any) {
    super('challenges', db);
  }

  /**
   * Overrides base collection to provide language-scoped collection.
   * Path: challenges/{lang}/daily
   */
  private getLangCollection(lang: string): CollectionReference {
    return this.db.collection(this.collectionName).doc(lang).collection('daily');
  }

  async save(challenge: Challenge): Promise<void> {
    const { id, lang, ...data } = challenge;
    // Store in challenges/{lang}/daily/{dateId}
    await this.getLangCollection(lang)
      .doc(id)
      .set({
        ...data,
        lang, // Keep lang in document for convenience
        updatedAt: new Date(),
        createdAt: data.createdAt || new Date(),
      });
  }

  async findByIdAndLang(id: string, lang: string): Promise<Challenge | null> {
    const doc = await this.getLangCollection(lang).doc(id).get();
    if (!doc.exists) return null;
    return this.mapDoc(doc.id, doc.data() as DocumentData);
  }

  async findAllByLang(lang: string): Promise<Challenge[]> {
    const snapshot = await this.getLangCollection(lang).get();
    return snapshot.docs.map((doc) => this.mapDoc(doc.id, doc.data() as DocumentData));
  }
}
