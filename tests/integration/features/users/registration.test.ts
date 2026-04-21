import request from 'supertest';
import { app, server } from '../../../../src/index';
import { db } from '../../../../src/config/firebase.config';

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
  });

  it('should register a new user successfully', async () => {
    const mockUsername = 'test_user';

    // Mock uniqueness check
    (db.collection as jest.Mock).mockReturnThis();
    (db.where as jest.Mock).mockReturnThis();
    (db.get as jest.Mock).mockResolvedValue({ empty: true });

    // Mock persistence
    (db.doc as jest.Mock).mockReturnThis();
    (db.set as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post('/users')
      .set('Authorization', 'Bearer valid-token')
      .send({ username: mockUsername });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.username).toBe(mockUsername);
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.id).toBe('test-uid');
    expect(response.body.data.avatarSvg).toBeDefined();
    expect(response.body.data.avatarSvg).toContain('<svg');
  });

  it('should return 401 if email is missing from token', async () => {
    const mockUsername = 'test_user';

    // Mock token without email
    mockAuth.verifyIdToken.mockResolvedValueOnce({ uid: 'test-uid' });

    const response = await request(app)
      .post('/users')
      .set('Authorization', 'Bearer valid-token')
      .send({ username: mockUsername });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized or missing email in token');
  });

  it('should return 400 if username is taken', async () => {
    const mockUsername = 'existing_user';

    // Mock username taken
    (db.collection as jest.Mock).mockReturnThis();
    (db.where as jest.Mock).mockReturnThis();
    (db.get as jest.Mock).mockResolvedValue({
      empty: false,
      docs: [{ id: 'other-uid', data: () => ({ username: mockUsername }) }],
    });

    const response = await request(app)
      .post('/users')
      .set('Authorization', 'Bearer valid-token')
      .send({ username: mockUsername });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username is already taken');
  });

  it('should return 400 for invalid username format', async () => {
    const response = await request(app)
      .post('/users')
      .set('Authorization', 'Bearer valid-token')
      .send({ username: 'a' }); // too short

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
  });

  it('should return 401 if no token provided', async () => {
    const response = await request(app).post('/users').send({ username: 'test_user' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });
});
