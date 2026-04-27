import { Router, Request, Response, NextFunction } from 'express';
import { ResultController } from '@features/results/controllers/result.controller';
import { SubmitResultUseCase } from '@features/results/domain/submit-result.usecase';
import { FirestoreResultsRepository } from '@features/results/data/firestore-results.repository';
import { FirestoreChallengesRepository } from '@features/challenges/data/firestore-challenges.repository';
import { FirestoreStatsRepository } from '@features/stats/data/firestore-stats.repository';
import { GetStatsUseCase } from '@features/stats/domain/get-stats.usecase';
import { UpdateUserStatsUseCase } from '@features/users/domain/update-user-stats.usecase';
import { FirestoreUserRepository } from '@features/users/data/firestore-user.repository';
import { ShareVisualizer } from '@features/results/utils/share-visualizer';

const resultRouter = Router();

const provideController = () => {
  const resultsRepository = new FirestoreResultsRepository();
  const challengesRepository = new FirestoreChallengesRepository();
  const statsRepository = new FirestoreStatsRepository();
  const userRepository = new FirestoreUserRepository();

  const updateUserStatsUseCase = new UpdateUserStatsUseCase(userRepository);
  const getStatsUseCase = new GetStatsUseCase(statsRepository);
  const shareVisualizer = new ShareVisualizer();

  const submitResultUseCase = new SubmitResultUseCase(
    resultsRepository,
    challengesRepository,
    statsRepository,
    updateUserStatsUseCase,
    getStatsUseCase,
    shareVisualizer,
  );

  return new ResultController(submitResultUseCase);
};

resultRouter.post(
  '/',
  provideController().validateSubmission,
  (req: Request, res: Response, next: NextFunction) => {
    const controller = provideController();
    return controller.submit(req, res, next);
  },
);

resultRouter.post(
  '/surrender',
  provideController().validateSurrender,
  (req: Request, res: Response, next: NextFunction) => {
    const controller = provideController();
    return controller.surrender(req, res, next);
  },
);

export { resultRouter };
