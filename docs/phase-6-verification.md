# Phase 6 verification

Verified on August 14, 2026 against the dedicated Supabase project named `learning-template`.

## Delivered

- A subject-neutral deterministic flashcard engine
- Fifty-three Astrology flashcards generated at the course boundary from the audited question bank,
  with separate front/back content blocks and stable item IDs
- Eight topic-level flashcard activities connected to the existing topics, lessons, and skills
- Topic filtering, 5/10/20-card deck sizing, and a Quiz/Flashcards practice-mode switcher
- Reveal-first review with Again, Hard, Good, and Easy self-ratings
- In-session scheduling where Again returns soon, Hard returns later, and Good/Easy graduate
- Queue and graduation progress, keyboard reveal/rating controls, results, retry, and settings
- The same guest behavior and signed-in session/attempt persistence boundary used by quizzes

## Evidence semantics

Flashcard recall is self-rated rather than objectively scored. Ratings map to bounded local evidence:

- Again: 0
- Hard: 0.5
- Good: 0.8
- Easy: 1

Only Good and Easy are marked successful. This evidence is still `local` and therefore suitable for
personal mastery, not trusted competition.

## Verification evidence

- Runtime course parsing validates all 53 cards and eight flashcard activities.
- Pure engine tests prove deterministic decks, weak-card requeue positions, graduation behavior, and
  bounded rating scores.
- UI tests reveal and complete a real Astrology flashcard; route tests start a topic-filtered deck.
- Formatting, TypeScript, ESLint, all 38 frontend tests, and the production build pass.
- The data-only `1.2.0` registry migration succeeded in a rollback-only validation before live apply.
- The live project was re-verified by name, region, and healthy status before mutation.
- Remote pgTAP confirms the course and all eight skills are published at `1.2.0`.
- Browser review used Space to reveal, Again to requeue a card, and Good to graduate the remaining
  queue; the final result correctly reported four cards and five total reviews.
- No database table, RLS policy, or security function changed in this phase.
- No Noetic system or project was accessed.

## Manual review

1. Run `npm.cmd run dev` from the repository root.
2. Open **Practice**, switch to **Flashcards**, and select one or more topics.
3. Start a deck and attempt recall before selecting **Reveal answer**.
4. Select **Again** and confirm the card returns after other cards.
5. Select **Hard** and confirm the card returns later in the queue.
6. Use Space to reveal and keys 1–4 to rate at least one card.
7. Finish the queue and confirm rating totals, total reviews, retry, and settings recovery.
