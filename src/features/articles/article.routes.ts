import { Router } from 'express';
import { articleController } from './controllers/article.controller';

const router = Router();

// GET /articles/:lang/:title
router.get('/:lang/:title', articleController.getArticle.bind(articleController));

export { router as articleRouter };
