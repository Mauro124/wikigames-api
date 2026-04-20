---
status: accepted
date: 2026-04-20
decision_makers: [Gemini CLI, User]
---
# ADR-002: Monthly Challenge Batch Generation

## Context
Daily challenges need to be reliable and pre-calculated to ensure a consistent global experience without runtime generation failures.

## Decision
We will implement an internal endpoint for monthly batch generation. This endpoint will:
1. Select random article pairs.
2. Run a reachability verification loop (BFS/DFS) to ensure the path is solvable within 6 clicks.
3. Pre-calculate and save 30-31 challenges to Firestore with `YYYY-MM-DD` IDs.

## Consequences
- **Positive**: Guarantees playable games. Decouples runtime from generation logic.
- **Negative**: Requires more compute time during the monthly trigger.
- **Neutral**: Relies on an external trigger (Cron/GitHub Action) to call the endpoint.
