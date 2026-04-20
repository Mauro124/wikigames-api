# Product Requirements Document: wikigame-backend

> Date: 2026-04-20 | Status: Draft

## Product Overview

`wikigame-backend` is a service that powers a daily Wikipedia navigation challenge. It selects two random (but reachable) Wikipedia articles and challenges users to navigate from the start to the end in the fewest clicks possible. It serves as a casual social game where everyone plays the same daily challenge and shares their results.

## Vision and Why Now

The goal is to create a "Wordle-style" experience for the classic Wikipedia Game. By providing a single, curated daily path, we foster a shared social experience and a "spoiler culture" that drives daily engagement. In an era of short-form, high-engagement casual games, a structured Wikipedia game offers educational value with a familiar, viral loop.

## Problem Statement

Existing Wikipedia games are often fragmented, random-only, or require custom lobbies. There is no central, low-friction platform for a "daily shared challenge" that allows users to compare their navigation logic with friends in a standardized way.

## Background and Evidence

- **Wordle/Connections Success**: High retention for daily, shared-result games.
- **Wikipedia Game Popularity**: The "Six Degrees of Wikipedia" concept is a well-known internet phenomenon.
- **Content Availability**: Wikipedia's API provides a massive, constantly updated graph for gameplay.

## Target Users, Stakeholders, and Core Personas

### Target Users

- **General Public**: Casual gamers looking for a 2-5 minute daily distraction.
- **Trivia/Wiki Fans**: Users who enjoy discovering obscure connections between topics.

### Stakeholders

- **Developers**: Need a robust, cache-friendly API for article proxying.
- **Platform Owners**: Aim for high viral shareability and low operational cost.

### Core Personas

- **Casual Chris**: Plays on the bus to work. Wants to finish the game quickly and share his emoji grid in the group chat.
- **Navigator Nancy**: Loves finding the most efficient path. Cares about global stats to see if her path was better than average.

## User Needs / Jobs To Be Done

- **Daily Challenge**: I want a new challenge every day so I have a reason to return.
- **Clean Reading**: I want to read Wikipedia articles without the UI clutter so I can focus on navigation.
- **Result Sharing**: I want to share my success (or failure) in a way that looks cool but doesn't spoil the path for others.
- **Benchmarking**: I want to see how my performance compares to everyone else who played today.

## Product Principles or UX Principles

- **Viral Shareability**: Results MUST be shareable as an emoji-based "path visualization".
- **Low Friction**: No user accounts required for playing or submitting results.
- **Article Integrity**: Articles MUST be proxied and "cooked" to remove non-article links while preserving navigation paths.
- **Shared Experience**: Every user in the world plays the exact same two articles every day (Midnight UTC reset).

## Scope Summary

MVP focuses on the end-to-end "Play -> Finish -> Share" loop with a single daily global challenge.

### In-Scope Capabilities

- Automated daily challenge generation (Start/End articles).
- Wikipedia article proxying and HTML sanitization/link-cooking.
- Result submission (clicks, time, path).
- Global daily statistics aggregation.

### Out-of-Scope Items

- User accounts and personal history storage.
- Multi-language support (MVP is English-only).
- Advanced anti-cheat (server-side path verification).
- Real-time multiplayer/lobbies.

## Product Capability Map

| Capability ID | Capability | Priority | Outcome |
|---------------|------------|----------|---------|
| CAP-001 | Daily Challenge Management | P1 | Automated selection and serving of the global daily start/end titles. |
| CAP-002 | Wikipedia Article Proxy | P1 | Sanitized HTML article content with internal links rewritten for the game. |
| CAP-003 | Results & Global Stats | P1 | Submission of user results and calculation of daily averages/distributions. |
| CAP-004 | Share Visualizer | P2 | Logic to convert a click-path into a non-spoiler emoji grid for social media. |

## Success Metrics / KPIs / Desired Outcomes

| Metric | Target | Why It Matters | Measurement Window |
|--------|--------|----------------|--------------------|
| Social Share Rate | >15% | Measures virality and social engagement. | Daily |
| Completion Rate | >60% | Measures if challenges are too hard or articles are broken. | Daily |
| Average Clicks | 10-20 | Ideal difficulty range for casual play. | Weekly |

## Assumptions

- Wikipedia API remains stable and free to access.
- Randomized start/end points are reachable within a reasonable number of clicks (need reachability check).

## Constraints

- **Storage**: Use Firebase/Firestore for simplicity and cost-efficiency.
- **Reset**: Midnight UTC is the hard reset point for the global challenge.

## Dependencies

- **Wikipedia API**: Source of all game content.
- **Firestore**: Storage for challenges and stats.

## Risks

- **Article Edits**: A link used in a "solvable" path might be removed by a Wiki editor mid-day.
- **Dead-ends**: Randomly selected articles might have no outgoing links or be orphaned.
- **Bot Spam**: Since there is no auth, stats can be easily skewed by bots.

## Open Questions

- Should we "blacklist" certain sensitive or NSFW Wikipedia categories automatically?
- How do we handle disambiguation pages in the path?

## Release or Validation Approach

Initial validation through developer "Alpha" playtests to verify article cooking logic and challenge reachability before opening to public.

## Domain Glossary / Terminology

- **Article Cooking**: The process of sanitizing Wikipedia HTML and rewriting links for game use.
- **Start/End Titles**: The two articles that define the daily challenge.
- **Click-Path**: The sequence of articles a user visited to reach the goal.

## Handoff Guidance

- **Product intent to preserve**: The "shared daily" aspect is non-negotiable.
- **Scope boundaries to respect**: No auth for MVP.
- **Critical constraints**: Article sanitization MUST remove external links but keep internal Wiki links.

## Project Context Baseline Updates

- **Completed E001**: Established foundational architecture and infrastructure baseline.
- **Completed E002**: Implemented Wikipedia Article Proxy with "Article Cooking" logic and caching.
- **Completed E003**: Unified Firestore persistence layer with atomic stats aggregation.
- **Completed E004**: Automated monthly challenge generation (300 items/month) with thematic daily categories and BFS reachability verification.
- **Observability**: Standardized on `pino-http` for structured logging and trace correlation (`reqId`).



- **Data Model**: Implemented `BaseEntity` and `BaseFirestoreRepository` to unify persistence across all subsequent features.
- **Error Handling**: Standardized on `AppError` and centralized global middleware using Express 5.x async support.

