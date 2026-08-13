# Security boundaries

This document records constraints for Phase 2 and later. Phase 1 does not connect to any Supabase
project, execute SQL, or define a migration.

## Project isolation

- Only the dedicated Supabase project named `learning-template` may back this repository.
- Legacy URLs and keys must never be copied into this project.
- Noetic is a separate production system and is outside this repository's scope.
- The frontend accepts only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Secret and service-role keys are forbidden in browser-prefixed variables.

## Identity

- Supabase Auth will be the canonical authenticated identity system.
- User-owned rows will reference `auth.users.id`.
- A display name, username, browser UUID, or user-editable JWT metadata is not authorization.
- Guest learning is local. Guest evidence must be imported idempotently only after real Auth.

## Data API, grants, and RLS

Database grants decide whether a role can access a table at all. RLS decides which rows that role may
access. Every exposed table requires both deliberate grants and enabled RLS.

Expected ownership policy shape:

```sql
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id)
```

This is a pattern, not a universal copy/paste policy. Each operation and table must be tested against
its actual access model. `TO authenticated` by itself is not row authorization.

## Immutable learning evidence

- Client attempt events require idempotency IDs.
- Clients must not update or delete accepted attempt evidence.
- Aggregates and mastery are derived from attempts.
- XP, rewards, achievements, daily completion, and leaderboard totals are not directly client
  writable.
- Local evaluation may support personal learning, but competitive or financial outcomes require
  trusted validation.

## Database functions and views

- Prefer security-invoker functions.
- Never use `SECURITY DEFINER` merely to bypass a permission error.
- A necessary definer function belongs in a non-exposed schema, has a hardened search path, derives
  the caller from `auth.uid()`, and receives explicit minimal execution grants.
- Exposed views must use `security_invoker = true` where supported or be denied to client roles.

## Migration workflow

Beginning in Phase 2:

1. Initialize Supabase locally in this repository.
2. Develop and verify schema changes against the local database.
3. Run database advisors and RLS tests.
4. Generate/review a clean migration in Git.
5. Apply only to the dedicated LearningTemplate project after explicit authorization.

Required policy tests include owner access, cross-user denial, anonymous denial, immutable events,
ownership reassignment denial, and privileged-function abuse cases.

## Supply-chain controls

- Dependency versions and the lockfile are committed.
- CI uses `npm ci`.
- Package signatures are audited.
- Upgrades should be deliberate and reviewed, particularly for frontend/backend boundary packages.
