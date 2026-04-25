import { Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';
import { RegisterUserUseCase } from '../domain/register-user.usecase';
import { GetUserUseCase } from '../domain/get-user.usecase';
import { UpdateUserUseCase } from '../domain/update-user.usecase';
import { DeleteUserUseCase } from '../domain/delete-user.usecase';
import { UserRepository } from '../domain/user.repository';
import { AuthRequest } from '@middleware/verify-auth.middleware';

export class UserController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly userRepository: UserRepository,
  ) {}

  validateRegistration = [
    body('username')
      .isString()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/),
  ];

  validateUpdate = [
    body('username')
      .optional()
      .isString()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/),
  ];

  async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ status: 'error', errors: errors.array() });
      return;
    }

    const uid = req.user?.uid;
    const email = req.user?.email;

    if (!uid || !email) {
      res.status(401).json({ status: 'error', message: 'Unauthorized or missing email in token' });
      return;
    }

    try {
      const user = await this.registerUserUseCase.execute({
        id: uid,
        username: req.body.username,
        email,
      });

      res.status(201).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const uid = req.params.uid as string;

    try {
      const user = await this.getUserUseCase.execute(uid);

      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const uid = req.params.uid as string;

    try {
      const user = await this.getUserUseCase.execute(uid);

      res.status(200).json({
        status: 'success',
        data: user.stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userRepository.getLeaderboard(50);
      const data = users.map((u) => ({
        username: u.username,
        avatarSvg: u.avatarSvg,
        totalScore: u.stats.totalScore,
        longestStreak: u.stats.longestStreak,
      }));

      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ status: 'error', errors: errors.array() });
      return;
    }

    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    try {
      const user = await this.updateUserUseCase.execute(uid, req.body);

      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    try {
      await this.deleteUserUseCase.execute(uid);

      res.status(200).json({
        status: 'success',
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
