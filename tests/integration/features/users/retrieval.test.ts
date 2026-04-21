import request from 'supertest';
import { app, server } from '../../../../src/index';
import { db } from '../../../../src/config/firebase.config';

// Mock Firebase Config globally
jest.mock('../../../../src/config/firebase.config', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
  },
  admin: {
    auth: jest.fn(),
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

    (db.collection as jest.Mock).mockReturnThis();
    (db.doc as jest.Mock).mockReturnThis();
    (db.get as jest.Mock).mockResolvedValue({
      exists: true,
      id: mockUser.id,
      data: () => mockUser,
    });

    const response = await request(app).get(`/users/${mockUser.id}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.username).toBe(mockUser.username);
  });

  it('should return 404 if user not found', async () => {
    (db.collection as jest.Mock).mockReturnThis();
    (db.doc as jest.Mock).mockReturnThis();
    (db.get as jest.Mock).mockResolvedValue({ exists: false });

    const response = await request(app).get('/users/non-existent-uid');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
