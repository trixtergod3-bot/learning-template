# ADR 0002: Keep V1 course content in Git

**Status:** Accepted for Phase 1

## Context

Lessons, answer keys, skill mappings, and generator versions must be reviewed together with the code
that renders and evaluates them. Duplicating them in a database would create synchronization and
versioning problems before authoring requirements are known.

## Decision

Keep V1 course bundles, answer definitions, generator code, and app/course configuration in Git.
Supabase will persist identity and learning evidence. Phase 2 may add small course/skill registries
for referential integrity, but not duplicate lesson bodies.

## Consequences

- Content changes receive code review, tests, and reproducible deployments.
- Attempts can name explicit content versions.
- Runtime validation catches malformed bundles.
- A future CMS requires an intentional publishing pipeline rather than direct production-table edits.
