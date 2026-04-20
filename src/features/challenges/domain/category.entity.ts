import { BaseEntity } from '@shared/domain/base.entity';

export interface Category extends BaseEntity {
  name: string;
  active: boolean;
}
