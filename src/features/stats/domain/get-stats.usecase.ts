import { statsRepository } from '../data/firestore-stats.repository';
import { DailyStats } from './stats.entity';

export class GetStatsUseCase {
  async execute(challengeId: string): Promise<DailyStats | null> {
    const stats = await statsRepository.findById(challengeId);

    if (!stats) return null;

    // Calculate pro-rates for the client
    return {
      ...stats,
      averageClicks:
        stats.totalWins > 0 ? Number((stats.sumClicks / stats.totalWins).toFixed(2)) : 0,
      averageTime: stats.totalWins > 0 ? Number((stats.sumTime / stats.totalWins).toFixed(0)) : 0,
    };
  }
}

export const getStatsUseCase = new GetStatsUseCase();
