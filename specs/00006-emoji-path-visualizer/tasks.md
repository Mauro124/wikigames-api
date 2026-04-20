# Tasks: Emoji Path Share Visualizer

## Phase 1: Share Visualizer Utility (Functional Core)
> Implementation of the pure text generation and formatting logic.

- [X] 1.1 Create `src/features/results/utils/share-visualizer.ts` with `ShareVisualizer` class {TR-001}
- [X] 1.2 Implement `formatHeader(challengeId: string, clicks: number, timeSeconds: number)` method {FR-002}
- [X] 1.3 Implement `generateGrid(pathLength: number, averageClicks: number)` method with performance color coding {FR-003, FR-004, OBJ-002}
- [X] 1.4 Implement truncation logic inside `generateGrid` for paths > 25 clicks {FR-005}

## Phase 2: Integration & Delivery (Imperative Shell)
> Exposing the generated text via the submission endpoint.

- [X] 2.1 Update `SubmitResultResponse` interface in `submit-result.usecase.ts` to include `shareText?: string` {FR-001}
- [X] 2.2 Update `submit-result.usecase.ts` to fetch current `DailyStats` via `statsRepository.findById(challengeId)` to get `averageClicks` before saving {FR-004}
- [X] 2.3 Update `submit-result.usecase.ts` to invoke `shareVisualizer.generate(...)` and return the string {TR-002, FR-001}

## Phase 3: Verification
> TDD cycle to ensure robust string generation and integration.

- [X] 3.1 Write unit tests for `ShareVisualizer` (header formatting, emoji scaling, truncation) in `tests/unit/features/results/share-visualizer.test.ts` {SC-001, SC-002}
- [X] 3.2 Update `SubmitResultUseCase` unit tests to mock `statsRepository.findById` and expect `shareText` in the response {FR-001}
- [X] 3.3 Run the full test suite and verify no regressions in existing `stats-flow.test.ts` integration {OBJ-001}
