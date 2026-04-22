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
  },
  admin: {
    auth: () => ({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid', email: 'test@example.com' }),
    }),
    firestore: {
      FieldValue: {
        serverTimestamp: jest.fn(),
        increment: jest.fn(),
      },
    },
    credential: { cert: jest.fn() },
    apps: { length: 0 },
    app: jest.fn(),
    initializeApp: jest.fn(),
  },
}));

describe('User Stats Flow', () => {
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

  it('should update user stats when result is submitted', async () => {
    const mockUser = {
      id: 'test-uid',
      stats: {
        currentStreak: 1,
        lastPlayedDate: '2026-04-20',
        totalGames: 1,
        longestStreak: 1,
        bestTimeSeconds: 100,
      },
    };

    // Sequence of GETs in submit flow:
    // 1. resultsRepository.exists
    // 2. userRepository.findById
    // 3. baseFirestoreRepository.update (get updated record)
    // 4. getStatsUseCase.execute
    (db.get as jest.Mock)
      .mockResolvedValueOnce({ exists: false }) // 1
      .mockResolvedValueOnce({ exists: true, id: 'test-uid', data: () => mockUser }) // 2
      .mockResolvedValueOnce({
        exists: true,
        id: 'test-uid',
        data: () => ({ ...mockUser, stats: { ...mockUser.stats, currentStreak: 2 } }),
      }) // 3
      .mockResolvedValueOnce({ exists: true, data: () => ({ averageClicks: 10 }) }); // 4

    (db.update as jest.Mock).mockResolvedValue(undefined);

    const payload = {
      challengeId: '2026-04-21',
      userId: 'test-uid',
      clicks: 5,
      timeSeconds: 50,
      path: ['A', 'B'],
    };

    const response = await request(app).post('/results').send(payload);

    expect(response.status).toBe(201);
    expect(db.update).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: expect.objectContaining({
          currentStreak: 2,
          bestTimeSeconds: 50,
          totalGames: 2,
          totalScore: expect.any(Number),
        }),
      }),
    );
  });

  it('should retrieve user stats via API', async () => {
    const stats = { currentStreak: 2, bestTimeSeconds: 50, totalGames: 2 };
    (db.get as jest.Mock).mockResolvedValue({
      exists: true,
      data: () => ({ id: 'test-uid', stats }),
    });

    const response = await request(app).get('/users/test-uid/stats');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(stats);
  });
});
