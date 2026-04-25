import { Router } from 'express';
import { ResultController } from '@features/results/controllers/result.controller';
import { SubmitResultUseCase } from '@features/results/domain/submit-result.usecase';
import { FirestoreResultsRepository } from '@features/results/data/firestore-results.repository';
import { FirestoreStatsRepository } from '@features/stats/data/firestore-stats.repository';
import { GetStatsUseCase } from '@features/stats/domain/get-stats.usecase';
import { UpdateUserStatsUseCase } from '@features/users/domain/update-user-stats.usecase';
import { FirestoreUserRepository } from '@features/users/data/firestore-user.repository';
import { ShareVisualizer } from '@features/results/utils/share-visualizer';

const resultRouter = Router();

const provideController = () => {
  const resultsRepository = new FirestoreResultsRepository();
  const statsRepository = new FirestoreStatsRepository();
  const userRepository = new FirestoreUserRepository();

  const updateUserStatsUseCase = new UpdateUserStatsUseCase(userRepository);
  const getStatsUseCase = new GetStatsUseCase(statsRepository);
  const shareVisualizer = new ShareVisualizer();

  const submitResultUseCase = new SubmitResultUseCase(
    resultsRepository,
    statsRepository,
    updateUserStatsUseCase,
    getStatsUseCase,
    shareVisualizer,
  );

  return new ResultController(submitResultUseCase);
};

resultRouter.post('/', provideController().validateSubmission, (req, res, next) => {
  const controller = provideController();
  return controller.submit(req, res, next);
});

resultRouter.post('/surrender', provideController().validateSurrender, (req, res, next) => {
  const controller = provideController();
  return controller.surrender(req, res, next);
});

export { resultRouter };
