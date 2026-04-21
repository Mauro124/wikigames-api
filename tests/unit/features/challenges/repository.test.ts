import { FirestoreChallengesRepository } from '../../../../src/features/challenges/data/firestore-challenges.repository';
import { Challenge } from '../../../../src/features/challenges/domain/challenge.entity';

// Mock Firebase Config
jest.mock('../../../../src/config/firebase.config', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    set: jest.fn(),
    get: jest.fn(),
  },
}));

import { db } from '../../../../src/config/firebase.config';

describe('FirestoreChallengesRepository', () => {
  let repo: FirestoreChallengesRepository;

  beforeEach(() => {
    repo = new FirestoreChallengesRepository();
    jest.clearAllMocks();
  });

  it('should save a challenge in the correct language-scoped collection', async () => {
    const mockChallenge: Challenge = {
      id: '2026-05-01',
      lang: 'es',
      categoryStart: 'S',
      categoryEnd: 'E',
      challenges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (db.collection as jest.Mock).mockReturnThis();
    (db.doc as jest.Mock).mockReturnThis();
    (db.set as jest.Mock).mockResolvedValue(undefined);

    await repo.save(mockChallenge);

    expect(db.collection).toHaveBeenCalledWith('challenges');
    expect(db.doc).toHaveBeenCalledWith('es'); // Language doc
    expect(db.collection).toHaveBeenCalledWith('daily'); // daily collection
    expect(db.doc).toHaveBeenCalledWith(mockChallenge.id); // date doc
  });

  it('should find by id and lang', async () => {
    const today = '2026-04-21';
    const lang = 'en';

    (db.collection as jest.Mock).mockReturnThis();
    (db.doc as jest.Mock).mockReturnThis();
    (db.get as jest.Mock).mockResolvedValue({
      exists: true,
      id: today,
      data: () => ({ id: today, lang, challenges: [] }),
    });

    const result = await repo.findByIdAndLang(today, lang);

    expect(result?.id).toBe(today);
    expect(db.doc).toHaveBeenCalledWith(lang);
  });
});
