import { GameResult } from './result.entity';
import { resultsRepository } from '../data/firestore-results.repository';
import { statsRepository } from '@features/stats/data/firestore-stats.repository';
import { logger } from '@shared/services/logger.service';

export class SubmitResultUseCase {
  async execute(result: GameResult): Promise<void> {
    const { challengeId, userId, clicks, timeSeconds } = result;

    const alreadyExists = await resultsRepository.exists(challengeId, userId);
    if (alreadyExists) {
      logger.info({ msg: 'Duplicate result submission ignored', challengeId, userId });
      return;
    }

    await resultsRepository.save(result);
    await statsRepository.incrementStats(challengeId, clicks, timeSeconds);
    
    logger.info({ msg: 'Result submitted and stats aggregated', challengeId, userId });
  }
}

export const submitResultUseCase = new SubmitResultUseCase();
