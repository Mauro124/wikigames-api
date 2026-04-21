import { User } from './user.entity';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  isUsernameUnique(username: string): Promise<boolean>;
  getLeaderboard(limit: number): Promise<User[]>;
}
