import { Request, Response, NextFunction } from 'express';
import { GetStatsUseCase } from '../domain/get-stats.usecase';

export class StatsController {
  constructor(private readonly getStatsUseCase: GetStatsUseCase) {}

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    try {
      const stats = await this.getStatsUseCase.execute(id as string);
      if (!stats) {
        res.status(404).json({ status: 'error', message: 'Stats not found for this challenge' });
        return;
      }
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}
