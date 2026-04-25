import { Challenge } from './challenge.entity';

export interface ChallengesRepository {
  findById(id: string): Promise<Challenge | null>;
  findByIdAndLang(id: string, lang: string): Promise<Challenge | null>;
  findAllByLang(lang: string): Promise<Challenge[]>;
  save(challenge: Challenge): Promise<void>;
}
