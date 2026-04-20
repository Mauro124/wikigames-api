import { BaseEntity } from '@shared/domain/base.entity';

export interface SingleChallenge {
  startTitle: string;
  endTitle: string;
}

export interface Challenge extends BaseEntity {
  lang: string;
  category: string;
  challenges: SingleChallenge[];
}
