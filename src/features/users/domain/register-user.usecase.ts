import { User } from './user.entity';
import { userRepository } from '../data/firestore-user.repository';
import { generateAvatar } from '../utils/avatar.utils';
import { AppError } from '@shared/domain/app-error';
import { logger } from '@shared/services/logger.service';

export interface RegisterUserDto {
  id: string; // Firebase UID
  username: string;
  email: string;
}

export class RegisterUserUseCase {
  async execute(dto: RegisterUserDto): Promise<User> {
    const { id, username, email } = dto;

    if (!id || !username || !email) {
      throw new AppError('id, username and email are required', 400);
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      throw new AppError(
        'Username must be 3-20 characters, alphanumeric and underscores only',
        400,
      );
    }

    const isUnique = await userRepository.isUsernameUnique(username);
    if (!isUnique) {
      throw new AppError('Username is already taken', 400);
    }

    const avatarSvg = generateAvatar(id);

    const newUser: User = {
      id,
      username,
      email,
      avatarSvg,
      stats: {
        currentStreak: 0,
        longestStreak: 0,
        bestTimeSeconds: null,
        bestClicks: null,
        totalGames: 0,
        totalScore: 0,
        lastPlayedDate: null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = await userRepository.create(newUser);
    logger.info({ msg: 'User registered', id: user.id, username: user.username });
    return user;
  }
}

export const registerUserUseCase = new RegisterUserUseCase();
