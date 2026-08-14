# Phase 3 verification

Verified on August 14, 2026 against the dedicated Supabase project named `learning-template`.

## Delivered

- Astrology Foundations as the first production, Git-backed course bundle
- One Zodiac Foundations module with eight topics and eight measurable skills
- All 53 audited Astro11 prompts, explanations, and correct-answer relationships
- Easy, Medium, and Hard variants with 6, 9, and 12 deterministic choices respectively
- 159 validated activity items and 24 category/difficulty activity definitions
- Course-owned presentation metadata for badge, symbol, and highlights
- Generic course library, topic catalog, practice-set configuration, and skill-map surfaces
- Data-only migration publishing the stable Astrology course and skill registry IDs
- Course-content and practice-configuration tests

## Architectural boundary

The generic app, feature, UI, and engine layers do not import Astrology. Only the application
composition root registers the subject package. Shared pages read the selected course from generic
registries and render course-owned data.

The original Astro11 application remains read-only. Its unstable `Math.random()` option generation
was not copied. Each difficulty variant now uses a stable content transformation so a versioned item
always has the same choices.

Structured Astrology lessons remain Phase 4. The interactive quiz runner, scoring, feedback,
streaks, results, and attempt persistence remain Phase 5. Phase 3 configures a real practice set but
does not pretend the runner already exists.

## Verification evidence

- Runtime course parser accepts the complete bundle and all cross-references.
- Frontend tests prove all 53 prompts expand to 159 valid items and 24 activities.
- Every correct answer is present in its option set.
- Practice configuration test verifies category filtering and 6/9/12-choice difficulty changes.
- The migration first succeeded inside a rollback-only transaction.
- The live project contains one published `astrology` course and exactly eight published skills at
  content version `1.0.0`.
- Remote pgTAP checks confirm registry IDs and read-only browser privileges.
- No advisor finding was caused by the data-only migration.
- Desktop and 390 px browser checks passed with no console warnings or errors.
- Browser review verified route-level scroll reset, mobile navigation closure, and zero horizontal
  overflow after clipping decorative paint to its card boundary.

The Security Advisor reports that leaked-password protection is disabled. Supabase documents that
feature as available on the Pro plan and above, so it is recorded as a production-plan hardening
item rather than silently changing the project's billing. Performance notices are expected
unused-index information for tables that do not yet contain learner activity.

## Manual review

1. Run `npm.cmd run dev` from the repository root.
2. Confirm Home presents Astrology Foundations as the first course in a multi-course library.
3. Open Learn and confirm all eight topics, prompt counts, and skill labels render.
4. Open Practice and deselect several topics; at least one topic must remain selected.
5. Switch Easy, Medium, and Hard and confirm the preview shows 6, 9, and 12 choices.
6. Resize to approximately 390 px and confirm the course library, topic cards, practice controls,
   and mobile navigation remain usable.
7. Confirm the Phase 5 runner button is visibly disabled and no unfinished quiz can be started.

No user account is required for Phase 3 review.
