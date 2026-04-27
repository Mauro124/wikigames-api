import { ObjectiveController } from '../../../../src/features/challenges/controllers/objective.controller';

describe('ObjectiveController', () => {
  let controller: ObjectiveController;
  let mockRepo: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      create: jest.fn(),
      createBatch: jest.fn(),
      delete: jest.fn(),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    controller = new ObjectiveController(mockRepo);
  });

  it('should list objectives', async () => {
    mockRepo.findAll.mockResolvedValue([{ title: 'Obj1' }]);
    await controller.list({} as any, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: [{ title: 'Obj1' }] }),
    );
  });

  it('should create objective', async () => {
    const body = { title: 'New Obj', lang: 'en' };
    mockRepo.create.mockResolvedValue({ id: '1', ...body });
    await controller.create({ body } as any, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ title: 'New Obj' }) }),
    );
  });

  it('should return 400 if title or lang missing', async () => {
    await controller.create({ body: {} } as any, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should delete objective', async () => {
    await controller.delete({ params: { id: '1' } } as any, mockRes, mockNext);
    expect(mockRepo.delete).toHaveBeenCalledWith('1');
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  describe('createBatch', () => {
    it('should create multiple objectives and return 201', async () => {
      const objectives = [
        { title: 'Obj 1', lang: 'es' },
        { title: 'Obj 2', lang: 'es' },
      ];
      await controller.createBatch({ body: { objectives } } as any, mockRes, mockNext);
      expect(mockRepo.createBatch).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 if objectives is not an array', async () => {
      await controller.createBatch(
        { body: { objectives: 'not-an-array' } } as any,
        mockRes,
        mockNext,
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if batch size > 500', async () => {
      const objectives = Array(501).fill({ title: 'O', lang: 'en' });
      await controller.createBatch({ body: { objectives } } as any, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
