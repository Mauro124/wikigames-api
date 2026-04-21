import { User } from './user.entity';
import { userRepository } from '../data/firestore-user.repository';
import { AppError } from '@shared/domain/app-error';
import { logger } from '@shared/services/logger.service';

export interface UpdateUserDto {
  username?: string;
}

export class UpdateUserUseCase {
  async execute(uid: string, dto: UpdateUserDto): Promise<User> {
    if (!uid) {
      throw new AppError('UID is required', 400);
    }

    const existingUser = await userRepository.findById(uid);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    const updates: Partial<User> = {};

    if (dto.username && dto.username !== existingUser.username) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(dto.username)) {
        throw new AppError(
          'Username must be 3-20 characters, alphanumeric and underscores only',
          400,
        );
      }

      const isUnique = await userRepository.isUsernameUnique(dto.username);
      if (!isUnique) {
        throw new AppError('Username is already taken', 400);
      }
      updates.username = dto.username;
    }

    if (Object.keys(updates).length === 0) {
      return existingUser;
    }

    const updatedUser = await userRepository.update(uid, updates);
    logger.info({ msg: 'User profile updated', id: uid, updates });
    return updatedUser;
  }
}

export const updateUserUseCase = new UpdateUserUseCase();
