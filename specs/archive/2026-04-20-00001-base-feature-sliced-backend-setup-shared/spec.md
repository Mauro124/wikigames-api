# Feature Specification: Base Feature-Sliced Backend

> ID: E001 | Status: Draft | Type: Technical | Maturity: Draft

## Problem Statement

The project currently lacks a strictly enforced architectural structure and robust, production-grade infrastructure baseline. Without a clear "Feature-Sliced" layout and standardized cross-cutting concerns (logging, error handling, security), the codebase will become difficult to maintain, test, and audit as it grows. This epic establishes the "Functional Core, Imperative Shell" foundations and the modular "Feature-Sliced" directory structure required for the WikiGames platform.

## Scope

Establish the base technical infrastructure and architectural layers to support modular development.

### Included
- Refactor/Standardize server entry point (`src/index.ts`) for Express 5.x.
- Configure `helmet` and `cors` with production-ready defaults.
- Implement structured logging using `pino-http` with request correlation IDs and sensitive data redaction.
- Create a centralized, four-argument error-handling middleware aligned with Express 5.x native async support.
- Implement base architectural abstractions in `src/shared`:
  - `BaseFirestoreRepository`: Shared persistence logic.
  - `AppError`: Custom error class for domain-driven error reporting.
- Establish the `features/` directory layout: `domain/`, `data/`, `controllers/`.

### Excluded
- Implementation of specific game features (Articles, Challenges, Results).
- Deployment pipeline configuration (DOD scope).
- External authentication provider integration.

### Edge Cases & Boundaries
- **Environment Parity**: Logging must use `pino-pretty` in development but raw JSON in production.
- **Async Errors**: The error handler must catch both synchronous throws and rejected promises from Express 5 routes.
- **Redaction**: Request headers (e.g., `Authorization`) and sensitive body fields must be redacted from logs.

## Technical Objectives

### OBJ-001: Production-Grade Security & Logging
Ensure the backend is secure by default and every request is traceable via correlation IDs.
- **Priority**: P1
- **Why this priority**: Security and observability are foundational requirements that must be established before any business logic is implemented.
- **Rationale**: Security headers and traceability are non-negotiable for production services.
- **Deliverables**: Configured `helmet`, `cors`, and `pino-http` middleware.
- **Validation**: Logs contain `reqId` and `helmet` headers are present in response.

### OBJ-002: Feature-Sliced Architecture Baseline
Enforce a "Clean Architecture" inspired layout with clear boundaries between domain and infra.
- **Priority**: P1
- **Why this priority**: This establishes the directory structure and shared patterns that all subsequent features must follow to maintain project integrity.
- **Rationale**: Decoupling logic from frameworks (Express/Firestore) enables TDD and easier refactoring.
- **Deliverables**: Base repository class and `AppError` entity.
- **Validation**: Feature directories follow the `domain/data/controllers` pattern.

## Requirements

### Technical Requirements
- **TR-001**: Use `pino-http` to attach `req.log` and `reqId` to all requests.
- **TR-002**: Redact `req.headers.authorization` and `req.body.password` from logs.
- **TR-003**: Implement `BaseFirestoreRepository<T>` with standard CRUD methods using `firebase-admin`.
- **TR-004**: Define `AppError` class extending `Error` with `statusCode` and `isOperational` flags.
- **TR-005**: Configure `cors` with an environment-based allowed-origins list.

### Operational Requirements
- **OR-001**: Logs in development must be human-readable (`pino-pretty`).
- **OR-002**: Logs in production MUST be raw JSON for machine parsing.

## Key Entities
- **AppError**: Domain-agnostic error wrapper for operational failures.
- **BaseRepository**: Abstract interface/class for Firestore data access.

## Assumptions & Risks
- **Assumption 1**: Express 5.x native async handling removes the need for `express-async-handler`.
- **Assumption 2**: `firebase-admin` is already initialized in a separate config.
- **Risk 1**: Overly complex base classes might hinder initial development speed.

## Implementation Signals
- `NEW-ENTITY`: `AppError` and shared domain interfaces.
- `NEW-API`: (None - infra only).
- `MIGRATION`: Refactoring existing `index.ts` and `error-handler`.
- `NEW-CONFIG`: Advanced `helmet` and `cors` configuration.

## Success Criteria
- **SC-001** [OBJ-001]: Every log entry in a request-response cycle shares a unique `reqId`.
- **SC-002** [OBJ-001]: Responses include standard security headers (`X-Content-Type-Options`, `Content-Security-Policy`).
- **SC-003** [OBJ-002]: Unit tests for domain logic can run without an Express instance.

## Compliance Check

### Instructions Check Report
**Target**: specs/00001-base-feature-sliced-backend-setup-shared/spec.md
**Status**: PASS

| Principle | Verdict | Notes |
|-----------|---------|-------|
| Clean Architecture | PASS | OBJ-002 enforces feature-sliced layers and decoupled base repository. |
| Strict Type Safety | PASS | Technical requirements emphasize explicit types for errors and entities. |
| Functional Core, Imperative Shell | PASS | Logic is isolated in domain services; side effects (Pino, Firestore) at boundaries. |
| Test-Driven Development (TDD) | PASS | SC-003 requires domain logic to be testable without an Express instance. |

