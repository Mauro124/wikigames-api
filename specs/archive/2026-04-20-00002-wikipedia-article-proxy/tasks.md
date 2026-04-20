# Tasks: Wikipedia Article Proxy

## Phase 1: Domain Logic & Article Cooking
> Implementation of the pure "Article Cooking" logic using Cheerio.

- [X] 1.1 Create `src/features/articles/utils/html-cooker.ts` with `ArticleCooker` class {TR-001, TR-002}
- [X] 1.2 Implement `cook(html: string)` method to extract `#mw-content-text` {FR-005, OBJ-001}
- [X] 1.3 Implement `parseParagraph(p: Element)` to extract `ArticleSpan` with rewritten links {FR-003, FR-004, OBJ-002}
- [X] 1.4 Implement header extraction (`h1`, `h2`, `h3`) as `ArticleBlock` {FR-005, OBJ-001}

## Phase 2: Data Layer & API Client
> Integration with Wikipedia Action API.

- [X] 2.1 Create `src/features/articles/data/wikipedia.service.ts` using `axios` {FR-001}
- [X] 2.2 Implement `fetchArticle(lang: string, title: string)` to call `action=parse` {FR-001, OBJ-003}
- [X] 2.3 Implement redirect resolution logic to identify `resolvedTitle` {FR-002}

## Phase 3: Application & Delivery
> Use case orchestration and Express delivery.

- [X] 3.1 Create `src/features/articles/domain/get-article.usecase.ts` to orchestrate fetch and cook {OBJ-001}
- [X] 3.2 Create `src/features/articles/controllers/article.controller.ts` with `node-cache` integration {TR-003, OBJ-003}
- [X] 3.3 Create `src/features/articles/article.routes.ts` and register in `src/routes/index.ts` {TR-004}

## Phase 4: Verification & Testing
> Ensuring proxy integrity and performance.

- [X] 4.1 Write unit tests for `ArticleCooker` with Wikipedia HTML snapshots in `tests/unit/features/articles` {SC-001, SC-002}
- [X] 4.2 Write unit tests for `WikipediaService` using `nock` to mock API responses {FR-001, FR-002}
- [X] 4.3 Write integration tests for `GET /articles/:lang/:title` in `tests/integration/features/articles` {SC-003}
