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

  const wikiHeaders = {
    'user-agent': 'WikiGameBackend/1.0 (contact@example.com)',
  };

  it('should return cooked article JSON', async () => {
    nock('https://en.wikipedia.org')
      .get('/api/rest_v1/page/html/Earth')
      .reply(
        200, 
        '<html><body><div id="mw-content-text"><p>Earth is <a href="./Planet">Planet</a>.</p></div></body></html>', 
        { etag: '123' }
      );

    const response = await request(app).get('/articles/en/Earth');

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Earth');
    expect(response.body.blocks).toHaveLength(1);
    expect(response.body.blocks[0].spans[1].link).toBe('Planet');
  });

  it('should use cache on subsequent requests', async () => {
    // 1st request hits Nock
    nock('https://en.wikipedia.org')
      .get('/api/rest_v1/page/html/CacheTest')
      .reply(200, '<div>Content</div>', { etag: '456' });

    await request(app).get('/articles/en/CacheTest');

    // 2nd request should NOT hit Nock but if it does (incorrectly), 
    // we mock a 304 to simulate what happens if cache logic tries to revalidate
    nock('https://en.wikipedia.org')
      .get('/api/rest_v1/page/html/CacheTest')
      .reply(304);

    const response = await request(app).get('/articles/en/CacheTest');
    expect(response.status).toBe(200);
    expect(response.body.cached).toBe(true);
  });

  it('should return 404 for invalid articles', async () => {
    nock('https://en.wikipedia.org')
      .get('/api/rest_v1/page/html/Missing_Article')
      .reply(404);

    const response = await request(app).get('/articles/en/Missing_Article');
    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
  });
});
