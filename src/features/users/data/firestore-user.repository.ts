import { BaseFirestoreRepository } from '@shared/data/base-firestore.repository';
import { User } from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';

export class FirestoreUserRepository
  extends BaseFirestoreRepository<User>
  implements UserRepository
{
  constructor() {
    super('users');
  }

  async findByUsername(username: string): Promise<User | null> {
    const snapshot = await this.collection.where('username', '==', username).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.mapDoc(doc.id, doc.data());
  }

  async isUsernameUnique(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return user === null;
  }

  async create(user: User): Promise<User> {
    const { id, ...data } = user;
    await this.persist(id, data);
    return user;
  }

  async getLeaderboard(limitCount: number): Promise<User[]> {
    const snapshot = await this.collection
      .where('stats.totalGames', '>', 0)
      .orderBy('stats.totalScore', 'desc')
      .limit(limitCount)
      .get();

    return snapshot.docs.map((doc) => this.mapDoc(doc.id, doc.data()));
  }
}
