# Tasks: Monthly Challenge Generation

## Phase 1: Domain Extensions & Categories
> Preparing the data structures and thematic pool.

- [X] 1.1 Create `src/features/challenges/domain/categories.ts` with 30 curated category titles {FR-001}
- [X] 1.2 Update `src/features/challenges/domain/challenge.entity.ts` to include `category: string` {TR-003}

## Phase 2: Wikipedia Feed Service
> Implementation of the category and link graph adapters.

- [X] 2.1 Create `src/features/challenges/data/wikipedia-feed.service.ts` with `getRandomArticlesFromCategory` {FR-002}
- [X] 2.2 Implement `getLinksForPage(title: string)` in `WikipediaFeedService` for BFS {FR-004}

## Phase 3: Generator Use Case (The "Meat")
> Implementing the generation loop and reachability check.

- [X] 3.1 Implement `isReachable(start: string, end: string)` BFS logic in `GenerateChallengeUseCase` {FR-004, OBJ-002}
- [X] 3.2 Implement `generateMonthlyBatch(startDate: Date)` loop (30 days * 10 pairs) {FR-003, OBJ-001, OBJ-003}
- [X] 3.3 Integrate Firestore batch writes to save 300 challenges {FR-005, OBJ-003}

## Phase 4: Trigger & Delivery
> Exposing the internal automation endpoint.

- [X] 4.1 Create `src/features/challenges/controllers/internal-challenge.controller.ts` {OBJ-003}
- [X] 4.2 Register `POST /internal/challenges/generate` in `src/routes/internal.routes.ts` {OBJ-003}

## Phase 5: Verification
> ensuring playability and data integrity.

- [X] 5.1 Unit test `isReachable` with a small mock link graph {OBJ-002}
- [X] 5.2 Integration test the trigger endpoint (smoke test for 1 day) {SC-003}
