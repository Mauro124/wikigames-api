import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { AppError } from '@shared/domain/app-error';

export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(uid: string): Promise<User> {
    if (!uid) {
      throw new AppError('UID is required', 400);
    }

    const user = await this.userRepository.findById(uid);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}
