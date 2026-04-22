import { Router } from 'express';
import { articleController } from './controllers/article.controller';

const router = Router();

router.get('/:lang/:title', articleController.getArticle.bind(articleController));

export { router as articleRouter };
