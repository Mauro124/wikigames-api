<!-- template-version: 2 -->
# wikigame-backend Project Instructions

## Core Principles

### I. Clean Architecture
Domain logic MUST be decoupled from infrastructure and frameworks. Entities and use cases must not depend on database or web details. — Ensures long-term maintainability and testability.

### II. Strict Type Safety
All code MUST use strict TypeScript configurations. Use of `any` is prohibited. Custom types and interfaces MUST define all data shapes. — Prevents runtime errors and improves developer experience.

### III. Functional Core, Imperative Shell
Business logic MUST be pure and reside in the domain layer. Side effects (I/O, DB, API calls) MUST be isolated at the system boundaries (infrastructure/data layers). — Simplifies testing and reasoning about code.

### IV. Test-Driven Development (TDD)
Tests MUST be written before implementation. Every feature MUST have corresponding unit and integration tests. — Ensures behavior matches requirements and prevents regressions.

### V. Agent Output Style
All agent output MUST be concise and outcome-oriented. This principle supersedes any verbose defaults.

- **Progress reports**: Facts and outcomes only — no narration, no restating the task.
- **Artifacts**: Emit required sections only — no preamble paragraphs, no summary epilogues.
- **Reasoning**: Omit unless the user asks "why" or the decision is non-obvious.
- **Errors / blockers**: State the problem, the attempted fix, and the result — nothing else.
- **Phase-boundary reports**: ≤ 5 bullet points.
- **Preserve without compressing**: Artifact template structure and required sections; explicit decision / registration / validation guidance in shared skills; delegation constraints and sub-agent role definitions; existing size limits (spec ≤ 10 KB, research ≤ 4 KB, stories ≤ 200 words).

## Technology Stack

- **Language/Runtime**: TypeScript 6.0.3 / Node.js (ES2022)
- **Frameworks**: Express 5.2.1
- **Storage**: Firebase/Firestore (firebase-admin)
- **Infrastructure**: Local development / Docker

## Testing & Quality Policy

- **Coverage Target**: 90%
- **Required QC Categories**: linting, security scanning, coverage
- **Test Strategy**: TDD strict (red-green-refactor). Unit + integration tests.
- **Linting / Formatting**: ESLint + Prettier (strict)

## Source Code Layout

- **Policy**: ENFORCE_SRC_ROOT
- **Convention**: Source code under `/src`; features modularized by domain; tests co-located in `/tests` or features.

## Development Workflow

- **Branching**: Feature branches from main, squash merge
- **Commit Convention**: Conventional Commits
- **CI Requirements**: All tests pass, lint clean, no type errors before merge

## Governance

- Project instructions supersede all other documentation and practices.
- Amendments require a version bump with ISO-dated changelog entry.
- All implementations MUST pass the Instructions Check gate during planning.
- Complexity beyond these principles MUST be justified and documented.

**Version**: 1.0.0 | **Last Amended**: 2026-04-20
