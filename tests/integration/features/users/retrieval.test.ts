import request from 'supertest';
import { app, server } from '../../../../src/index';
import { GetUserUseCase } from '../../../../src/features/users/domain/get-user.usecase';

jest.mock('../../../../src/features/users/domain/get-user.usecase');

describe('GET /users/:uid (Profile Retrieval)', () => {
  afterAll((done) => {
    if (server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and user profile if exists', async () => {
    const mockUser = {
      id: 'test-uid',
      username: 'test_user',
      avatarSvg: '<svg>...</svg>',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (GetUserUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app).get(`/users/${mockUser.id}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.username).toBe(mockUser.username);
  });

  it('should return 404 if user not found', async () => {
    (GetUserUseCase.prototype.execute as jest.Mock).mockRejectedValue({
      message: 'User not found',
      statusCode: 404,
      isOperational: true,
    });

    const response = await request(app).get('/users/non-existent-uid');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
