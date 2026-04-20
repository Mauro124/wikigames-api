import axios from 'axios';
import { AppError } from '@shared/domain/app-error';

export interface WikiParseResponse {
  html: string;
  resolvedTitle: string;
}

export class WikipediaService {
  private readonly baseUrl = 'wikipedia.org/w/api.php';

  /**
   * Fetches the rendered HTML of a Wikipedia article and resolves its title.
   */
  async fetchArticle(lang: string, title: string): Promise<WikiParseResponse> {
    const url = `https://${lang}.${this.baseUrl}`;

    try {
      const response = await axios.get(url, {
        params: {
          action: 'parse',
          page: title,
          prop: 'text',
          redirects: 1,
          format: 'json',
          origin: '*',
        },
      });

      const data = response.data;

      if (data.error) {
        if (data.error.code === 'missingtitle') {
          throw new AppError(`Article "${title}" not found in language "${lang}"`, 404);
        }
        throw new AppError(`Wikipedia API Error: ${data.error.info}`, 400);
      }

      const parse = data.parse;
      const html = parse.text['*'];
      let resolvedTitle = parse.title;

      // Handle redirects explicitly if needed (redirects: 1 already does most of the work)
      if (parse.redirects && parse.redirects.length > 0) {
        resolvedTitle = parse.redirects[parse.redirects.length - 1].to;
      }

      return {
        html,
        resolvedTitle,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new AppError(`Failed to fetch article from Wikipedia: ${message}`, 500);
    }
  }
}

export const wikipediaService = new WikipediaService();
