import { Router, Request, Response, NextFunction } from 'express';
import { InternalChallengeController } from '@features/challenges/controllers/internal-challenge.controller';
import { ObjectiveController } from '@features/challenges/controllers/objective.controller';
import { GenerateChallengeUseCase } from '@features/challenges/domain/generate-challenge.usecase';
import { CreateManualChallengeUseCase } from '@features/challenges/domain/create-manual-challenge.usecase';
import { WikipediaFeedService } from '@features/challenges/data/wikipedia-feed.service';
import { FirestoreChallengesRepository } from '@features/challenges/data/firestore-challenges.repository';
import { FirestoreObjectivesRepository } from '@features/challenges/data/firestore-objectives.repository';
import { authMiddleware } from '@middleware/auth.middleware';

const internalRouter = Router();

const provideChallengeController = () => {
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

const provideObjectiveController = () => {
  const objectivesRepository = new FirestoreObjectivesRepository();
  return new ObjectiveController(objectivesRepository);
};

// --- Challenges Generation Routes ---

internalRouter.post('/challenges/generate/today', authMiddleware, (req: Request, res: Response) => {
  const controller = provideChallengeController();
  return controller.generateToday(req, res);
});

internalRouter.post('/challenges/generate', authMiddleware, (req: Request, res: Response) => {
  const controller = provideChallengeController();
  return controller.generateMonthlyBatch(req, res);
});

internalRouter.post(
  '/challenges',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    const controller = provideChallengeController();
    return controller.createManual(req, res, next);
  },
);

// --- Objectives Management Routes ---

internalRouter.get('/objectives', authMiddleware, (req: Request, res: Response) => {
  const controller = provideObjectiveController();
  return controller.list(req, res, () => {});
});

internalRouter.post('/objectives', authMiddleware, (req: Request, res: Response) => {
  const controller = provideObjectiveController();
  return controller.create(req, res, () => {});
});

internalRouter.post('/objectives/batch', authMiddleware, (req: Request, res: Response) => {
  const controller = provideObjectiveController();
  return controller.createBatch(req, res, () => {});
});

internalRouter.delete('/objectives/:id', authMiddleware, (req: Request, res: Response) => {
  const controller = provideObjectiveController();
  return controller.delete(req, res, () => {});
});

export { internalRouter };
