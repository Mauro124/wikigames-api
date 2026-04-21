import { BaseEntity } from '@shared/domain/base.entity';

export interface User extends BaseEntity {
  username: string;
  email: string;
  avatarSvg: string;
}
