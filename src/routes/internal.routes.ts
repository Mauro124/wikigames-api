import { Router } from 'express';
import { InternalChallengeController } from '@features/challenges/controllers/internal-challenge.controller';
import { GenerateChallengeUseCase } from '@features/challenges/domain/generate-challenge.usecase';
import { CreateManualChallengeUseCase } from '@features/challenges/domain/create-manual-challenge.usecase';
import { WikipediaFeedService } from '@features/challenges/data/wikipedia-feed.service';
import { FirestoreChallengesRepository } from '@features/challenges/data/firestore-challenges.repository';
import { FirestoreObjectivesRepository } from '@features/challenges/data/firestore-objectives.repository';
import { authMiddleware } from '@middleware/auth.middleware';

const internalRouter = Router();

const provideController = () => {
  const wikipediaFeedService = new WikipediaFeedService();
  const challengesRepository = new FirestoreChallengesRepository();
  const objectivesRepository = new FirestoreObjectivesRepository();

  const generateChallengeUseCase = new GenerateChallengeUseCase(
    wikipediaFeedService,
    challengesRepository,
    objectivesRepository,
  );

  const createManualChallengeUseCase = new CreateManualChallengeUseCase(
    generateChallengeUseCase,
    challengesRepository,
  );

  return new InternalChallengeController(generateChallengeUseCase, createManualChallengeUseCase);
};

internalRouter.post(
  '/challenges/generate/today',
  authMiddleware,
  (req, res, next) => {
    const controller = provideController();
    return controller.generateToday(req, res);
  },
);

internalRouter.post(
  '/challenges/generate',
  authMiddleware,
  (req, res, next) => {
    const controller = provideController();
    return controller.generateMonthlyBatch(req, res);
  },
);

internalRouter.post(
  '/challenges',
  authMiddleware,
  (req, res, next) => {
    const controller = provideController();
    return controller.createManual(req, res, next);
  },
);

export { internalRouter };
