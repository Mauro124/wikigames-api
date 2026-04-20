import request from 'supertest';
import nock from 'nock';
import { app, server } from '../../../../src/index';

describe('Article Proxy Integration', () => {
  afterAll((done) => {
    if (server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should return cooked article JSON', async () => {
    nock('https://en.wikipedia.org')
      .get('/w/api.php')
      .query({
        action: 'parse',
        page: 'Earth',
        prop: 'text',
        redirects: '1',
        format: 'json',
        origin: '*',
      })
      .reply(200, {
        parse: {
          title: 'Earth',
          text: {
            '*': '<div id="mw-content-text"><p>Earth is <a href="/wiki/Planet">Planet</a>.</p></div>',
          },
        },
      });

    const response = await request(app).get('/articles/en/Earth');

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Earth');
    expect(response.body.blocks).toHaveLength(1);
    expect(response.body.blocks[0].spans[1].link).toBe('Planet');
  });

  it('should use cache on subsequent requests', async () => {
    // 1st request hits Nock
    nock('https://en.wikipedia.org')
      .get('/w/api.php')
      .query(true)
      .reply(200, {
        parse: {
          title: 'CacheTest',
          text: { '*': '<div>Content</div>' },
        },
      });

    await request(app).get('/articles/en/CacheTest');

    // 2nd request should NOT hit Nock (would fail if it did because nock is clean)
    const response = await request(app).get('/articles/en/CacheTest');
    expect(response.status).toBe(200);
    expect(response.body.cached).toBe(true);
  });

  it('should return 404 for invalid articles', async () => {
    nock('https://en.wikipedia.org')
      .get('/w/api.php')
      .query(true)
      .reply(200, {
        error: { code: 'missingtitle' },
      });

    const response = await request(app).get('/articles/en/Missing_Article');
    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
  });
});
