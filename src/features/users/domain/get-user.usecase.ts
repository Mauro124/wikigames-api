import { User } from './user.entity';
import { userRepository } from '../data/firestore-user.repository';
import { AppError } from '@shared/domain/app-error';

export class GetUserUseCase {
  async execute(uid: string): Promise<User> {
    if (!uid) {
      throw new AppError('UID is required', 400);
    }

    const user = await userRepository.findById(uid);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}

export const getUserUseCase = new GetUserUseCase();
