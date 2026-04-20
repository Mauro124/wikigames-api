# Tasks: Firestore Data Integration

## Phase 1: Domain Interfaces & Foundation
> Ensuring all domains have decoupled repository contracts.

- [X] 1.1 Update `src/features/results/domain/results.repository.ts` to include `exists(challengeId: string, userId: string): Promise<boolean>` {TR-004}
- [X] 1.2 Verify all feature entities extend `BaseEntity` in their respective `domain/*.entity.ts` files {TR-002}

## Phase 2: Feature Repository Refactoring
> Aligning implementations with the Base FirestoreRepository and domain interfaces.

- [X] 2.1 Refactor `src/features/challenges/data/firestore-challenges.repository.ts` to use `super('challenges')` and generic CRUD {OBJ-001}
- [X] 2.2 Refactor `src/features/results/data/firestore-results.repository.ts` to implement `exists` and use deterministic IDs {AD-009}
- [X] 2.3 Refactor `src/features/stats/data/firestore-stats.repository.ts` to implement `incrementStats` using `FieldValue.increment` {TR-003, AD-008}

## Phase 3: Verification & Testing
> Red-Green loop for data access reliability.

- [X] 3.1 Write unit tests for `FirestoreChallengesRepository` in `tests/unit/features/challenges` {QR-001}
- [X] 3.2 Write unit tests for `FirestoreResultsRepository` (check deterministic IDs and exists) {QR-001}
- [X] 3.3 Write unit tests for `FirestoreStatsRepository` (check atomic increment mock calls) {QR-001}
- [X] 3.4 Verify aggregate project coverage remains ≥ 77% (or improves towards 90%) {TDD First}
