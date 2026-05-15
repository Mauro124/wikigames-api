import { Request, Response, NextFunction } from 'express';
import { GenerateChallengeUseCase } from '../domain/generate-challenge.usecase';
import { CreateManualChallengeUseCase } from '../domain/create-manual-challenge.usecase';
import { logger } from '@shared/services/logger.service';

export class InternalChallengeController {
  constructor(
    private readonly generateChallengeUseCase: GenerateChallengeUseCase,
    private readonly createManualChallengeUseCase: CreateManualChallengeUseCase,
  ) {}

  async generateMonthlyBatch(req: Request, res: Response): Promise<void> {
    const { startDate, lang = 'en' } = req.body;
    const start = startDate ? new Date(startDate) : new Date();

    if (isNaN(start.getTime())) {
      res.status(400).json({ error: 'Invalid startDate format. Use YYYY-MM-DD.' });
      return;
    }

    try {
      logger.info(
        `Starting monthly challenge generation from ${start.toISOString()} (Lang: ${lang})`,
      );

      this.generateChallengeUseCase
        .generateMonthlyBatch(start, lang)
        .then((total) => logger.info(`Monthly generation complete for ${lang}. Total: ${total}`))
        .catch((err) => logger.error(`Monthly generation failed for ${lang}: ${err.message}`));

      res.status(202).json({
        message: 'Generation started in background.',
        startDate: start.toISOString().split('T')[0],
        lang,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateToday(req: Request, res: Response): Promise<void> {
    const { lang = 'en' } = req.body;
    const today = new Date();

    try {
      logger.info(`Starting daily challenge generation for ${today.toISOString()} (Lang: ${lang})`);

      this.generateChallengeUseCase
        .generateForDate(today, lang)
        .then((result) => logger.info(`Daily generation complete for ${lang}. Total: ${result.count}`))
        .catch((err) => logger.error(`Daily generation failed for ${lang}: ${err.message}`));

      res.status(202).json({
        message: 'Generation started in background.',
        date: today.toISOString().split('T')[0],
        lang,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createManual(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challenge = await this.createManualChallengeUseCase.execute(req.body);

      console.log('Challenge created:', challenge);

      res.status(201).json({
        status: 'success',
        data: challenge,
      });
    } catch (error) {
      next(error);
    }
  }
}
