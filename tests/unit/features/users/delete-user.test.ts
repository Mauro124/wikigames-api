import { DeleteUserUseCase } from '../../../../src/features/users/domain/delete-user.usecase';
import { admin } from '@config/firebase.config';
import { AppError } from '@shared/domain/app-error';

jest.mock('@config/firebase.config', () => ({
  admin: {
    auth: jest.fn().mockReturnValue({
      deleteUser: jest.fn(),
    }),
  },
}));

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let mockUserRepo: any;

  beforeEach(() => {
    mockUserRepo = {
      delete: jest.fn(),
    };
    useCase = new DeleteUserUseCase(mockUserRepo);
    jest.clearAllMocks();
  });

  it('should delete user from Auth and Firestore', async () => {
    const uid = 'user123';
    (admin.auth().deleteUser as jest.Mock).mockResolvedValue(undefined);
    mockUserRepo.delete.mockResolvedValue(undefined);

    await useCase.execute(uid);

    expect(admin.auth().deleteUser).toHaveBeenCalledWith(uid);
    expect(mockUserRepo.delete).toHaveBeenCalledWith(uid);
  });

  it('should still delete Firestore record if Auth user not found', async () => {
    const uid = 'user123';
    const error = new Error('User not found');
    (error as any).code = 'auth/user-not-found';

    (admin.auth().deleteUser as jest.Mock).mockRejectedValue(error);
    mockUserRepo.delete.mockResolvedValue(undefined);

    await useCase.execute(uid);

    expect(admin.auth().deleteUser).toHaveBeenCalledWith(uid);
    expect(mockUserRepo.delete).toHaveBeenCalledWith(uid);
  });

  it('should throw AppError if Auth deletion fails with other error', async () => {
    const uid = 'user123';
    (admin.auth().deleteUser as jest.Mock).mockRejectedValue(new Error('Auth failed'));

    await expect(useCase.execute(uid)).rejects.toThrow(AppError);
    expect(mockUserRepo.delete).not.toHaveBeenCalled();
  });
});
