import { admin } from '@config/firebase.config';
import { UserRepository } from './user.repository';
import { logger } from '@shared/services/logger.service';
import { AppError } from '@shared/domain/app-error';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(uid: string): Promise<void> {
    logger.info({ msg: 'Deleting user account', uid });

    try {
      // 1. Delete from Firebase Auth
      await admin.auth().deleteUser(uid);
      logger.info({ msg: 'User deleted from Firebase Auth', uid });

      // 2. Delete from Firestore
      await this.userRepository.delete(uid);
      logger.info({ msg: 'User record deleted from Firestore', uid });
    } catch (error: any) {
      logger.error({ msg: 'Failed to delete user account', uid, error: error.message });

      if (error.code === 'auth/user-not-found') {
        // If Auth user is gone, still try to delete Firestore record
        await this.userRepository.delete(uid);
        return;
      }

      throw new AppError(`Failed to delete account: ${error.message}`, 500);
    }
  }
}
