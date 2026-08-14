# Decision 0004: Git content, database evidence

## Status

Accepted in Phase 2.

## Decision

Keep modules, topics, lessons, activities, item answers, and generators in typed, versioned course
bundles in Git. Store only stable course/skill registry metadata and user learning evidence in
Postgres.

The Phase 2 database therefore contains `profiles`, `courses`, `skills`, `practice_sessions`,
`activity_attempts`, `attempt_skill_evidence`, and `skill_mastery`.

## Consequences

- A course release and its answer keys remain code-reviewed and reproducible.
- The database can connect evidence to stable course and skill IDs without duplicating content.
- Attempts remain the durable source evidence; mastery can be recalculated.
- Module, lesson, activity, achievement, and XP tables are deferred until a demonstrated runtime
  need makes them preferable to Git content or a later projection.
- Client-authored results are marked `local`; trusted competitive outcomes require a later trusted
  validation path.
