import request from 'supertest';
import { app, server } from '../../../../src/index';
import { db } from '../../../../src/config/firebase.config';
import { wikipediaFeedService } from '../../../../src/features/challenges/data/wikipedia-feed.service';

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

// Mock Wikipedia Service
jest.mock('../../../../src/features/challenges/data/wikipedia-feed.service');

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

    // Mock BFS
    (wikipediaFeedService.getLinksForPage as jest.Mock).mockResolvedValue(['Napoleón']);
    (wikipediaFeedService.getBacklinksForPage as jest.Mock).mockResolvedValue(['Lobo']);

    // Verify correct collection path: challenges -> es -> daily -> 2026-05-01
    (db.collection as jest.Mock).mockReturnThis();
    (db.doc as jest.Mock).mockReturnThis();

    await request(app)
      .post('/internal/challenges')
      .set('x-generator-key', 'test-key')
      .send(mockChallenge);

    expect(db.collection).toHaveBeenCalledWith('challenges');
    expect(db.doc).toHaveBeenCalledWith('es'); // Language doc
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
