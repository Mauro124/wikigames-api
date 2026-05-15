import axios from 'axios';
import { AppError } from '@shared/domain/app-error';
import { config } from '@config/index';

export class WikipediaFeedService {
  private readonly baseUrl = 'wikipedia.org/w/api.php';

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
            redirects: 1,
            plnamespace: 0,
            pllimit: 'max',
            format: 'json',
            origin: '*',
            plcontinue: continueToken,
          },
          headers: {
            'User-Agent': config.wikipedia.userAgent,
          },
        });

        const data = response.data;
        if (!data || data.error) break;

        const pages = data.query?.pages;
        if (!pages) break;

        const pageId = Object.keys(pages)[0];
        if (pageId === '-1') break; // Page not found

        const pageLinks = pages[pageId].links;

        if (pageLinks) {
          links.push(...pageLinks.map((l: any) => l.title));
        }

        continueToken = data.continue?.plcontinue;
        if (links.length >= 500) break;
      } while (continueToken);

      return Array.from(new Set(links));
    } catch {
      return [];
    }
  }

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
            'User-Agent': config.wikipedia.userAgent,
          },
        });

        const data = response.data;
        if (!data || data.error) break;

        const bl = data.query?.backlinks;
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

  async getPageExtract(lang: string, title: string): Promise<string | null> {
    const url = `https://${lang}.${this.baseUrl}`;

    try {
      const response = await axios.get(url, {
        params: {
          action: 'query',
          prop: 'extracts',
          exintro: 1,
          explaintext: 1,
          titles: title,
          format: 'json',
          origin: '*',
          redirects: 1,
        },
        headers: {
          'User-Agent': config.wikipedia.userAgent,
        },
      });

      const data = response.data;
      if (!data || data.error) return null;

      const pages = data.query?.pages;
      if (!pages) return null;

      const pageId = Object.keys(pages)[0];
      if (pageId === '-1') return null;

      return pages[pageId].extract || null;
    } catch {
      return null;
    }
  }
}
