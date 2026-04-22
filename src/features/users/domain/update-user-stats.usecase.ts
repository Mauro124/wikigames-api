import { userRepository } from '../data/firestore-user.repository';
import { logger } from '@shared/services/logger.service';

export interface UpdateStatsDto {
  userId: string;
  challengeId: string; // YYYY-MM-DD
  clicks: number;
  timeSeconds: number;
  isSurrender?: boolean;
}

export class UpdateUserStatsUseCase {
  async execute(dto: UpdateStatsDto): Promise<void> {
    const { userId, challengeId, clicks, timeSeconds, isSurrender } = dto;

    const user = await userRepository.findById(userId);
    if (!user) {
      logger.warn({ msg: 'User not found for stats update', userId });
      return;
    }

    const stats = user.stats;
    const lastDate = stats.lastPlayedDate;

    // Scoring Algorithm (MVP)
    let raceScore = 0;
    if (!isSurrender) {
      const basePoints = 500;
      const efficiencyBonus = Math.floor((100 / clicks) * 10);
      const speedBonus = Math.floor((300 / timeSeconds) * 5);
      raceScore = Math.max(550, basePoints + efficiencyBonus + speedBonus);
    }

    let newStreak = stats.currentStreak;

    if (isSurrender) {
      newStreak = 0; // Surrendering breaks the streak
    } else if (!lastDate) {
      newStreak = 1;
    } else {
      const last = new Date(lastDate);
      const current = new Date(challengeId);
      const diffTime = current.getTime() - last.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // If diffDays === 0 (same day), streak doesn't change
    }

    const updatedStats = {
      ...stats,
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      bestTimeSeconds: isSurrender
        ? stats.bestTimeSeconds
        : stats.bestTimeSeconds === null
          ? timeSeconds
          : Math.min(stats.bestTimeSeconds, timeSeconds),
      bestClicks: isSurrender
        ? stats.bestClicks
        : stats.bestClicks === null
          ? clicks
          : Math.min(stats.bestClicks, clicks),
      totalGames: stats.totalGames + 1,
      totalScore: (stats.totalScore || 0) + raceScore,
      lastPlayedDate: challengeId,
    };

    await userRepository.update(userId, { stats: updatedStats });
    logger.info({ msg: 'User stats and score updated', userId, newStreak, raceScore });
  }
}

export const updateUserStatsUseCase = new UpdateUserStatsUseCase();
