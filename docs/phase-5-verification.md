# Phase 5 verification

Verified on August 14, 2026 against the dedicated Supabase project named `learning-template`.

## Delivered

- A subject-neutral deterministic quiz engine for static single-choice and multi-select items
- Astrology practice configuration for topic selection, Easy/Medium/Hard difficulty, and 5/10/20
  question targets
- A complete runner with progress, elapsed time, streaks, exact answer checking, immediate feedback,
  explanations, correct-answer disclosure, results, retry, and settings recovery
- Number-key selection and Enter-key submit/advance controls
- Deep links from a lesson into a practice set pre-filtered to that topic
- Guest practice that works without an account or backend connection
- A complete Supabase `LearningRepository` adapter for sessions, immutable attempts, skill evidence,
  attempt history, and mastery reads
- Atomic signed-in attempt and skill-evidence recording through a security-invoker database function

## Evidence and trust boundary

Quiz scoring runs locally so feedback is immediate. Browser-authored evidence is always stored with
the `local` validation level. It can drive personal learning and mastery, but it is not trusted for
competitive rankings or rewards.

The `record_local_attempt` function derives ownership and course/activity context from the caller's
RLS-visible session. It cannot be called by `anon`, does not use `SECURITY DEFINER`, and inserts the
attempt plus all weighted skill evidence in one transaction. Invalid skill evidence rolls the entire
statement back.

## Verification evidence

- Pure engine tests prove deterministic question selection and exact single/multi-select scoring.
- UI tests complete a real multi-select Astrology question and reach a 100% result.
- Practice tests cover topic/difficulty configuration, lesson deep links, and starting the runner.
- Formatting, TypeScript, ESLint, all 32 frontend tests, and the production build pass.
- The migration compiled inside a rollback-only transaction before it was applied.
- The live project identity was re-verified as `learning-template` in `eu-central-1` with healthy
  status before mutation.
- Remote pgTAP verifies security-invoker status, function grants, valid writes, connected evidence,
  and rollback of an invalid skill ID.
- Generated TypeScript definitions match the committed database function contract.
- Security Advisor reports no finding caused by Phase 5. The pre-existing leaked-password warning is
  a paid-plan hardening item. Performance notices are unused indexes in an effectively empty system.
- Browser review completed a four-question guest quiz using both pointer and keyboard interaction,
  confirmed correct and incorrect feedback, and reached the result screen.
- No Noetic system or project was accessed.

## Manual review

1. Run `npm.cmd run dev` from the repository root.
2. Open **Practice**, select topics, difficulty, and set length, then start the quiz.
3. For a multi-select item, select every answer you believe is correct and choose **Check answer**.
4. Confirm feedback explains the answer and visually distinguishes correct and incorrect choices.
5. Use a displayed number key plus Enter on another question.
6. Finish the set and confirm percentage, correct count, best streak, elapsed time, retry, and change
   settings are present.
7. As a guest, confirm the result says future evidence can sync after sign-in.
8. As a signed-in learner, complete a quiz and confirm the result changes from **Saving evidence…**
   to **Evidence synced**.
