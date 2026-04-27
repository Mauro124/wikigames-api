import { Objective } from './objective.entity';

export interface ObjectivesRepository {
  findNextForLang(lang: string): Promise<Objective | null>;
  markAsUsed(id: string): Promise<void>;
  save(objective: Objective): Promise<void>;
  findAll(): Promise<Objective[]>;
  create(objective: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>): Promise<Objective>;
  createBatch(objectives: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void>;
  delete(id: string): Promise<void>;
}
