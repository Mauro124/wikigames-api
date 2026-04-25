import { Router } from 'express';
import { UserController } from '@features/users/controllers/user.controller';
import { RegisterUserUseCase } from '@features/users/domain/register-user.usecase';
import { GetUserUseCase } from '@features/users/domain/get-user.usecase';
import { UpdateUserUseCase } from '@features/users/domain/update-user.usecase';
import { DeleteUserUseCase } from '@features/users/domain/delete-user.usecase';
import { FirestoreUserRepository } from '@features/users/data/firestore-user.repository';
import { verifyAuth } from '@middleware/verify-auth.middleware';

const router = Router();

const provideController = () => {
  const userRepository = new FirestoreUserRepository();
  const registerUserUseCase = new RegisterUserUseCase(userRepository);
  const getUserUseCase = new GetUserUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository);
  const deleteUserUseCase = new DeleteUserUseCase(userRepository);
  return new UserController(
    registerUserUseCase,
    getUserUseCase,
    updateUserUseCase,
    deleteUserUseCase,
    userRepository,
  );
};

router.post(
  '/',
  verifyAuth as any,
  provideController().validateRegistration,
  (req: any, res: any, next: any) => {
    const controller = provideController();
    return controller.register(req, res, next);
  },
);

router.get('/leaderboard', (req, res, next) => {
  const controller = provideController();
  return controller.getLeaderboard(req, res, next);
});

router.get('/:uid', (req, res, next) => {
  const controller = provideController();
  return controller.getProfile(req, res, next);
});

router.get('/:uid/stats', (req, res, next) => {
  const controller = provideController();
  return controller.getStats(req, res, next);
});

router.patch(
  '/me',
  verifyAuth as any,
  provideController().validateUpdate,
  (req: any, res: any, next: any) => {
    const controller = provideController();
    return controller.updateProfile(req, res, next);
  },
);

router.delete('/me', verifyAuth as any, (req: any, res: any, next: any) => {
  const controller = provideController();
  return controller.deleteAccount(req, res, next);
});

export { router as userRouter };
