import nock from 'nock';
import { wikipediaService } from '../../../../src/features/articles/data/wikipedia.service';
import { AppError } from '@shared/domain/app-error';

describe('WikipediaService', () => {
  const lang = 'en';
  const title = 'Earth';
  const baseUrl = `https://${lang}.wikipedia.org`;

  afterEach(() => {
    nock.cleanAll();
  });

  it('should fetch article and return html', async () => {
    nock(baseUrl)
      .get('/w/api.php')
      .query(true)
      .reply(200, {
        parse: {
          title: 'Earth',
          text: { '*': '<div>Earth content</div>' },
        },
      });

    const result = await wikipediaService.fetchArticle(lang, title);
    expect(result.html).toBe('<div>Earth content</div>');
    expect(result.resolvedTitle).toBe('Earth');
  });

  it('should resolve redirects', async () => {
    nock(baseUrl)
      .get('/w/api.php')
      .query(true)
      .reply(200, {
        parse: {
          title: 'Pizza (food)',
          text: { '*': '<div>Pizza content</div>' },
          redirects: [{ from: 'Pizza', to: 'Pizza (food)' }],
        },
      });

    const result = await wikipediaService.fetchArticle(lang, 'Pizza');
    expect(result.resolvedTitle).toBe('Pizza (food)');
  });

  it('should throw 404 if article is missing', async () => {
    nock(baseUrl)
      .get('/w/api.php')
      .query(true)
      .reply(200, {
        error: { code: 'missingtitle', info: 'The page you requested does not exist.' },
      });

    await expect(wikipediaService.fetchArticle(lang, 'NonExistent')).rejects.toThrow(AppError);
  });
});
