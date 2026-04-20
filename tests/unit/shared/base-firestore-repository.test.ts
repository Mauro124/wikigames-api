import { BaseFirestoreRepository } from '@shared/data/base-firestore.repository';
import { BaseEntity } from '@shared/domain/base.entity';

// Mock variable must be used or removed
jest.mock('@config/firebase.config', () => ({
  db: {
    collection: (_name: string) => ({
      doc: (_id: string) => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      }),
      get: jest.fn(),
    }),
  },
}));

// Re-import after mock to get the mocked db
import { db } from '@config/firebase.config';

interface TestEntity extends BaseEntity {
  name: string;
}

class TestRepository extends BaseFirestoreRepository<TestEntity> {
  constructor() {
    super('test-collection');
  }
}

describe('BaseFirestoreRepository', () => {
  let repo: TestRepository;

  beforeEach(() => {
    repo = new TestRepository();
    jest.clearAllMocks();
  });

  it('should find by id', async () => {
    const date = new Date();
    const mockGet = jest.fn().mockResolvedValue({
      exists: true,
      id: '123',
      data: () => ({ name: 'Test', createdAt: date, updatedAt: date }),
    });

    jest.spyOn(db, 'collection').mockReturnValue({
      doc: jest.fn().mockReturnValue({ get: mockGet }),
    } as any);

    const result = await repo.findById('123');
    expect(result?.id).toBe('123');
    expect(db.collection).toHaveBeenCalledWith('test-collection');
  });

  it('should create an entity', async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    const mockDoc = jest.fn().mockReturnValue({ set: mockSet, id: 'auto-id' });

    jest.spyOn(db, 'collection').mockReturnValue({
      doc: mockDoc,
    } as any);

    await repo.create({ name: 'New' } as any);
    expect(mockDoc).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should update an entity', async () => {
    const date = new Date();
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockGet = jest.fn().mockResolvedValue({
      id: '123',
      data: () => ({ name: 'Updated', createdAt: date, updatedAt: date }),
    });

    jest.spyOn(db, 'collection').mockReturnValue({
      doc: jest.fn().mockReturnValue({ update: mockUpdate, get: mockGet }),
    } as any);

    await repo.update('123', { name: 'Updated' });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated',
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should delete an entity', async () => {
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    const mockDoc = jest.fn().mockReturnValue({ delete: mockDelete });

    jest.spyOn(db, 'collection').mockReturnValue({
      doc: mockDoc,
    } as any);

    await repo.delete('123');
    expect(mockDoc).toHaveBeenCalledWith('123');
    expect(mockDelete).toHaveBeenCalled();
  });

  it('should find all', async () => {
    const date = new Date();
    const mockGet = jest.fn().mockResolvedValue({
      docs: [
        {
          id: '1',
          data: () => ({ name: 'E1', createdAt: date, updatedAt: date }),
        },
      ],
    });

    jest.spyOn(db, 'collection').mockReturnValue({
      get: mockGet,
    } as any);

    const results = await repo.findAll();
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('E1');
  });
});
