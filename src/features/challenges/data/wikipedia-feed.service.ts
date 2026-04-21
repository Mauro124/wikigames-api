import axios from 'axios';
import { AppError } from '@shared/domain/app-error';

export class WikipediaFeedService {
  private readonly baseUrl = 'wikipedia.org/w/api.php';

  /**
   * Fetches articles from a specific Wikipedia category.
   */
  async getRandomArticlesFromCategory(
    lang: string,
    category: string,
    limit = 50,
  ): Promise<string[]> {
    const url = `https://${lang}.${this.baseUrl}`;
    try {
      const response = await axios.get(url, {
        params: {
          action: 'query',
          list: 'categorymembers',
          cmtitle: `Category:${category}`,
          cmlimit: limit,
          cmnamespace: 0, // Only articles
          format: 'json',
          origin: '*',
        },
        headers: {
          'User-Agent': 'WikiGameBackend/1.0 (contact@example.com)',
        },
      });

      const data = response.data;
      if (data.error) {
        throw new AppError(`Wikipedia API Error (Category): ${data.error.info}`, 400);
      }

      const members = data.query.categorymembers;
      return members.map((m: any) => m.title);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to fetch category members: ${error.message}`, 500);
    }
  }

  /**
   * Fetches all internal links of a page for BFS verification.
   */
  async getLinksForPage(lang: string, title: string): Promise<string[]> {
    const url = `https://${lang}.${this.baseUrl}`;
    const links: string[] = [];
    let continueToken: string | undefined;

    try {
      do {
        const response = await axios.get(url, {
          params: {
            action: 'query',
            titles: title,
            prop: 'links',
            plnamespace: 0,
            pllimit: 'max',
            format: 'json',
            origin: '*',
            plcontinue: continueToken,
          },
          headers: {
            'User-Agent': 'WikiGameBackend/1.0 (contact@example.com)',
          },
        });

        const data = response.data;
        if (data.error) break;

        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const pageLinks = pages[pageId].links;

        if (pageLinks) {
          links.push(...pageLinks.map((l: any) => l.title));
        }

        continueToken = data.continue?.plcontinue;
        // Limit total links for performance in BFS (max 500 should be enough for reachability check)
        if (links.length >= 500) break;
      } while (continueToken);

      return Array.from(new Set(links));
    } catch {
      return [];
    }
  }

  /**
   * Fetches all articles linking TO a specific page for backward BFS verification.
   */
  async getBacklinksForPage(lang: string, title: string): Promise<string[]> {
    const url = `https://${lang}.${this.baseUrl}`;
    const backlinks: string[] = [];
    let continueToken: string | undefined;

    try {
      do {
        const response = await axios.get(url, {
          params: {
            action: 'query',
            list: 'backlinks',
            bltitle: title,
            blnamespace: 0,
            bllimit: 'max',
            format: 'json',
            origin: '*',
            blcontinue: continueToken,
          },
          headers: {
            'User-Agent': 'WikiGameBackend/1.0 (contact@example.com)',
          },
        });

        const data = response.data;
        if (data.error) break;

        const bl = data.query.backlinks;
        if (bl) {
          backlinks.push(...bl.map((l: any) => l.title));
        }

        continueToken = data.continue?.blcontinue;
        if (backlinks.length >= 500) break;
      } while (continueToken);

      return Array.from(new Set(backlinks));
    } catch {
      return [];
    }
  }
}

export const wikipediaFeedService = new WikipediaFeedService();
