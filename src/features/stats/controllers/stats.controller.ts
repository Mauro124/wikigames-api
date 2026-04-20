import { Request, Response, NextFunction } from 'express';
import { getStatsUseCase } from '../domain/get-stats.usecase';

export class StatsController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const stats = await getStatsUseCase.execute(id as string);
      if (!stats) {
        return res.status(404).json({ status: 'error', message: 'Stats not found for this challenge' });
      }
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export const statsController = new StatsController();
