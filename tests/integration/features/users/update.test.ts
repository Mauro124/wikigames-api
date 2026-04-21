import request from 'supertest';
import { app, server } from '../../../../src/index';
import { db } from '../../../../src/config/firebase.config';

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
    auth: () => ({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid' }),
    }),
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
  });

  it('should update username successfully', async () => {
    const mockUser = {
      id: 'test-uid',
      username: 'old_name',
      avatarSvg: '<svg>...</svg>',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newUsername = 'new_name';

    (db.collection as jest.Mock).mockReturnThis();
    (db.doc as jest.Mock).mockReturnThis();
    // findById mock
    (db.get as jest.Mock)
      .mockResolvedValueOnce({ exists: true, id: mockUser.id, data: () => mockUser }) // findById
      .mockResolvedValueOnce({ empty: true }) // isUsernameUnique (findByUsername)
      .mockResolvedValueOnce({
        exists: true,
        id: mockUser.id,
        data: () => ({ ...mockUser, username: newUsername }),
      }); // get after update

    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', 'Bearer valid-token')
      .send({ username: newUsername });

    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe(newUsername);
  });

  it('should return 400 if new username is taken', async () => {
    const mockUser = { id: 'test-uid', username: 'old_name' };
    const takenName = 'taken_name';

    (db.collection as jest.Mock).mockReturnThis();
    (db.doc as jest.Mock).mockReturnThis();
    (db.get as jest.Mock)
      .mockResolvedValueOnce({ exists: true, id: mockUser.id, data: () => mockUser })
      .mockResolvedValueOnce({ empty: false, docs: [{ id: 'other-uid', data: () => ({}) }] }); // taken

    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', 'Bearer valid-token')
      .send({ username: takenName });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username is already taken');
  });
});
