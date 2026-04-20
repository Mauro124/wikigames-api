import { resultsRepository } from '../../../../src/features/results/data/firestore-results.repository';
import { db } from '@config/firebase.config';

jest.mock('@config/firebase.config', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
      })),
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  },
}));

describe('FirestoreResultsRepository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save a result with deterministic ID', async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    const mockDoc = jest.fn().mockReturnValue({ set: mockSet });

    (db.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

    const result = {
      challengeId: '2024-05-24',
      userId: 'user123',
      clicks: 5,
      timeSeconds: 100,
      path: ['A', 'B'],
    };

    await resultsRepository.save(result as any);

    expect(mockDoc).toHaveBeenCalledWith('2024-05-24_user123');
  });

  it('should find by challenge', async () => {
    const mockGet = jest.fn().mockResolvedValue({
      docs: [
        { id: 'id1', data: () => ({ clicks: 5, createdAt: new Date(), updatedAt: new Date() }) },
      ],
    });
    const mockWhere = jest.fn().mockReturnValue({ get: mockGet });

    (db.collection as jest.Mock).mockReturnValue({ where: mockWhere });

    const results = await resultsRepository.findByChallenge('2024-05-24');

    expect(mockWhere).toHaveBeenCalledWith('challengeId', '==', '2024-05-24');
    expect(results).toHaveLength(1);
  });

  it('should check if result exists', async () => {
    const mockGet = jest.fn().mockResolvedValue({ exists: true });
    const mockDoc = jest.fn().mockReturnValue({ get: mockGet });

    (db.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

    const exists = await resultsRepository.exists('2024-05-24', 'user123');

    expect(mockDoc).toHaveBeenCalledWith('2024-05-24_user123');
    expect(exists).toBe(true);
  });
});
