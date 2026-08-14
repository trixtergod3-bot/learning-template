# LearningTemplate

LearningTemplate is the canonical, subject-agnostic foundation for learning applications. It is
designed to support lessons, quizzes, drills, flashcards, and skill-level progress without putting
subject knowledge inside the engine.

Phases 1 and 2 establish the application shell, extension contracts, authenticated identity, and
secure learning-data foundation. The registered `Foundation Lab` course is deliberately small: it
proves that structured lessons, curated activity items, deterministic generators, and database
registry IDs share one architecture. It is not production course content.

## Requirements

- Node.js 22.12 or newer (Node 24 is used in CI)
- npm 11 or newer
- Docker Desktop only when running the local Supabase database tests

## Start locally

```bash
npm ci
npm run dev
```

The application works without environment variables in local guest mode. Run commands from this
repository directory, not from your Windows home folder.

To enable accounts, copy `.env.example` to `.env.local` and configure **only** the dedicated
`learning-template` Supabase project with its URL and modern `sb_publishable_...` key. `.env.local`
is ignored by Git. Never copy credentials from a legacy application and never use a secret or
service-role key in the browser.

```powershell
Copy-Item .env.example .env.local
npm.cmd run dev
```

## Quality commands

```bash
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
```

With Docker running, reproduce the database and execute the pgTAP policy suite:

```bash
npm exec supabase -- start -x gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
npm exec supabase -- test db
npm exec supabase -- stop
```

## Architecture at a glance

```text
src/app             composition, runtime configuration, router and registries
src/engine          pure domain contracts, validation, generators and ports
src/courses         subject content and extensions
src/features        user-facing learning workflows
src/ui              reusable presentation and layouts
src/infrastructure  local and future remote persistence adapters
supabase             reproducible migrations, local config and RLS tests
```

The engine knows nothing about individual subjects or Supabase. Course bundles depend on engine
contracts, and infrastructure implements engine-owned persistence ports.

Read next:

- [Architecture](docs/architecture.md)
- [Creating a course](docs/creating-a-course.md)
- [Security boundaries](docs/security-boundaries.md)
- [Phase 1 verification](docs/phase-1-verification.md)
- [Phase 2 verification](docs/phase-2-verification.md)

## Current phase boundary

Included through Phase 2:

- Strict Vite, React, and TypeScript foundation
- Validated universal course/activity/session contracts
- Static and generated activity registries
- Deterministic generator replay
- Configurable responsive shell and five routed feature surfaces
- Optional Supabase client that stays inert when no environment is configured
- Email/password sign-up, sign-in, sign-out, recovery, and learner profiles
- Auth-owned sessions, immutable attempts, weighted skill evidence, and read-only mastery projection
- Explicit database grants, RLS policies, covering indexes, migrations, and pgTAP security tests
- Generated database types, tests, CI, and architecture documentation

Deferred to later approved phases:

- Complete local guest evidence persistence and authenticated guest-to-account import
- Production Astrology and Mental Math course migration
- Complete quiz, drill, lesson, flashcard, and mastery workflows
- XP, achievements, daily challenges, rankings, payments, and PWA support
