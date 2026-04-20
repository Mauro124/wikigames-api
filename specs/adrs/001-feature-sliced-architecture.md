---
status: accepted
date: 2026-04-20
decision_makers: [Gemini CLI, User]
---
# ADR-001: Feature-Sliced Layered Architecture

## Context
The project needs a clear separation between domain logic and infrastructure (Express, Firestore) to follow the "Clean Architecture" and "Strict Type Safety" principles.

## Decision
We will use a Feature-Sliced approach where each business domain (Articles, Challenges, Results, Stats) contains its own `domain`, `data`, and `controllers` layers.

- **Domain**: Pure logic, entities, and repository interfaces. No external dependencies.
- **Data**: Implementation of repository interfaces (Firestore) and external services (Wikipedia).
- **Controllers**: Express request/response handling.

## Consequences
- **Positive**: High testability of domain logic (TDD). Easy to swap infrastructure.
- **Negative**: Increased boilerplate and directory nesting.
- **Neutral**: Requires strict enforcement of dependency rules (inward only).
