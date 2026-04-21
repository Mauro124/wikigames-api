import request from 'supertest';
import { app, server } from '../../../../src/index';
import { db } from '../../../../src/config/firebase.config';

// Mock Firebase
jest.mock('../../../../src/config/firebase.config', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  },
  admin: {
    auth: jest.fn(),
    firestore: {
      FieldValue: {
        serverTimestamp: jest.fn(),
      },
    },
    credential: { cert: jest.fn() },
    apps: { length: 0 },
    app: jest.fn(),
    initializeApp: jest.fn(),
  },
}));

describe('User Leaderboard', () => {
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

  it('should return top users sorted by score', async () => {
    const mockUsers = [
      { id: '1', username: 'top1', avatarSvg: '...', stats: { totalScore: 1000, longestStreak: 5 } },
      { id: '2', username: 'top2', avatarSvg: '...', stats: { totalScore: 800, longestStreak: 3 } },
    ];

    (db.collection as jest.Mock).mockReturnThis();
    (db.where as jest.Mock).mockReturnThis();
    (db.orderBy as jest.Mock).mockReturnThis();
    (db.limit as jest.Mock).mockReturnThis();
    (db.get as jest.Mock).mockResolvedValue({
      docs: mockUsers.map(u => ({ id: u.id, data: () => u }))
    });

    const response = await request(app).get('/users/leaderboard');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].username).toBe('top1');
    expect(response.body.data[0].totalScore).toBe(1000);
    expect(db.orderBy).toHaveBeenCalledWith('stats.totalScore', 'desc');
  });
});
