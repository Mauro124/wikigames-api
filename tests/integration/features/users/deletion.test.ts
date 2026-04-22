import request from 'supertest';
import { app, server } from '../../../../src/index';
import { db } from '../../../../src/config/firebase.config';

const mockAuth = {
  verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-uid', email: 'test@example.com' }),
  deleteUser: jest.fn().mockResolvedValue(undefined),
};

// Mock Firebase Config globally
jest.mock('../../../../src/config/firebase.config', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    delete: jest.fn().mockResolvedValue(undefined),
  },
  admin: {
    auth: () => mockAuth,
    credential: {
      cert: jest.fn(),
    },
    apps: { length: 0 },
    app: jest.fn(),
    initializeApp: jest.fn(),
  },
}));

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
  });

  it('should delete current user account successfully', async () => {
    const response = await request(app)
      .delete('/users/me')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Account deleted successfully');

    expect(mockAuth.deleteUser).toHaveBeenCalledWith('test-uid');
    expect(db.collection).toHaveBeenCalledWith('users');
    expect(db.doc).toHaveBeenCalledWith('test-uid');
    expect(db.doc().delete).toHaveBeenCalled();
  });

  it('should return 401 if no token provided', async () => {
    const response = await request(app).delete('/users/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('should return 500 if deletion fails', async () => {
    mockAuth.deleteUser.mockRejectedValueOnce(new Error('Auth failed'));

    const response = await request(app)
      .delete('/users/me')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(500);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('Failed to delete account');
  });
});
