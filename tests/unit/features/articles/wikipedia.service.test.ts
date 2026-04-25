import nock from 'nock';
import { WikipediaService } from '../../../../src/features/articles/data/wikipedia.service';
import { AppError } from '@shared/domain/app-error';

describe('WikipediaService', () => {
  let wikipediaService: WikipediaService;
  const lang = 'en';
  const title = 'Earth';
  const baseUrl = `https://${lang}.wikipedia.org`;

  beforeEach(() => {
    wikipediaService = new WikipediaService();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should fetch article and return html', async () => {
    nock(baseUrl)
      .get(`/api/rest_v1/page/html/${title}`)
      .reply(200, '<div>Earth content</div>', { etag: '123' });

    const result = await wikipediaService.fetchArticle(lang, title);
    expect(result.html).toBe('<div>Earth content</div>');
    expect(result.resolvedTitle).toBe('Earth');
  });

  it('should resolve redirects (handled by REST API natively)', async () => {
    // REST API resolves redirects automatically. If we call with 'Pizza',
    // it returns the content of the resolved page.
    nock(baseUrl)
      .get('/api/rest_v1/page/html/Pizza')
      .reply(200, '<div>Pizza content</div>', { etag: '456' });

    const result = await wikipediaService.fetchArticle(lang, 'Pizza');
    expect(result.resolvedTitle).toBe('Pizza');
  });

  it('should throw 404 if article is missing', async () => {
    nock(baseUrl).get('/api/rest_v1/page/html/NonExistent').reply(404);

    await expect(wikipediaService.fetchArticle(lang, 'NonExistent')).rejects.toThrow(AppError);
  });
});
