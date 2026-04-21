import { Request, Response, NextFunction } from 'express';
import { generateChallengeUseCase } from '../domain/generate-challenge.usecase';
import { createManualChallengeUseCase } from '../domain/create-manual-challenge.usecase';
import { logger } from '@shared/services/logger.service';

export class InternalChallengeController {
  async generateMonthlyBatch(req: Request, res: Response): Promise<void> {
    const { startDate } = req.body;
    const start = startDate ? new Date(startDate) : new Date();

    if (isNaN(start.getTime())) {
      res.status(400).json({ error: 'Invalid startDate format. Use YYYY-MM-DD.' });
      return;
    }

    try {
      logger.info(`Starting monthly challenge generation from ${start.toISOString()}`);

      // We run this without awaiting to return a 202 Accepted, as it takes time.
      // In a real prod environment, this should be a background job.
      generateChallengeUseCase
        .generateMonthlyBatch(start)
        .then((total) => logger.info(`Monthly generation complete. Total: ${total}`))
        .catch((err) => logger.error(`Monthly generation failed: ${err.message}`));

      res.status(202).json({
        message: 'Generation started in background.',
        startDate: start.toISOString().split('T')[0],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createManual(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challenge = await createManualChallengeUseCase.execute(req.body);

      res.status(201).json({
        status: 'success',
        data: challenge,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const internalChallengeController = new InternalChallengeController();
