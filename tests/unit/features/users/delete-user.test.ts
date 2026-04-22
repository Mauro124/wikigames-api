import { deleteUserUseCase } from '@features/users/domain/delete-user.usecase';
import { admin } from '@config/firebase.config';
import { userRepository } from '@features/users/data/firestore-user.repository';
import { AppError } from '@shared/domain/app-error';

jest.mock('@config/firebase.config', () => ({
  admin: {
    auth: jest.fn().mockReturnValue({
      deleteUser: jest.fn(),
    }),
  },
}));

jest.mock('@features/users/data/firestore-user.repository', () => ({
  userRepository: {
    delete: jest.fn(),
  },
}));

describe('DeleteUserUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete user from Auth and Firestore', async () => {
    const uid = 'user123';
    (admin.auth().deleteUser as jest.Mock).mockResolvedValue(undefined);
    (userRepository.delete as jest.Mock).mockResolvedValue(undefined);

    await deleteUserUseCase.execute(uid);

    expect(admin.auth().deleteUser).toHaveBeenCalledWith(uid);
    expect(userRepository.delete).toHaveBeenCalledWith(uid);
  });

  it('should still delete Firestore record if Auth user not found', async () => {
    const uid = 'user123';
    const error = new Error('User not found');
    (error as any).code = 'auth/user-not-found';
    
    (admin.auth().deleteUser as jest.Mock).mockRejectedValue(error);
    (userRepository.delete as jest.Mock).mockResolvedValue(undefined);

    await deleteUserUseCase.execute(uid);

    expect(admin.auth().deleteUser).toHaveBeenCalledWith(uid);
    expect(userRepository.delete).toHaveBeenCalledWith(uid);
  });

  it('should throw AppError if Auth deletion fails with other error', async () => {
    const uid = 'user123';
    (admin.auth().deleteUser as jest.Mock).mockRejectedValue(new Error('Auth failed'));

    await expect(deleteUserUseCase.execute(uid)).rejects.toThrow(AppError);
    expect(userRepository.delete).not.toHaveBeenCalled();
  });
});
