# Tasks: Results & Global Stats

## Phase 1: Domain Logic (Functional Core)
> Implementing the validation, idempotency, and aggregation logic.

- [X] 1.1 Update `src/features/results/domain/submit-result.usecase.ts` to validate bounds (`clicks >= 1`, `timeSeconds >= 1`) {FR-002, OBJ-001}
- [X] 1.2 Update `submit-result.usecase.ts` to check `exists()` and return early if true {FR-003, SC-001}
- [X] 1.3 Update `submit-result.usecase.ts` to call `save()` and `incrementStats()` on success {FR-004, OBJ-002}
- [X] 1.4 Update `src/features/stats/domain/get-stats.usecase.ts` to calculate `averageClicks` and `averageTime` {FR-006}

## Phase 2: Delivery & Controllers (Imperative Shell)
> Exposing the domain logic via Express.

- [X] 2.1 Update `src/features/results/controllers/result.controller.ts` to handle `POST /results` payload and return `{ success, alreadySubmitted }` {FR-001}
- [X] 2.2 Update `src/features/stats/controllers/stats.controller.ts` to handle `GET /challenges/:id/stats` {FR-005}

## Phase 3: Verification
> TDD cycle to ensure robust aggregation and submission handling.

- [X] 3.1 Write unit tests for `SubmitResultUseCase` (mock repositories, test validation and duplicate rejection) {SC-001}
- [X] 3.2 Write unit tests for `GetStatsUseCase` (test average calculation and divide-by-zero handling) {FR-006}
- [X] 3.3 Write integration tests for `POST /results` and `GET /challenges/:id/stats` in `tests/stats-flow.test.ts` {SC-002}
