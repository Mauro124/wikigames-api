import { statsRepository } from '../data/firestore-stats.repository';
import { DailyStats } from './stats.entity';

export class GetStatsUseCase {
  async execute(challengeId: string): Promise<DailyStats | null> {
    const stats = await statsRepository.findById(challengeId);

    if (!stats) return null;

    return {
      ...stats,
      averageClicks: stats.totalWins > 0 ? Math.round(stats.sumClicks / stats.totalWins) : 0,
      averageTime: stats.totalWins > 0 ? Math.round(stats.sumTime / stats.totalWins) : 0,
    };
  }
}

export const getStatsUseCase = new GetStatsUseCase();
