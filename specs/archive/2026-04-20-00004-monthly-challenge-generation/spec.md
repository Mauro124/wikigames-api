# Feature Specification: Monthly Challenge Generation

> ID: E004 | Status: Draft | Type: Product | Maturity: Draft

## Problem Statement

The WikiGames platform needs a steady stream of engaging content to keep users coming back. Manually creating challenges is not scalable, and purely random pairs often result in impossible or boring paths. We need an automated system that generates a monthly batch of challenges, organized by daily categories, ensuring reachability and thematic consistency.

## Scope

Implement an internal automated generator that pre-calculates 10 reachable challenges per day for a 30-day period.

### Included
- `POST /internal/challenges/generate` endpoint to trigger the monthly batch.
- Category-based article selection:
  - Define a list of high-level Wikipedia categories (e.g., Science, History, Geography, Pop Culture).
  - Assign one unique category per day for the 30-day period.
  - Select 10 pairs of articles per day from the assigned category.
- Reachability Verification:
  - For each pair, run a simplified reachability check (BFS) to ensure a path exists (max 6 clicks).
- Batch Storage:
  - Generate 300 challenges in total (10 per day * 30 days).
  - Use `YYYY-MM-DD_N` as the Challenge ID (where N is 0-9).
- Update `Challenge` entity to include the `category` field.

### Excluded
- Real-time generation during gameplay (all must be pre-calculated).
- Categorization of *all* existing Wikipedia articles (use pre-defined category lists).
- Public-facing category browser (internal generation only).

### Edge Cases & Boundaries
- **Category Depletion**: If a category has fewer than 20 unique high-quality articles, the generator should fallback to a general "Popular" category.
- **Unreachable Pairs**: The generator MUST retry selection if the BFS fails to find a path within 6 clicks.
- **Overlapping Generations**: If a batch for a specific date range already exists, the generator should overwrite or skip based on a flag (default: skip).

## Technical Objectives

### OBJ-001: Thematic Consistency
Assign a single specific category to all 10 challenges of a given day.
- **Priority**: P1
- **Why this priority**: Required by the user to provide a curated daily experience.
- **Rationale**: Categories make the daily challenge more interesting and "sharable" (e.g., "Today is Science day!").
- **Validation**: `Challenge.category` is populated and matches for all 10 daily IDs.

### OBJ-002: Guaranteed Playability
Verify that every generated challenge is solvable within a reasonable number of steps.
- **Priority**: P1
- **Why this priority**: Broken challenges (unreachable) ruin the user experience.
- **Rationale**: Wikipedia's graph is mostly connected, but orphans and dead-ends exist.
- **Validation**: Generator log confirms BFS success for all 300 entries.

### OBJ-003: Monthly Automation
Generate 30 days of content in a single execution.
- **Priority**: P1
- **Why this priority**: Minimizes operational overhead for the admin.
- **Rationale**: Batching reduces API calls and database writes compared to daily crons.
- **Validation**: Firestore `challenges` collection contains 300 new entries after execution.

## Requirements

### Functional Requirements
- **FR-001**: System MUST pick one category from a pre-defined list for each of the next 30 days.
- **FR-002**: System MUST fetch random articles from the selected Wikipedia category using `list=categorymembers`.
- **FR-003**: System MUST generate 10 unique pairs (Start/End) per day.
- **FR-004**: System MUST verify reachability using a BFS algorithm with a depth limit of 6.
- **FR-005**: System MUST store challenges with IDs formatted as `YYYY-MM-DD_N`.

### Technical Requirements
- **TR-001**: Implement `WikipediaFeedService` to handle category-based article retrieval.
- **TR-002**: Implement `ChallengeGenerator` domain service to handle the generation loop and BFS logic.
- **TR-003**: Update `Challenge` interface to include `category: string`.
- **TR-004**: Use Firestore batch writes (if possible) or sequential writes with delay to avoid rate limits.

## Key Entities
- **CategoryList**: A static list of curated Wikipedia category titles.
- **Challenge**: Updated with `category`.

## Assumptions & Risks
- **Assumption 1**: The BFS check can be performed efficiently using the existing `ArticleCooker` or a specialized link-only fetcher.
- **Assumption 2**: 30 days starting from "today" or a provided "start date".
- **Risk 1**: BFS on Wikipedia can be slow and I/O intensive if many levels are explored. (Mitigation: Limit depth and use a link-graph API if available).

## Implementation Signals
- `NEW-ENTITY`: `Category` definitions.
- `MODIFIED-ENTITY`: `Challenge` entity.
- `NEW-API`: `POST /internal/challenges/generate`.
- `NEW-SERVICE`: `WikipediaFeedService`.

## Success Criteria
- **SC-001** [OBJ-001]: Every day in the next month has exactly 10 challenges assigned to a specific category.
- **SC-002** [OBJ-002]: No "unreachable" challenge is ever saved to the database.
- **SC-003** [OBJ-003]: Batch generation completes in under 5 minutes for 300 challenges.

## Compliance Check

### Instructions Check Report
**Target**: specs/00004-monthly-challenge-generation/spec.md
**Status**: PASS

| Principle | Verdict | Notes |
|-----------|---------|-------|
| Clean Architecture | PASS | Generation logic in domain service; I/O in feed service. |
| Strict Type Safety | PASS | IDs and categories explicitly typed. |
| Functional Core | PASS | BFS logic is pure; only database save is a side effect. |
| TDD First | PASS | Verification includes testing the reachability logic with known paths. |
