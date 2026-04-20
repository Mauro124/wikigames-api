import { Request, Response, NextFunction } from 'express';
import { getArticleUseCase } from '../domain/get-article.usecase';

export class ArticleController {
  async getArticle(req: Request, res: Response, next: NextFunction) {
    const { lang, title } = req.params;

    try {
      const article = await getArticleUseCase.execute(lang as string, title as string);
      res.status(200).json(article);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return res.status(404).json({ status: 'error', message: 'Article not found' });
      }
      next(error);
    }
  }
}

export const articleController = new ArticleController();
