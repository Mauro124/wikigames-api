import { StatsRepository } from './stats.repository';
import { DailyStats } from './stats.entity';

export class GetStatsUseCase {
  constructor(private readonly statsRepository: StatsRepository) {}

  async execute(challengeId: string): Promise<DailyStats | null> {
    const stats = await this.statsRepository.findById(challengeId);

    if (!stats) return null;

    return {
      ...stats,
      averageClicks: stats.totalWins > 0 ? Math.round(stats.sumClicks / stats.totalWins) : 0,
      averageTime: stats.totalWins > 0 ? Math.round(stats.sumTime / stats.totalWins) : 0,
    };
  }
}
