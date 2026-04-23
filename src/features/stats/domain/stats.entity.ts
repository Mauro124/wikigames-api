import { BaseEntity } from '@shared/domain/base.entity';

export interface DailyStats extends BaseEntity {
  averageClicks: number;
  averageTime: number;
  totalWins: number;
  totalLosses: number;
  sumClicks: number;
  sumTime: number;
  distribution: Record<string, number>;
}
