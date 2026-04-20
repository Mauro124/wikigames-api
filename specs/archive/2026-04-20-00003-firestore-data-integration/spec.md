# Feature Specification: Firestore Data Integration

> ID: E003 | Status: Draft | Type: Technical | Maturity: Draft

## Problem Statement

While a `BaseFirestoreRepository` foundation exists, the specific feature repositories (Challenges, Results, Stats) are inconsistently implemented and lack robust type safety and unit testing. To support the "Game Loop & Storage" wave, we need a standardized, reliable persistence layer that follows the Clean Architecture principles established in E001, ensuring that domain logic is completely decoupled from Firestore implementation details.

## Scope

Refactor and finalize the Firestore data access layer for all core features.

### Included
- Refactor `FirestoreChallengesRepository` to fully leverage `BaseFirestoreRepository` methods.
- Refactor `FirestoreResultsRepository` with optimized query methods for retrieving results by challenge.
- Refactor `FirestoreStatsRepository` with atomic increment operations for real-time stats aggregation.
- Implement missing domain repository interfaces to ensure strict decoupling (Functional Core).
- Standardize metadata management (createdAt, updatedAt) via the base repository.
- Robust error mapping from Firestore exceptions to `AppError`.

### Excluded
- Implementation of the monthly generation logic (E004 scope).
- Implementation of the results submission logic (E005 scope).
- Complex multi-collection transactions (unless required for stats integrity).

### Edge Cases & Boundaries
- **Concurrency**: `incrementStats` MUST use Firestore atomic counters to prevent race conditions during peak submission times.
- **Large Result Sets**: Queries for results by challenge must be indexed and potentially paginated if they exceed reasonable limits.
- **Data Integrity**: Ensure that `GameResult` IDs are deterministic (`${challengeId}_${userId}`) to prevent duplicate submissions from the same user.

## Technical Objectives

### OBJ-001: Standardized Data Access
Ensure all feature repositories follow a consistent pattern and leverage shared base logic.
- **Priority**: P1
- **Why this priority**: Required foundation for all Wave 2 and Wave 3 features.
- **Rationale**: Redundant data access logic increases maintenance cost and risk of bugs.
- **Validation**: All feature repositories extend `BaseFirestoreRepository` and implement a domain interface.

### OBJ-002: Atomic Aggregation
Support real-time, concurrent-safe statistics calculation.
- **Priority**: P1
- **Why this priority**: Correct global stats are critical for the social/competitive aspect of the game.
- **Rationale**: Manual read-modify-write cycles will fail under high load.
- **Validation**: `FirestoreStatsRepository` uses `FieldValue.increment` for all numeric metrics.

## Requirements

### Technical Requirements
- **TR-001**: Feature repositories MUST NOT export Firestore-specific types (e.g., `DocumentReference`) to the domain layer.
- **TR-002**: Use Firestore `set(..., { merge: true })` or `update()` for partial updates to preserve metadata.
- **TR-003**: Implement `incrementStats(challengeId, clicks, time)` using atomic increments.
- **TR-004**: Each repository MUST have a corresponding domain interface in `domain/`.

### Quality Requirements
- **QR-001**: All repository methods MUST have unit tests with a mocked Firestore instance.
- **QR-002**: Integration tests MUST verify correct metadata generation (timestamps).

## Key Entities
- **ChallengesRepository**: Interface for daily challenge persistence.
- **ResultsRepository**: Interface for game result storage and retrieval.
- **StatsRepository**: Interface for daily metrics aggregation.

## Assumptions & Risks
- **Assumption 1**: Firestore auto-generated IDs are sufficient for challenges unless pre-calculated with custom IDs.
- **Risk 1**: Composite indices might be required for complex result queries, leading to deployment delays.
- **Risk 2**: `node-cache` from E002 is sufficient for articles; Firestore article caching is not needed for MVP.

## Implementation Signals
- `REFACTOR`: `src/features/*/data/*repository.ts`.
- `NEW-ENTITY`: Domain repository interfaces.
- `MIGRATION`: Ensure existing data in Firestore (if any) matches the new `BaseEntity` structure.

## Success Criteria
- **SC-001** [OBJ-001]: Feature repositories contain < 30 lines of implementation-specific code (excluding custom queries).
- **SC-002** [OBJ-002]: Load test with 10 concurrent increments results in correct final sum.

## Compliance Check

### Instructions Check Report
**Target**: specs/00003-firestore-data-integration/spec.md
**Status**: PASS

| Principle | Verdict | Notes |
|-----------|---------|-------|
| Clean Architecture | PASS | Enforces domain interfaces to decouple logic from Firestore. |
| Strict Type Safety | PASS | Prohibits leak of infrastructure types to domain. |
| Functional Core | PASS | Data layer acts as the "Shell" for persistence side effects. |
| TDD First | PASS | QR-001 mandates unit tests with mocks. |
