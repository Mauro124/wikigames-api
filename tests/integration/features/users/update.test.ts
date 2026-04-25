import request from 'supertest';
import { app, server } from '../../../../src/index';
import { UpdateUserUseCase } from '../../../../src/features/users/domain/update-user.usecase';

const mockAuth = {
  verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid', email: 'test@example.com' }),
};

// Mock Firebase Config globally
jest.mock('../../../../src/config/firebase.config', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    update: jest.fn(),
    where: jest.fn().mockReturnThis(),
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

jest.mock('../../../../src/features/users/domain/update-user.usecase');

describe('PATCH /users/me (Profile Update)', () => {
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

  it('should update username successfully', async () => {
    const mockUser = {
      id: 'test-uid',
      username: 'new_name',
      avatarSvg: '<svg>...</svg>',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (UpdateUserUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', 'Bearer valid-token')
      .send({ username: 'new_name' });

    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe('new_name');
  });

  it('should return 400 if new username is taken', async () => {
    (UpdateUserUseCase.prototype.execute as jest.Mock).mockRejectedValue({
      message: 'Username is already taken',
      statusCode: 400,
      isOperational: true,
    });

    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', 'Bearer valid-token')
      .send({ username: 'taken_name' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username is already taken');
  });
});
