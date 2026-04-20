import { Request, Response } from 'express';
import { categoriesRepository } from '../data/firestore-categories.repository';

export class CategoryController {
  async list(req: Request, res: Response) {
    const categories = await categoriesRepository.findAll();
    res.json(categories);
  }

  async create(req: Request, res: Response) {
    const { name } = req.body;
    await categoriesRepository.save({ id: name, name, active: true });
    res.status(201).json({ name });
  }
}
export const categoryController = new CategoryController();
