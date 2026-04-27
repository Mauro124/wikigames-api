import { FirestoreResultsRepository } from '../../../../src/features/results/data/firestore-results.repository';
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
    collectionGroup: jest.fn(),
  },
}));

describe('FirestoreResultsRepository', () => {
  let repository: FirestoreResultsRepository;

  beforeEach(() => {
    repository = new FirestoreResultsRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save a result with deterministic path in user subcollection', async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    const mockResultsCol = jest.fn().mockReturnThis();
    const mockDoc = jest.fn().mockReturnThis();

    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: mockResultsCol.mockReturnValue({
          doc: mockDoc.mockReturnValue({ set: mockSet }),
        }),
      }),
    });

    const result = {
      challengeId: '2024-05-24',
      userId: 'user123',
      clicks: 5,
      timeSeconds: 100,
      path: ['A', 'B'],
    };

    await repository.save(result as any);

    expect(db.collection).toHaveBeenCalledWith('users');
    expect(mockResultsCol).toHaveBeenCalledWith('results');
    expect(mockDoc).toHaveBeenCalledWith('2024-05-24');
  });

  it('should find by challenge using collectionGroup', async () => {
    const mockGet = jest.fn().mockResolvedValue({
      docs: [{ id: '1', data: () => ({ challengeId: '2024-05-24' }) }],
    });
    const mockWhere = jest.fn().mockReturnValue({ get: mockGet });

    (db.collectionGroup as jest.Mock).mockReturnValue({ where: mockWhere });

    const results = await repository.findByChallenge('2024-05-24');

    expect(db.collectionGroup).toHaveBeenCalledWith('results');
    expect(mockWhere).toHaveBeenCalledWith('challengeId', '==', '2024-05-24');
    expect(results).toHaveLength(1);
  });

  it('should check if result exists in user subcollection', async () => {
    const mockGet = jest.fn().mockResolvedValue({ exists: true });
    const mockResultsCol = jest.fn().mockReturnThis();
    const mockDoc = jest.fn().mockReturnThis();

    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        collection: mockResultsCol.mockReturnValue({
          doc: mockDoc.mockReturnValue({ get: mockGet }),
        }),
      }),
    });

    const exists = await repository.exists('2024-05-24', 'user123');

    expect(mockDoc).toHaveBeenCalledWith('2024-05-24');
    expect(exists).toBe(true);
  });
});
