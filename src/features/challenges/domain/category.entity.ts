import { BaseEntity } from '@shared/domain/base.entity';

export interface Category extends BaseEntity {
  name: string; // Internal name (English)
  localNames?: Record<string, string>; // { "es": "Ciencia", "en": "Science" }
  active: boolean;
}
