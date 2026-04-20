import { statsRepository } from '../../../../src/features/stats/data/firestore-stats.repository';
import { db, admin } from '@config/firebase.config';

jest.mock('@config/firebase.config', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
      })),
    })),
  },
  admin: {
    firestore: {
      FieldValue: {
        increment: jest.fn((n) => `increment(${n})`),
      },
    },
  },
}));

describe('FirestoreStatsRepository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should increment stats using FieldValue.increment', async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    const mockDoc = jest.fn().mockReturnValue({ set: mockSet });

    (db.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

    await statsRepository.incrementStats('2024-05-24', 10, 60);

    expect(mockDoc).toHaveBeenCalledWith('2024-05-24');
    expect(admin.firestore.FieldValue.increment).toHaveBeenCalledWith(1); // totalWins
    expect(admin.firestore.FieldValue.increment).toHaveBeenCalledWith(10); // sumClicks
    expect(admin.firestore.FieldValue.increment).toHaveBeenCalledWith(60); // sumTime
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        totalWins: 'increment(1)',
        'distribution.10': 'increment(1)',
      }),
      { merge: true },
    );
  });

  it('should bucket clicks over 20 as 20plus', async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    const mockDoc = jest.fn().mockReturnValue({ set: mockSet });

    (db.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

    await statsRepository.incrementStats('2024-05-24', 25, 60);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        'distribution.20plus': 'increment(1)',
      }),
      { merge: true },
    );
  });
});
