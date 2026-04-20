import { challengesRepository } from '../../../../src/features/challenges/data/firestore-challenges.repository';
import { db } from '@config/firebase.config';

jest.mock('@config/firebase.config', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
      })),
    })),
  },
}));

describe('FirestoreChallengesRepository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save a challenge with its ID', async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    const mockDoc = jest.fn().mockReturnValue({ set: mockSet });

    (db.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

    const challenge = {
      id: '2024-05-24',
      startTitle: 'Start',
      endTitle: 'End',
      lang: 'en',
    };

    await challengesRepository.save(challenge as any);

    expect(db.collection).toHaveBeenCalledWith('challenges');
    expect(mockDoc).toHaveBeenCalledWith('2024-05-24');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        startTitle: 'Start',
        updatedAt: expect.any(Date),
      }),
    );
  });
});
