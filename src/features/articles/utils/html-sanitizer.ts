import * as cheerio from 'cheerio';

export const sanitizeHtml = (rawHtml: string): string => {
  const $ = cheerio.load(rawHtml);

  // 1. ELIMINACIÓN TOTAL de lo que no es contenido
  $(
    'script, style, link, meta, noscript, ' +
      '.infobox, .sidebar, .navbox, .mw-editsection, .reference, .reflist, ' +
      '.catlinks, #mw-navigation, #footer, .noprint, .ambox, ' +
      'table, audio, video, .mw-empty-elt',
  ).remove();

  // 2. LIMPIEZA DE ESTRUCTURA: Solo dejamos etiquetas de contenido puro
  const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'a', 'img', 'b', 'i', 'ul', 'li'];

  $('*').each((_, element) => {
    if (element.type === 'tag' && !allowedTags.includes(element.name)) {
      // Si la etiqueta no está permitida (ej. div, span, section), la "desenvolvemos" dejando su contenido
      $(element).replaceWith($(element).contents());
    }
  });

  // 3. LIMPIEZA DE ATRIBUTOS: Quitar clases y estilos de Wikipedia que rompen Flutter
  $('*').each((_, element) => {
    const tagName = element.type === 'tag' ? element.name : '';
    const attributes = $(element).attr();

    for (const attr in attributes) {
      if (tagName === 'a' && attr === 'href') {
        const href = attributes[attr];
        if (href && href.startsWith('/wiki/')) {
          const title = href.replace('/wiki/', '');
          $(element).attr('href', `/articles/current_lang/${title}`);
        } else {
          $(element).removeAttr('href');
        }
      } else if (tagName === 'img' && (attr === 'src' || attr === 'width' || attr === 'height')) {
        // Keep src and dimensions for images
      } else {
        // Remove everything else (class, style, id, etc.)
        $(element).removeAttr(attr);
      }
    }
  });

  // 4. Limpiar texto vacío o párrafos basura
  $('p').each((_, el) => {
    if ($(el).text().trim().length === 0) $(el).remove();
  });

  return $('body').html() || '';
};
