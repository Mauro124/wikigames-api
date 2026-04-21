import { Router } from 'express';
import { userController } from './controllers/user.controller';
import { verifyAuth } from '@middleware/verify-auth.middleware';

const router = Router();

/**
 * @route POST /users
 * @desc Register a new user
 * @access Private (Firebase Auth)
 */
router.post(
  '/',
  verifyAuth as any,
  userController.validateRegistration,
  userController.register.bind(userController)
);

/**
 * @route GET /users/leaderboard
 * @desc Fetch top players
 * @access Public
 */
router.get('/leaderboard', userController.getLeaderboard.bind(userController));

/**
 * @route GET /users/:uid

 * @desc Fetch user profile
 * @access Public
 */
router.get('/:uid', userController.getProfile.bind(userController));

/**
 * @route GET /users/:uid/stats
 * @desc Fetch user statistics
 * @access Public
 */
router.get('/:uid/stats', userController.getStats.bind(userController));

/**
 * @route PATCH /users/me
 * @desc Update current user profile
 * @access Private (Firebase Auth)
 */
router.patch(
  '/me',
  verifyAuth as any,
  userController.validateUpdate,
  userController.updateProfile.bind(userController),
);

export { router as userRouter };
