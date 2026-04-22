import { GameResult } from './result.entity';
import { resultsRepository } from '../data/firestore-results.repository';
import { statsRepository } from '@features/stats/data/firestore-stats.repository';
import { getStatsUseCase } from '@features/stats/domain/get-stats.usecase';
import { updateUserStatsUseCase } from '@features/users/domain/update-user-stats.usecase';
import { shareVisualizer } from '../utils/share-visualizer';
import { logger } from '@shared/services/logger.service';
import { AppError } from '@shared/domain/app-error';

export interface SubmitResultResponse {
  success: boolean;
  alreadySubmitted?: boolean;
  shareText?: string;
}

export class SubmitResultUseCase {
  async execute(result: GameResult): Promise<SubmitResultResponse> {
    const { challengeId, userId, clicks, timeSeconds } = result;

    if (!challengeId || !userId) {
      throw new AppError('challengeId and userId are required', 400);
    }

    if (clicks < 1) {
      throw new AppError('clicks must be at least 1', 400);
    }

    if (timeSeconds < 1) {
      throw new AppError('timeSeconds must be at least 1', 400);
    }

    const alreadyExists = await resultsRepository.exists(challengeId, userId);
    if (alreadyExists) {
      logger.info({ msg: 'Duplicate result submission ignored', challengeId, userId });
      return { success: true, alreadySubmitted: true };
    }

    await resultsRepository.save(result);
    
    if (!result.isSurrender) {
      await statsRepository.incrementStats(challengeId, clicks, timeSeconds);
    }

    // Update user persistent stats (streak, records)
    await updateUserStatsUseCase.execute({
      userId,
      challengeId,
      clicks,
      timeSeconds,
      isSurrender: result.isSurrender,
    });

    if (result.isSurrender) {
      logger.info({ msg: 'User surrendered challenge', challengeId, userId });
      return { success: true };
    }

    const stats = await getStatsUseCase.execute(challengeId);
    const avgClicks = stats?.averageClicks || 0;
    const shareText = shareVisualizer.generate(challengeId, clicks, timeSeconds, avgClicks);

    logger.info({ msg: 'Result submitted and stats aggregated', challengeId, userId });
    return { success: true, shareText };
  }
}

export const submitResultUseCase = new SubmitResultUseCase();
