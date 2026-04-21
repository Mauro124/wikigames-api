import { Request, Response, NextFunction } from 'express';
import { getArticleUseCase } from '../domain/get-article.usecase';

export class ArticleController {
  /**
   * Delegates fetching and caching (ETags) to UseCase and Service.
   */
  async getArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const lang = req.params.lang as string;
    const title = req.params.title as string;

    try {
      const article = await getArticleUseCase.execute(lang, title);
      res.json(article);
    } catch (error) {
      next(error);
    }
  }
}

export const articleController = new ArticleController();
