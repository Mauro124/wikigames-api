import { Objective } from './objective.entity';

export interface ObjectivesRepository {
  findNextForLang(lang: string): Promise<Objective | null>;
  markAsUsed(id: string): Promise<void>;
  save(objective: Objective): Promise<void>;
}
