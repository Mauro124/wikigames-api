import { BaseEntity } from '@shared/domain/base.entity';

export interface GameResult extends BaseEntity {
  challengeId: string;
  userId: string;
  clicks: number;
  timeSeconds: number;
  path: string[];
}
