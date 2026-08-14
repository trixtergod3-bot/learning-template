# Phase 9 verification

Verified on August 14, 2026 against the dedicated Supabase project named `learning-template`.

## Delivered

- A feature-flagged, subject-neutral personal gamification layer
- Server-owned XP, attempt count, accuracy, active/longest streak, and achievement projections
- Transparent XP: 10 per attempt, up to 10 for performance, and 2 for a response within three
  seconds
- A transparent quadratic level curve: level thresholds at 0, 100, 400, 900 XP, and onward
- UTC-day streak calculation with stale current streaks hidden by the client after a missed day
- Five modular achievements: First steps, Focused ten, Three-day rhythm, Precision practice, and
  Connected mastery
- A reusable dashboard panel with level progress, streak, accuracy, earned/locked achievements, and
  an explicit local-evidence trust note
- Backfill for attempts recorded before the projection existed

## Security model

- `user_course_gamification` and `user_achievements` are server-owned and browser-read-only.
- RLS exposes only rows owned by `auth.uid()`.
- The private calculation function has an empty search path and no browser execution privilege.
- XP and unlocks are recalculated only after valid evidence passes the existing atomic, RLS-protected
  attempt boundary.
- Local evidence powers personal motivation but is not trusted for competition or rewards with real
  value.

## Verification evidence

- Pure tests verify level thresholds, in-level progress, and current-streak expiry.
- UI tests verify level 2 at 250 XP, 50% level progress, metrics, and earned/locked achievement states.
- The complete migration and 12-test pgTAP suite passed in a rollback transaction before live apply.
- Remote pgTAP verifies 59 XP from three known attempts, 83.33% accuracy, a three-day streak, exact
  unlocks, read-only grants, and direct XP-write denial.
- Generated TypeScript database types were compared with the checked-in typed table boundaries.
- Supabase security advisors report no regression.
- Formatting, TypeScript, ESLint, all 51 frontend tests, and the production build pass.
- No Noetic system or project was accessed.
