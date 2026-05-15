import { BaseEntity } from '@shared/domain/base.entity';

export interface SingleChallenge {
  id: number;
  startTitle: string;
  endTitle: string;
  minClicks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  perfectPath: string[];
}

export interface Challenge extends BaseEntity {
  lang: string;
  targetTitle: string;
  targetDescription?: string;
  challenges: SingleChallenge[];
}
