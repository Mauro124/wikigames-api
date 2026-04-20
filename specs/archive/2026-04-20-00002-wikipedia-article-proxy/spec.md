# Feature Specification: Wikipedia Article Proxy

> ID: E002 | Status: Draft | Type: Product | Maturity: Draft

## Problem Statement

The Wikipedia Game relies on users navigating through articles via internal links. However, the standard Wikipedia web interface is cluttered with navigation menus, sidebars, references, and external links that distract from the core gameplay or allow "cheating" by leaving the article space. We need a service that proxies Wikipedia content and "cooks" it into a clean, structured format containing only the essential text and internal navigation paths.

## Scope

Implement a proxy service that fetches Wikipedia articles, sanitizes their content, and serves them in a structured JSON format compatible with the game's frontend.

### Included
- `GET /articles/:lang/:title` endpoint to retrieve sanitized articles.
- Integration with the Wikipedia Action API (`action=parse`).
- `ArticleCooker` domain service to transform raw HTML into `ArticleBlock` entities.
- HTML sanitization:
  - Extract `#mw-content-text` content.
  - Strip non-essential elements: infoboxes, tables, references, side-notes, edit links, and maintenance banners.
  - Rewrite internal links (`/wiki/Target`) into titles for the game proxy.
- In-memory caching using `node-cache` to reduce latency and API load.
- Support for "Resolved Titles" (handling redirects automatically).

### Excluded
- Rendering images (images are stripped for MVP to focus on text-based navigation).
- Multi-language search or search suggestions (direct title access only).
- Scraping non-article namespaces (File, Category, etc. - unless required for pathing).

### Edge Cases & Boundaries
- **Redirects**: If "Pizza" redirects to "Pizza (food)", the response must indicate the `resolvedTitle`.
- **Missing Pages**: Return `404 Not Found` with a descriptive message if the title does not exist.
- **Large Articles**: Sanitization must be performant even for massive pages (e.g., "United States").
- **Disconnected Links**: Ensure internal links that lead to non-article namespaces (e.g., talk pages) are removed or deactivated.

## Technical Objectives

### OBJ-001: Clean Article Extraction
Transform complex Wikipedia HTML into a simplified list of content blocks (headers and paragraphs).
- **Priority**: P1
- **Why this priority**: Core game mechanic depends on a clean reading experience.
- **Rationale**: Decoupling the view from raw HTML allows the frontend to render content natively and securely.
- **Validation**: `Article.blocks` contains only 'header' and 'paragraph' types with correct text/links.

### OBJ-002: Link Rewriting & Path Integrity
Ensure all links within an article point to the game's proxy endpoint rather than external sites.
- **Priority**: P1
- **Why this priority**: Prevents users from accidentally navigating away from the game environment.
- **Rationale**: Game integrity requires controlling the entire navigation graph.
- **Validation**: `ArticleSpan.link` contains only Wikipedia titles, no full URLs.

### OBJ-003: Performance & Caching
Reduce latency for frequently accessed articles (especially start/end points of the daily challenge).
- **Priority**: P1
- **Why this priority**: High latency during navigation ruins the "speedrun" aspect of the game.
- **Rationale**: Wikipedia API can be slow; local caching provides near-instant responses for hot pages.
- **Validation**: Repeated requests for the same title return `cached: true` and respond in < 50ms.

## Requirements

### Functional Requirements
- **FR-001**: System MUST fetch article content using Wikipedia's `action=parse` API.
- **FR-002**: System MUST identify and return the `resolvedTitle` if the input title is a redirect.
- **FR-003**: System MUST strip all `<a>` tags that do not point to a valid Wikipedia article (e.g., external links, file descriptions).
- **FR-004**: System MUST convert `<a>` tags with `href="/wiki/Title"` into `ArticleSpan` objects with the `link` property set to `Title`.
- **FR-005**: System MUST strip images, tables, infoboxes, and citations from the final output.

### Technical Requirements
- **TR-001**: Use `cheerio` for efficient HTML parsing and manipulation.
- **TR-002**: Implement `ArticleCooker` as a pure domain service (Functional Core).
- **TR-003**: Use `node-cache` with a default TTL of 3600 seconds (1 hour).
- **TR-004**: Endpoint MUST follow the pattern `GET /articles/:lang/:title`.

## Key Entities
- **Article**: Root entity containing metadata and content blocks.
- **ArticleBlock**: A discrete unit of content (Header, Paragraph).
- **ArticleSpan**: A segment of text within a paragraph, potentially containing a link.

## Assumptions & Risks
- **Assumption 1**: Wikipedia's `#mw-content-text` ID remains stable across updates.
- **Assumption 2**: Users will primarily play in English, but the system should support language prefixes.
- **Risk 1**: Over-aggressive sanitization might remove links needed to solve a specific challenge.
- **Risk 2**: Memory usage of `node-cache` might grow if too many unique articles are cached simultaneously.

## Implementation Signals
- `NEW-ENTITY`: Refine `Article`, `ArticleBlock`, `ArticleSpan` implementation.
- `NEW-SERVICE`: `WikipediaService` (data layer), `ArticleCooker` (domain layer).
- `NEW-API`: `GET /articles/:lang/:title`.

## Success Criteria
- **SC-001** [OBJ-001]: Final JSON output is ≤ 20% of the size of the raw Wikipedia HTML response.
- **SC-002** [OBJ-002]: Zero external links (non-Wikipedia) remain in the cooked content.
- **SC-003** [OBJ-003]: Cache hit ratio for a simulated game session (10 clicks) is 100% on subsequent replays.

## Compliance Check

### Instructions Check Report
**Target**: specs/00002-wikipedia-article-proxy/spec.md
**Status**: PASS

| Principle | Verdict | Notes |
|-----------|---------|-------|
| Clean Architecture | PASS | `ArticleCooker` isolated in domain; `WikipediaService` handles external API. |
| Strict Type Safety | PASS | Entity structure strictly defined in interfaces. |
| Functional Core, Imperative Shell | PASS | Cooking logic is pure; I/O (API/Cache) handled at boundaries. |
| Test-Driven Development (TDD) | PASS | High testability of `ArticleCooker` with static HTML snapshots. |
