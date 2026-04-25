import request from 'supertest';
import { app, server } from '../../../../src/index';
import { DeleteUserUseCase } from '../../../../src/features/users/domain/delete-user.usecase';

const mockAuth = {
  verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid', email: 'test@example.com' }),
};

// Mock Firebase Config globally
jest.mock('../../../../src/config/firebase.config', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    delete: jest.fn(),
  },
  admin: {
    auth: () => mockAuth,
    firestore: {
      FieldValue: {
        serverTimestamp: jest.fn(),
      },
    },
    credential: {
      cert: jest.fn(),
    },
    apps: { length: 0 },
    app: jest.fn(),
    initializeApp: jest.fn(),
  },
}));

jest.mock('../../../../src/features/users/domain/delete-user.usecase');

describe('DELETE /users/me (Account Deletion)', () => {
  afterAll((done) => {
    if (server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-uid', email: 'test@example.com' });
  });

  it('should delete current user account successfully', async () => {
    (DeleteUserUseCase.prototype.execute as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .delete('/users/me')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Account deleted successfully');

    expect(DeleteUserUseCase.prototype.execute).toHaveBeenCalledWith('test-uid');
  });

  it('should return 401 if no token provided', async () => {
    const response = await request(app).delete('/users/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('should return 500 if deletion fails', async () => {
    (DeleteUserUseCase.prototype.execute as jest.Mock).mockRejectedValue(
      new Error('Failed to delete account'),
    );

    const response = await request(app)
      .delete('/users/me')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('Failed to delete account');
  });
});
