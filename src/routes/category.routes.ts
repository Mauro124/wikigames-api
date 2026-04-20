import { Router } from 'express';
import { categoryController } from '../features/challenges/controllers/category.controller';

const router = Router();
router.get('/', categoryController.list);
router.post('/', categoryController.create);

export default router;
