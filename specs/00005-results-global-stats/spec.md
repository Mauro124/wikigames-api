# Feature Specification: Results & Global Stats

> ID: E005 | Status: Draft | Type: Product | Maturity: Draft

## Problem Statement

To provide a satisfying and engaging daily loop, players need to know how well they performed compared to others. The "Navigator Nancy" persona specifically cares about benchmarking her performance. Without a system to submit results and view global averages and distributions, the game lacks a competitive or social anchor. We need a secure, atomic way to collect anonymous game results and instantly update global daily statistics for each challenge.

## Scope

Implement the endpoints and domain logic for users to submit their completed game results and fetch aggregated global statistics for a specific challenge.

### Included
- `POST /results` endpoint to receive a player's `GameResult`.
- `GET /challenges/:challengeId/stats` endpoint to retrieve `DailyStats`.
- Domain logic to validate result submissions (e.g., minimum valid clicks).
- Integration with the `FirestoreStatsRepository` (implemented in E003) to atomically update the challenge's global stats upon each valid submission.
- Calculation of dynamic averages (`averageClicks`, `averageTime`) based on `sumClicks`, `sumTime`, and `totalWins`.

### Excluded
- User authentication or session tracking (results are anonymous or tracked via an opaque, client-provided `userId`).
- Anti-cheat validation of the exact path (trusting the client for MVP to avoid heavy server-side validation).
- Emoji generation for sharing (E006 scope).

### Edge Cases & Boundaries
- **Duplicate Submissions**: A user might click "submit" twice. The backend must enforce idempotency using the deterministic ID (`${challengeId}_${userId}`) ensuring stats are only incremented once per user per challenge.
- **Outliers**: A user might submit a time of 0 seconds or 1,000,000 clicks. The domain logic must reject absurd outliers to protect the global averages.
- **Concurrent Writes**: High traffic at daily reset must be handled gracefully by Firestore `FieldValue.increment` (already established in E003).

## Technical Objectives

### OBJ-001: Robust Result Ingestion
Accept and validate incoming game results reliably.
- **Priority**: P1
- **Why this priority**: Corrupted data will ruin the global stats experience.
- **Rationale**: Client-side data cannot be fully trusted; basic bounds checking prevents accidental database pollution.
- **Validation**: Rejects `clicks < 1`, `timeSeconds <= 0`, and duplicate submissions from the same user.

### OBJ-002: Real-time Aggregation
Keep global statistics accurate and up-to-date without batch jobs.
- **Priority**: P1
- **Why this priority**: Users want immediate feedback on how their score affected the global average.
- **Rationale**: Given the expected scale, atomic increments are more efficient than running a background cron to calculate averages.
- **Validation**: Submitting a result immediately updates the `sumClicks`, `sumTime`, and `totalWins` in the stats document.

## Requirements

### Functional Requirements
- **FR-001**: System MUST expose a `POST /results` endpoint accepting `challengeId`, `userId`, `clicks`, `timeSeconds`, and `path`.
- **FR-002**: System MUST reject result submissions where `clicks` is less than 1 or `timeSeconds` is less than 1.
- **FR-003**: System MUST check if a result already exists for the given `challengeId` and `userId`. If it exists, return a `409 Conflict` (or `200 OK` with a "already submitted" message, but do not increment stats).
- **FR-004**: System MUST increment the corresponding `DailyStats` document in Firestore using atomic operations upon successful result submission.
- **FR-005**: System MUST expose a `GET /challenges/:challengeId/stats` endpoint returning the aggregated stats.
- **FR-006**: System MUST calculate and return `averageClicks` and `averageTime` dynamically based on the stored sums when stats are requested.

### Technical Requirements
- **TR-001**: Implement `SubmitResultUseCase` in the domain layer.
- **TR-002**: Implement `GetStatsUseCase` in the domain layer.
- **TR-003**: Use `resultsRepository.exists` to check for duplicates before saving.
- **TR-004**: Use `statsRepository.incrementStats` to update aggregations.

## Key Entities
- **GameResult**: Defined in E003. Represents a single run.
- **DailyStats**: Defined in E003. Represents aggregated metrics.

## Assumptions & Risks
- **Assumption 1**: The client is responsible for generating a persistent, anonymous `userId` (e.g., a UUID stored in LocalStorage) to track idempotency.
- **Risk 1**: "Trusting the client" for the path and clicks means malicious actors can skew stats. (Mitigation: Bounds checking in FR-002. Advanced anti-cheat is out of scope for MVP).

## Implementation Signals
- `MODIFIED-API`: Implementation of the placeholder `POST /results` and `GET /challenges/:challengeId/stats` endpoints in existing router files.
- `MODIFIED-SERVICE`: Implement logic in `submit-result.usecase.ts` and `get-stats.usecase.ts`.

## Success Criteria
- **SC-001** [OBJ-001]: Endpoint rejects duplicate submissions from the same `userId` for the same `challengeId`.
- **SC-002** [OBJ-002]: `GET /challenges/:challengeId/stats` returns accurate calculated averages after multiple concurrent submissions.

## Compliance Check

### Instructions Check Report
**Target**: specs/00005-results-global-stats/spec.md
**Status**: PASS

| Principle | Verdict | Notes |
|-----------|---------|-------|
| Clean Architecture | PASS | Use cases orchestrated in domain; data layer interfaces (from E003) injected or used. |
| Strict Type Safety | PASS | Request payloads must be strictly typed and validated. |
| Functional Core | PASS | Domain logic enforces duplicate checks and bounds validation before hitting data adapters. |
| TDD First | PASS | Requires unit tests for use cases, specifically the bounds checking and average calculations. |
