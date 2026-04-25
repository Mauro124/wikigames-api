import request from 'supertest';
import { app, server } from '../../../../src/index';
import { db } from '../../../../src/config/firebase.config';
import { wikipediaFeedService } from '../../../../src/features/challenges/data/wikipedia-feed.service';

// Mock Firebase Config globally
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

describe('POST /internal/challenges (Manual Creation)', () => {
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

  it('should create a manual challenge successfully', async () => {
    const mockPayload = {
      id: '2026-05-01',
      lang: 'en',
      targetTitle: 'Quantum Mechanics',
      challenges: [{ startTitle: 'Albert Einstein', endTitle: 'Quantum Mechanics' }],
    };

    // Mock BFS (Shortest path = 2)
    (wikipediaFeedService.getLinksForPage as jest.Mock).mockResolvedValue(['Quantum Mechanics']);
    (wikipediaFeedService.getBacklinksForPage as jest.Mock).mockResolvedValue(['Albert Einstein']);

    // Mock persistence
    (db.collection as jest.Mock).mockReturnThis();
    (db.doc as jest.Mock).mockReturnThis();
    (db.set as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post('/internal/challenges')
      .set('x-generator-key', 'test-key')
      .send(mockPayload);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.id).toBe(mockPayload.id);
    expect(response.body.data.challenges[0].minClicks).toBeGreaterThan(0);
    expect(response.body.data.challenges[0].difficulty).toBeDefined();
  });

  it('should return 400 if no path is found', async () => {
    const mockPayload = {
      id: '2026-05-01',
      lang: 'en',
      targetTitle: 'B',
      challenges: [{ startTitle: 'A', endTitle: 'B' }],
    };

    (wikipediaFeedService.getLinksForPage as jest.Mock).mockResolvedValue([]);
    (wikipediaFeedService.getBacklinksForPage as jest.Mock).mockResolvedValue([]);

    const response = await request(app)
      .post('/internal/challenges')
      .set('x-generator-key', 'test-key')
      .send(mockPayload);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('No path found');
  });

  it('should return 401 if unauthorized', async () => {
    const response = await request(app).post('/internal/challenges').send({});

    expect(response.status).toBe(401);
  });
});
