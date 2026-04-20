import { cookArticle } from '../src/features/articles/utils/html-cooker';

describe('HtmlCooker', () => {
  it('should transform simple HTML into blocks', () => {
    const html = '<body><h2>Title</h2><p>Hello <a href="/wiki/World">World</a>!</p></body>';
    const blocks = cookArticle(html);
    
    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe('header');
    expect(blocks[1].type).toBe('paragraph');
    expect(blocks[1].spans).toHaveLength(3); // "Hello ", "World", "!"
    expect(blocks[1].spans![1].link).toBe('World');
  });
});
