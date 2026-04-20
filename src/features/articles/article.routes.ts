import { Router } from 'express';
import { articleController } from './controllers/article.controller';

const articleRouter = Router();

articleRouter.get('/:lang/:title', articleController.getArticle);

export { articleRouter };
