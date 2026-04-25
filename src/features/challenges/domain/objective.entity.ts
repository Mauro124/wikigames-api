import { BaseEntity } from '@shared/domain/base.entity';

export interface Objective extends BaseEntity {
  title: string;
  lang: string;
  usageCount: number;
  lastUsedAt: Date | null;
}
