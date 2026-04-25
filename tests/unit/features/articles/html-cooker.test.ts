import { ArticleCooker } from '../../../../src/features/articles/utils/html-cooker';

describe('ArticleCooker', () => {
  let articleCooker: ArticleCooker;

  beforeEach(() => {
    articleCooker = new ArticleCooker();
  });

  const mockHtml = `
    <div id="mw-content-text">
      <div class="mw-parser-output">
        <h2>Header 1</h2>
        <p>Paragraph 1 with <a href="/wiki/Target">internal link</a>.</p>
        <p>Paragraph 2 with <a href="https://google.com">external link</a> and <a href="/wiki/File:Image.jpg">special link</a>.</p>
        <h3>Header 2</h3>
        <p>Final paragraph.</p>
      </div>
    </div>
  `;

  it('should extract headers and paragraphs', () => {
    const blocks = articleCooker.cook(mockHtml);

    expect(blocks).toHaveLength(5);
    expect(blocks[0]).toEqual({ type: 'header', text: 'Header 1', level: 2 });
    expect(blocks[1].type).toBe('paragraph');
    expect(blocks[3]).toEqual({ type: 'header', text: 'Header 2', level: 3 });
  });

  it('should rewrite internal links and strip others', () => {
    const blocks = articleCooker.cook(mockHtml);
    const p1 = blocks[1].spans!;
    const p2 = blocks[2].spans!;

    // Internal link
    const linkSpan = p1.find((s) => s.link === 'Target');
    expect(linkSpan).toBeDefined();
    expect(linkSpan?.text).toBe('internal link');

    // External link (stripped but text kept)
    expect(p2.some((s) => s.text.includes('external link'))).toBe(true);
    expect(p2.some((s) => s.link)).toBe(false); // No link property
  });

  it('should handle redirects and encoded titles', () => {
    const htmlWithEncoded = `
      <div id="mw-content-text">
        <p><a href="/wiki/Garc%C3%ADa_M%C3%A1rquez">Gabriel</a></p>
      </div>
    `;
    const blocks = articleCooker.cook(htmlWithEncoded);
    expect(blocks[0].spans![0].link).toBe('García_Márquez');
  });
});
