# LearningTemplate

LearningTemplate is the canonical, subject-agnostic foundation for learning applications. It is
designed to support lessons, quizzes, drills, flashcards, and skill-level progress without putting
subject knowledge inside the engine.

Phase 1 establishes the application shell and extension contracts. The registered `Foundation Lab`
course is deliberately small: it proves that structured lessons, curated activity items, and
deterministic generators share one architecture. It is not production course content.

## Requirements

- Node.js 22.12 or newer (Node 24 is used in CI)
- npm 11 or newer

## Start locally

```bash
npm ci
npm run dev
```

The application works without environment variables in local guest mode.

Supabase configuration is intentionally inactive in Phase 1. During Phase 2, copy `.env.example` to
`.env.local` and configure **only** the dedicated LearningTemplate project. Never copy credentials
from a legacy application.

## Quality commands

```bash
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
```

## Architecture at a glance

```text
src/app             composition, runtime configuration, router and registries
src/engine          pure domain contracts, validation, generators and ports
src/courses         subject content and extensions
src/features        user-facing learning workflows
src/ui              reusable presentation and layouts
src/infrastructure  local and future remote persistence adapters
```

The engine knows nothing about individual subjects or Supabase. Course bundles depend on engine
contracts, and infrastructure implements engine-owned persistence ports.

Read next:

- [Architecture](docs/architecture.md)
- [Creating a course](docs/creating-a-course.md)
- [Security boundaries](docs/security-boundaries.md)
- [Phase 1 verification](docs/phase-1-verification.md)

## Current phase boundary

Included in Phase 1:

- Strict Vite, React, and TypeScript foundation
- Validated universal course/activity/session contracts
- Static and generated activity registries
- Deterministic generator replay
- Configurable responsive shell and five routed feature surfaces
- Optional, inert Supabase client boundary
- Tests, CI, and architecture documentation

Deferred to later approved phases:

- Supabase project linking, migrations, Auth, RLS, or database calls
- Production course migration
- Complete quiz, drill, lesson, flashcard, and mastery workflows
- XP, achievements, daily challenges, rankings, payments, and PWA support
