import { FirestoreObjectivesRepository } from '../../../../src/features/challenges/data/firestore-objectives.repository';
import { db } from '../../../../src/config/firebase.config';

jest.mock('../../../../src/config/firebase.config', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    collectionGroup: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    batch: jest.fn(),
  },
}));

describe('FirestoreObjectivesRepository', () => {
  let repo: FirestoreObjectivesRepository;

  beforeEach(() => {
    repo = new FirestoreObjectivesRepository();
    jest.clearAllMocks();
  });

  describe('findNextForLang', () => {
    it('should return objective with oldest lastUsedAt or never used', async () => {
      const mockObjective = {
        id: 'obj1',
        title: 'Messi',
        lang: 'es',
        usageCount: 0,
        lastUsedAt: null,
      };

      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [{ id: 'obj1', data: () => mockObjective }],
        }),
      });

      const result = await repo.findNextForLang('es');

      expect(result).toEqual(expect.objectContaining({ title: 'Messi' }));
      expect(db.collection).toHaveBeenCalledWith('objectives');
    });

    it('should query with orderBy lastUsedAt asc to get LRU', async () => {
      const mockOrderBy = jest.fn().mockReturnThis();
      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: mockOrderBy,
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [{ id: 'obj1', data: () => ({ title: 'Oldest' }) }],
        }),
      });

      await repo.findNextForLang('es');
      expect(mockOrderBy).toHaveBeenCalledWith('lastUsedAt', 'asc');
    });

    it('should return null if no objectives found', async () => {
      (db.collection as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          empty: true,
          docs: [],
        }),
      });

      const result = await repo.findNextForLang('es');
      expect(result).toBeNull();
    });
  });

  describe('markAsUsed', () => {
    it('should update lastUsedAt and increment usageCount', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ usageCount: 5 }),
      });

      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
          update: mockUpdate,
        }),
      });

      await repo.markAsUsed('obj1');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          usageCount: 6,
          lastUsedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('createBatch', () => {
    it('should commit multiple operations in a batch', async () => {
      const mockSet = jest.fn();
      const mockCommit = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({});

      (db.collection as jest.Mock).mockReturnValue({ doc: mockDoc });
      (db.batch as jest.Mock).mockReturnValue({
        set: mockSet,
        commit: mockCommit,
      });

      const objectives = [
        { title: 'O1', lang: 'es', usageCount: 0, lastUsedAt: null },
        { title: 'O2', lang: 'es', usageCount: 0, lastUsedAt: null },
      ];

      await repo.createBatch(objectives as any);

      expect(mockSet).toHaveBeenCalledTimes(2);
      expect(mockCommit).toHaveBeenCalledTimes(1);
    });
  });
});
