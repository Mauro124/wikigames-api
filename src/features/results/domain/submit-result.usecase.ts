import { GameResult } from './result.entity';
import { resultsRepository } from '../data/firestore-results.repository';
import { statsRepository } from '@features/stats/data/firestore-stats.repository';
import { logger } from '@shared/services/logger.service';
import { AppError } from '@shared/domain/app-error';

export interface SubmitResultResponse {
  success: boolean;
  alreadySubmitted?: boolean;
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
    await statsRepository.incrementStats(challengeId, clicks, timeSeconds);

    logger.info({ msg: 'Result submitted and stats aggregated', challengeId, userId });
    return { success: true };
  }
}

export const submitResultUseCase = new SubmitResultUseCase();
