import request from 'supertest';
import { app, server } from '../../../../src/index';
import { RegisterUserUseCase } from '../../../../src/features/users/domain/register-user.usecase';

const mockAuth = {
  verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid', email: 'test@example.com' }),
};

// Mock Firebase Config globally
jest.mock('../../../../src/config/firebase.config', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
    doc: jest.fn().mockReturnThis(),
    set: jest.fn(),
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

// Mock UseCase
jest.mock('../../../../src/features/users/domain/register-user.usecase');

describe('POST /users (Registration)', () => {
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

  it('should register a new user successfully', async () => {
    const mockUsername = 'test_user';
    const mockUser = {
      id: 'test-uid',
      username: mockUsername,
      email: 'test@example.com',
      avatarSvg: '<svg></svg>',
    };

    (RegisterUserUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/users')
      .set('Authorization', 'Bearer valid-token')
      .send({ username: mockUsername });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.username).toBe(mockUsername);
  });

  it('should return 401 if email is missing from token', async () => {
    mockAuth.verifyIdToken.mockResolvedValueOnce({ uid: 'test-uid' });

    const response = await request(app)
      .post('/users')
      .set('Authorization', 'Bearer valid-token')
      .send({ username: 'test_user' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized or missing email in token');
  });

  it('should return 400 if username is taken', async () => {
    (RegisterUserUseCase.prototype.execute as jest.Mock).mockRejectedValue({
      message: 'Username is already taken',
      statusCode: 400,
      isOperational: true,
    });

    const response = await request(app)
      .post('/users')
      .set('Authorization', 'Bearer valid-token')
      .send({ username: 'existing_user' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username is already taken');
  });

  it('should return 401 if no token provided', async () => {
    const response = await request(app).post('/users').send({ username: 'test_user' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});
