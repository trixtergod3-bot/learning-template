# Phase 8 verification

Verified on August 14, 2026 against the dedicated Supabase project named `learning-template`.

## Delivered

- A versioned `mastery-v1` projection derived from immutable weighted attempt evidence
- A private database trigger that rebuilds one skill projection after each valid evidence insert
- Confidence that rises from 64% after one evidence event to 100% after five, multiplied by weighted
  accuracy
- Backfill support for evidence recorded before the projection was introduced
- A subject-neutral course progress model with overall mastery, evidence count, skill coverage,
  strong concepts, module summaries, and weakest-skill recommendations
- A complete signed-in progress dashboard with actionable Review, Quiz, and Rapid drill links
- A privacy-focused guest state that keeps all practice modes available without pretending to retain
  cross-page progress
- Loading and failure states plus accessible per-skill progress bars

## Security model

- Browser roles retain `SELECT` only on `skill_mastery`.
- The trigger function is in the private schema, has an empty search path, and cannot be executed by
  anonymous or authenticated clients.
- Its input comes only from a successfully inserted evidence row that already passed ownership,
  grants, RLS, and relational constraints.
- The projection can be rebuilt from source attempts and records its calculation version.
- Local evidence supports personal learning only; it remains separate from future trusted
  competitive evidence.

## Verification evidence

- Pure tests verify score bands, course/module rollups, coverage, and weakest-first recommendations.
- UI tests cover both the guest privacy state and an authenticated server-projected mastery map.
- Remote pgTAP verifies function/trigger boundaries, exact 64 and 36.5 formula outputs, evidence
  count, versioning, and direct-write denial.
- The complete migration and 12-test pgTAP suite passed inside a rollback transaction before live
  application.
- The live migration is `20260814052700_project_skill_mastery`.
- Supabase security advisors show no regression; the remaining leaked-password warning is a
  project-plan setting, not introduced by this phase.
- Formatting, TypeScript, ESLint, all 48 frontend tests, and the production build pass.
- No Noetic system or project was accessed.

## Manual review

1. Practice as a guest, then open **Progress** and confirm the sign-in explanation and guest CTA.
2. Sign in and complete a quiz, flashcard deck, or rapid drill.
3. Open **Progress** and confirm evidence count and the associated skill score update.
4. Follow a recommended **Practice now** link and confirm its topic filter.
5. Open a skill's **Review** and **Quiz** actions.
6. Confirm unpracticed skills remain visible at zero rather than disappearing from the course score.
