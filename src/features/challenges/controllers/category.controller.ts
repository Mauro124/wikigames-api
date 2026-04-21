import { Request, Response } from 'express';
import { categoriesRepository } from '../data/firestore-categories.repository';

export class CategoryController {
  async list(req: Request, res: Response) {
    const categories = await categoriesRepository.findAll();
    res.json(categories);
  }

  async create(req: Request, res: Response) {
    const { name, localNames } = req.body;
    await categoriesRepository.create({ name, localNames, active: true });
    res.status(201).json({ name, localNames });
  }
}
export const categoryController = new CategoryController();
