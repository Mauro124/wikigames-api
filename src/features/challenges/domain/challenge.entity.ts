import { BaseEntity } from '@shared/domain/base.entity';

export interface SingleChallenge {
  id: number;
  startTitle: string;
  endTitle: string;
  minClicks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Challenge extends BaseEntity {
  lang: string;
  categoryStart: string;
  categoryEnd: string;
  challenges: SingleChallenge[];
}
