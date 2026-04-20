# Feature Specification: Emoji Path Share Visualizer

> ID: E006 | Status: Draft | Type: Product | Maturity: Draft

## Problem Statement

To achieve the "Viral Shareability" UX principle, users need a way to share their success (or failure) on social media without spoiling the actual path (the specific Wikipedia articles) for others. A visual, text-based representation of their journey—similar to Wordle's emoji grid—is required to foster a shared social experience.

## Scope

Implement the domain logic to transform a completed game result into a standardized, shareable text snippet containing emoji representations of the user's path.

### Included
- `ShareVisualizer` domain service to generate the text snippet.
- Integration with the existing `POST /results` endpoint to return the generated share text alongside the success response.
- Logic to determine the emoji representation based on path length and performance compared to the global average.
  - E.g., 🟩 (efficient), 🟨 (average), 🟥 (inefficient).
- Generation of the header text (e.g., `WikiGame 2024-06-01 (Science) 5 clicks ⏱️ 1:20`).

### Excluded
- Image/Canvas generation (sticking to plain text/emoji for MVP).
- Direct social media API integration (the client will handle the actual sharing via Web Share API or clipboard).

### Edge Cases & Boundaries
- **Excessively Long Paths**: If a user takes 150 clicks, an emoji string of 150 characters might exceed Twitter/X character limits or look awful. The visualizer MUST compress or truncate paths longer than 20 clicks (e.g., using a `...` or summarizing chunks).
- **Missing Global Average**: If this is the *first* result of the day, there is no average to compare against. The visualizer should gracefully fallback to a standard representation (e.g., all 🟩 or a neutral color) for the first few players.

## Technical Objectives

### OBJ-001: Non-Spoiler Virality
Generate a compelling visual summary that hides the solution.
- **Priority**: P2
- **Why this priority**: Essential for organic growth and marketing, fulfilling CAP-004.
- **Rationale**: Text-based sharing is the lowest friction method across all platforms (WhatsApp, Twitter, Reddit).
- **Validation**: The output string contains no actual Wikipedia article titles.

### OBJ-002: Performance Benchmarking via Emoji
Reflect the user's performance visually by comparing their path length to the global average.
- **Priority**: P2
- **Why this priority**: Adds a layer of competitiveness to the shared result.
- **Rationale**: A uniform block of identical emojis is boring. Color-coding based on efficiency makes the share more engaging.
- **Validation**: Paths significantly longer than average contain "warning" or "danger" colored emojis.

## Requirements

### Functional Requirements
- **FR-001**: System MUST expose the generated share string in the response of `POST /results` (e.g., `shareText` property).
- **FR-002**: System MUST format the header as: `WikiGame [Date] - [Clicks] clicks - [Time]`.
- **FR-003**: System MUST generate an emoji grid representing the path. The first and last emojis should represent the Start and End points (e.g., 🔵).
- **FR-004**: System MUST compare the user's total clicks to the current `averageClicks` from `DailyStats`.
  - If clicks <= average (or if average is 0): use "efficient" emojis (🟩).
  - If clicks > average but <= average * 1.5: use "average" emojis (🟨).
  - If clicks > average * 1.5: use "inefficient" emojis (🟥).
- **FR-005**: System MUST truncate or compress the emoji string if the path exceeds 25 clicks to prevent massive text blocks.

### Technical Requirements
- **TR-001**: Implement `ShareVisualizer` as a pure domain utility function/class.
- **TR-002**: Update `SubmitResultUseCase` to invoke `ShareVisualizer` and return the result.

## Key Entities
- **GameResult**: Input data for the visualizer.
- **DailyStats**: Required for average comparison.

## Assumptions & Risks
- **Assumption 1**: Emojis render consistently enough across target mobile platforms (iOS/Android).
- **Risk 1**: Calculating the share text adds latency to the result submission. (Mitigation: Logic is pure string manipulation, CPU cost is negligible).

## Implementation Signals
- **MODIFIED-ENTITY**: `SubmitResultResponse` interface updated to include `shareText: string`.
- **NEW-SERVICE**: `src/features/results/utils/share-visualizer.ts`.

## Success Criteria
- **SC-001** [OBJ-001]: Unit tests verify that long paths (>25) are correctly truncated.
- **SC-002** [OBJ-002]: Unit tests verify color-coding correctly shifts based on the provided global average.

## Compliance Check

### Instructions Check Report
**Target**: specs/00006-emoji-path-visualizer/spec.md
**Status**: PASS

| Principle | Verdict | Notes |
|-----------|---------|-------|
| Clean Architecture | PASS | Visualizer is a pure utility; decoupled from Express. |
| Strict Type Safety | PASS | Input and output interfaces are strictly typed. |
| Functional Core | PASS | Pure string manipulation function. |
| TDD First | PASS | Requires unit testing the formatting and truncation rules. |
