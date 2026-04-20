# Tasks: Base Feature-Sliced Backend

## Phase 1: Shared Domain & Data Abstractions
> Foundation for the "Functional Core" and repository pattern.

- [X] 1.1 Create `src/shared/domain/base.entity.ts` with `BaseEntity` interface {TR-003}
- [X] 1.2 Create `src/shared/domain/app-error.ts` with `AppError` class extending `Error` {TR-004}
- [X] 1.3 Create `src/shared/data/base-firestore.repository.ts` with `BaseFirestoreRepository` abstract class {TR-003}

## Phase 2: Core Infrastructure Services
> Standardizing logging and observability.

- [X] 2.1 Refactor `src/shared/services/logger.service.ts` to use `pino-http` with `genReqId` and `redact` {TR-001, TR-002, OR-001, OR-002}

## Phase 3: Middleware & Server Refactor
> Configuring the "Imperative Shell" with Express 5 and security.

- [X] 3.1 Refactor `src/middleware/error-handler.middleware.ts` to be a 4-argument async-aware handler using `AppError` {OBJ-001}
- [X] 3.2 Refactor `src/index.ts` to configure `helmet` and `cors` with environment-based settings {TR-005, OBJ-001}
- [X] 3.3 Ensure `app.use(errorHandler)` is registered as the last middleware in `src/index.ts` {HINT-001}

## Phase 4: Verification & Testing
> Ensuring the foundation is stable.

- [X] 4.1 Write unit tests for `AppError` and `BaseFirestoreRepository` in `tests/unit/shared` {SC-003}
- [X] 4.2 Write integration tests for `index.ts` middleware (security headers, logger reqId) in `tests/integration/server` {SC-001, SC-002}
- [X] 4.3 Verify `npm audit` returns no critical vulnerabilities {SC-002}

## Phase: Bug Fixes
- [X] T011 [BUG:CRITICAL] Fix `TypeError: this.collection.doc is not a function` in `FirestoreResultsRepository` {TR-003}
- [X] T012 [BUG:ERROR] Remove unused `AppError` import in `src/shared/data/base-firestore.repository.ts` {TR-003}
- [X] T013 [BUG:WARNING] Increase test coverage for `BaseFirestoreRepository` to meet 90% threshold {TR-003}
