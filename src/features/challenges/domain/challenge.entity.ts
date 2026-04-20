import { BaseEntity } from '@shared/domain/base.entity';

export interface Challenge extends BaseEntity {
  startTitle: string;
  endTitle: string;
  lang: string;
  category: string;
}
