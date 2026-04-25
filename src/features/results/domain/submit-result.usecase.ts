import { GameResult } from './result.entity';
import { ResultsRepository } from './results.repository';
import { StatsRepository } from '@features/stats/domain/stats.repository';
import { GetStatsUseCase } from '@features/stats/domain/get-stats.usecase';
import { UpdateUserStatsUseCase } from '@features/users/domain/update-user-stats.usecase';
import { ShareVisualizer } from '../utils/share-visualizer';
import { logger } from '@shared/services/logger.service';
import { AppError } from '@shared/domain/app-error';

export interface SubmitResultResponse {
  success: boolean;
  alreadySubmitted?: boolean;
  shareText?: string;
}

export class SubmitResultUseCase {
  constructor(
    private readonly resultsRepository: ResultsRepository,
    private readonly statsRepository: StatsRepository,
    private readonly updateUserStatsUseCase: UpdateUserStatsUseCase,
    private readonly getStatsUseCase: GetStatsUseCase,
    private readonly shareVisualizer: ShareVisualizer,
  ) {}

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

    const alreadyExists = await this.resultsRepository.exists(challengeId, userId);
    if (alreadyExists) {
      logger.info({ msg: 'Duplicate result submission ignored', challengeId, userId });
      return { success: true, alreadySubmitted: true };
    }

    await this.resultsRepository.save(result);

    await this.statsRepository.incrementStats(challengeId, clicks, timeSeconds, result.isSurrender);

    // Update user persistent stats (streak, records)
    await this.updateUserStatsUseCase.execute({
      userId,
      challengeId,
      lang: result.lang,
      clicks,
      timeSeconds,
      isSurrender: result.isSurrender,
    });

    if (result.isSurrender) {
      logger.info({ msg: 'User surrendered challenge', challengeId, userId });
      return { success: true };
    }

    const stats = await this.getStatsUseCase.execute(challengeId);
    const avgClicks = stats?.averageClicks || 0;
    const shareText = this.shareVisualizer.generate(challengeId, clicks, timeSeconds, avgClicks);

    logger.info({ msg: 'Result submitted and stats aggregated', challengeId, userId });
    return { success: true, shareText };
  }
}
