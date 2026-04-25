import request from 'supertest';
import { app, server } from '../../../../src/index';
import { db } from '../../../../src/config/firebase.config';
import { CreateManualChallengeUseCase } from '../../../../src/features/challenges/domain/create-manual-challenge.usecase';

// Mock Firebase Config
jest.mock('../../../../src/config/firebase.config', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
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

// Mock UseCase
jest.mock('../../../../src/features/challenges/domain/create-manual-challenge.usecase');

describe('Multi-Language Challenges', () => {
  afterAll((done) => {
    if (server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GENERATOR_API_KEY = 'test-key';
  });

  it('should store challenges in language-scoped sub-collections', async () => {
    const mockChallenge = {
      id: '2026-05-01',
      lang: 'es',
      targetTitle: 'Napoleón',
      challenges: [{ startTitle: 'Lobo', endTitle: 'Napoleón' }],
    };

    (CreateManualChallengeUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockChallenge);

    await request(app)
      .post('/internal/challenges')
      .set('x-generator-key', 'test-key')
      .send(mockChallenge);

    expect(CreateManualChallengeUseCase.prototype.execute).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'es' }),
    );
  });

  it('should retrieve challenge based on lang query param', async () => {
    const today = new Date().toISOString().split('T')[0];

    (db.collection as jest.Mock).mockReturnThis();
    (db.doc as jest.Mock).mockReturnThis();
    (db.get as jest.Mock).mockResolvedValue({
      exists: true,
      id: today,
      data: () => ({ id: today, lang: 'es', challenges: [] }),
    });

    const response = await request(app).get('/challenges/today?lang=es');

    expect(response.status).toBe(200);
    expect(response.body.lang).toBe('es');
    expect(db.doc).toHaveBeenCalledWith('es');
  });
});
