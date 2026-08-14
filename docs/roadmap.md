# LearningTemplate roadmap

LearningTemplate is one multi-course learning platform. Courses provide subject knowledge and
extensions; the engine provides reusable learning behavior. Every phase ends with automated checks,
a focused pull request, and a review gate before the next phase begins.

| Phase                        | Status   | Delivery                                                                                                                                |
| ---------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — Audit                    | Complete | Compare Astro11, Numerology Quest, and Math11; map reusable systems and security risks.                                                 |
| 1 — Foundation               | Complete | Vite/React/TypeScript shell, universal contracts, registries, configuration, deterministic generators, and Git workflow.                |
| 2 — Auth + database          | Complete | Supabase Auth, profiles, secure learning evidence schema, RLS, database tests, and generated types.                                     |
| 3 — Astrology demo           | Complete | Production Astrology content, eight skills, deterministic difficulty variants, course library, and practice configuration.              |
| 4 — Lesson engine            | Complete | Module/topic/lesson navigation, reusable content blocks, and eight complete Astrology lessons.                                          |
| 5 — Quiz engine              | Complete | Single choice, multi-select, difficulty, feedback, explanations, keyboard controls, results, retry, streaks, and attempt recording.     |
| 6 — Flashcards               | Complete | Reusable front/reveal/back/review flow connected to the same course and skill evidence.                                                 |
| 7 — Drill engine             | Planned  | Rapid static/generated practice, typed/choice answers, timers, deterministic replay, and telemetry.                                     |
| 8 — Progress + mastery       | Planned  | Understandable mastery calculation and course/module/skill progress with weak and strong concepts.                                      |
| 9 — Gamification             | Planned  | Modular XP, levels, achievements, and streaks; optional daily challenge and leaderboard only after the core is stable.                  |
| 10 — Math validation         | Planned  | Small multiplication course proving lessons, quiz, generated drill, typed answers, and mastery without Astrology-specific core changes. |
| 11 — Numerology validation   | Planned  | A small third-domain course proving the engine remains reusable.                                                                        |
| 12 — Cleanup + documentation | Planned  | Subject-leak audit, accessibility, performance, PWA/i18n/settings readiness, white-label documentation, and release QA.                 |

## Git gate

Each phase starts from reviewed `main`, uses a `codex/phase-*` branch, passes the required quality and
database checks, and is merged through a protected pull request.

## Supabase gate

Every remote operation first verifies the exact `learning-template` project identity. Schema and
registry changes live in migrations, RLS tests accompany user-data changes, and Noetic is never
read, modified, migrated, or used as a backend.

## Course sequence

Astrology supplies the first real content domain. The generic activity engines are then completed
before Mental Math validates generated practice. A small Numerology course finally proves that a
third domain can be added without rewriting the engine.
