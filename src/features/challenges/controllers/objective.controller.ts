import { Request, Response, NextFunction } from 'express';
import { ObjectivesRepository } from '../domain/objectives.repository';

export class ObjectiveController {
  constructor(private readonly objectivesRepository: ObjectivesRepository) {}

  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const objectives = await this.objectivesRepository.findAll();
      res.status(200).json({
        status: 'success',
        data: objectives,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { title, lang } = req.body;

    if (!title || !lang) {
      res.status(400).json({ status: 'error', message: 'Title and lang are required' });
      return;
    }

    try {
      const newObjective = await this.objectivesRepository.create({
        title,
        lang,
        usageCount: 0,
        lastUsedAt: null,
      });

      res.status(201).json({
        status: 'success',
        data: newObjective,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { objectives } = req.body;

    if (!objectives || !Array.isArray(objectives)) {
      res.status(400).json({ status: 'error', message: 'Objectives array is required' });
      return;
    }

    if (objectives.length > 500) {
      res.status(400).json({ status: 'error', message: 'Batch size cannot exceed 500' });
      return;
    }

    try {
      const data = objectives.map((obj) => ({
        title: obj.title,
        lang: obj.lang,
        usageCount: 0,
        lastUsedAt: null,
      }));

      await this.objectivesRepository.createBatch(data);

      res.status(201).json({
        status: 'success',
        message: `${objectives.length} objectives created successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    try {
      await this.objectivesRepository.delete(id as string);
      res.status(200).json({
        status: 'success',
        message: 'Objective deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
