import { DailyStats } from './stats.entity';

export interface StatsRepository {
  findById(id: string): Promise<DailyStats | null>;
  save(stats: DailyStats): Promise<void>;
  incrementStats(
    challengeId: string,
    clicks: number,
    timeSeconds: number,
    isSurrender?: boolean,
  ): Promise<void>;
}
