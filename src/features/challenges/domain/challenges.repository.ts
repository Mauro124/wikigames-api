import { Challenge } from './challenge.entity';

export interface ChallengesRepository {
  findById(id: string): Promise<Challenge | null>;
  save(challenge: Challenge): Promise<void>;
}
