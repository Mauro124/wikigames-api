import { Router } from 'express';
import { StatsController } from '@features/stats/controllers/stats.controller';
import { ChallengeController } from '@features/challenges/controllers/challenge.controller';
import { GetStatsUseCase } from '@features/stats/domain/get-stats.usecase';
import { FirestoreStatsRepository } from '@features/stats/data/firestore-stats.repository';
import { FirestoreChallengesRepository } from '@features/challenges/data/firestore-challenges.repository';

const statsRouter = Router();

statsRouter.get('/today', (req, res, next) => {
  const challengesRepository = new FirestoreChallengesRepository();
  const controller = new ChallengeController(challengesRepository);
  return controller.getToday(req, res, next);
});

statsRouter.get('/', (req, res, next) => {
  const challengesRepository = new FirestoreChallengesRepository();
  const controller = new ChallengeController(challengesRepository);
  return controller.list(req, res, next);
});

statsRouter.get('/:id/stats', (req, res, next) => {
  const statsRepository = new FirestoreStatsRepository();
  const useCase = new GetStatsUseCase(statsRepository);
  const controller = new StatsController(useCase);
  return controller.getStats(req, res, next);
});

export { statsRouter };
