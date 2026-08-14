# ADR 0001: Use one layered application

**Status:** Accepted for Phase 1

## Context

The reference products share a Vite/React/TypeScript baseline but duplicate navigation, question
state, identity, progress, and database logic. Turning one product into the permanent template would
preserve subject coupling and legacy security decisions.

## Decision

Use one Vite/React/TypeScript application with explicit engine, course, feature, UI, app-composition,
and infrastructure layers. Do not introduce a monorepo or runtime WordPress dependency.

## Consequences

- One build and deployment path remains easy to understand.
- Courses can be added without copying the application.
- Dependency rules require discipline and tests.
- Packaging the engine as a separate library can remain a later decision if a real second consumer
  requires it.
