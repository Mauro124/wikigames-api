import axios from 'axios';
import { AppError } from '@shared/domain/app-error';

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
