import request from 'supertest';
import { app, server } from '../../../../src/index';
import { FirestoreUserRepository } from '../../../../src/features/users/data/firestore-user.repository';

jest.mock('../../../../src/features/users/data/firestore-user.repository');

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
      {
        id: '1',
        username: 'top1',
        avatarSvg: '...',
        stats: { totalScore: 1000, longestStreak: 5 },
      },
      { id: '2', username: 'top2', avatarSvg: '...', stats: { totalScore: 800, longestStreak: 3 } },
    ];

    (FirestoreUserRepository.prototype.getLeaderboard as jest.Mock).mockResolvedValue(mockUsers);

    const response = await request(app).get('/users/leaderboard');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].username).toBe('top1');
    expect(response.body.data[0].totalScore).toBe(1000);
    expect(FirestoreUserRepository.prototype.getLeaderboard).toHaveBeenCalledWith(50);
  });
});
