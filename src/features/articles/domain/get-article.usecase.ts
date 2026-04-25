import { Article } from './article.entity';
import { WikipediaService } from '../data/wikipedia.service';
import { ArticleCooker } from '../utils/html-cooker';

export class GetArticleUseCase {
  constructor(
    private readonly wikipediaService: WikipediaService,
    private readonly articleCooker: ArticleCooker,
  ) {}

  async execute(lang: string, title: string): Promise<Article> {
    const { html, resolvedTitle, cached } = await this.wikipediaService.fetchArticle(lang, title);
    const blocks = this.articleCooker.cook(html);

    return {
      title,
      resolvedTitle,
      lang,
      blocks,
      cached,
      timestamp: new Date().toISOString(),
    };
  }
}
