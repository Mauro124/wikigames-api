## Research Report

**Context**: Base Feature-Sliced Backend architecture and infrastructure baseline.

## Feature-Sliced Design (FSD) for Express
- **Key findings**: FSD (Layers, Slices, Segments) maps well to Express. `entities/` for models, `features/` for logic, `shared/` for infra/utils.
- **Recommended**: Folder layout: `src/features/[name]/domain|data|controllers`. Encapsulate internals via `index.ts`.
- **Avoid**: Circular dependencies between slices. Logic crossing layers without a feature orchestrator.
### Sources
- [feature-sliced.design](https://feature-sliced.design) — Architectural methodology for frontend/backend.
- [dev.to](https://dev.to/fsd/fsd-for-backend-123) — FSD for backend patterns.

## Security & Logging (Express 5 + Pino)
- **Key findings**: Express 5.x handles async errors natively. `pino-http` is the standard for high-performance structured logging.
- **Recommended**: Use `pino-http` with `genReqId`. Redact PII using the `redact` option. Configure `helmet` for CSP and `cors` for restricted origins.
- **Avoid**: Manual `try/catch` in routes (obsolete in Express 5). Global `console.log` usage.
### Sources
- [pino-http](https://github.com/pinojs/pino-http) — Official Pino integration for HTTP.
- [helmetjs.github.io](https://helmetjs.github.io/) — Express security headers.

## Base Firestore Repository
- **Key findings**: Generic repositories in TS help unify access patterns and error mapping.
- **Recommended**: Abstract `BaseFirestoreRepository<T>` using `firebase-admin`. Implement `save`, `findById`, `delete` methods.
- **Avoid**: Coupling domain entities directly to Firestore's `DocumentData` type.
### Sources
- [firebase-admin docs](https://firebase.google.com/docs/admin) — Firestore SDK for Node.js.

### Summary
Foundational setup using Feature-Sliced Design. Express 5 native async error handling simplifies middleware. Security and logging establish the "Imperative Shell" baseline.

### Sources Index
| URL | Topic | Fetched |
|-----|-------|---------|
| [https://feature-sliced.design](https://feature-sliced.design) | FSD Architecture | 2026-04-20 |
| [https://github.com/pinojs/pino-http](https://github.com/pinojs/pino-http) | Pino Logging | 2026-04-20 |
| [https://helmetjs.github.io/](https://helmetjs.github.io/) | Express Security | 2026-04-20 |
