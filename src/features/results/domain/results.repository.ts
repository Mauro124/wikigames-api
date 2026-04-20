import { GameResult } from './result.entity';

export interface ResultsRepository {
  save(result: GameResult): Promise<void>;
  findByChallenge(challengeId: string): Promise<GameResult[]>;
  exists(challengeId: string, userId: string): Promise<boolean>;
}
