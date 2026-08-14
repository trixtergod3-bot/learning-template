# Phase 4 verification

Verified on August 14, 2026.

## Delivered

- A generic lesson route that resolves course-owned lesson IDs
- Reusable course outline, lesson navigation, missing-lesson handling, and structured content
  rendering
- Eight complete Astrology lessons covering elements, modalities, date ranges, traditional body
  correspondences, traits, traditional rulers, polarity, and opposites
- Tables, key facts, examples, worked examples, and informational, tip, and warning callouts
- Direct links from every topic card into its lesson and from the final lesson into practice
- Explicit context for traditional symbolism, approximate date boundaries, and medical-safety
  boundaries

## Architectural boundary

The lesson route and renderer only depend on generic `CourseBundle`, `Lesson`, and `ContentBlock`
contracts. Astrology owns its lesson text and maps the definitions into those contracts at the
course package boundary. No shared feature or UI component imports Astrology subject data.

Lessons remain version-controlled Git content. This phase does not add a database table for lesson
prose, does not copy content from a remote CMS, and does not make a Supabase schema change.

## Verification evidence

- Runtime parsing validates all eight lessons and their course cross-references.
- Every topic owns exactly one lesson and every lesson links back to the topic's three practice
  activities.
- Route tests cover the course map, a real lesson, next-lesson navigation, and an unknown lesson ID.
- Formatting, TypeScript, ESLint, all 27 frontend tests, and the production build pass.
- Browser review confirms the course map opens the first lesson, the complete outline is reachable,
  the active lesson is announced, and lesson navigation points to the next stable lesson ID.
- Visual review confirms the course outline, lesson card, key facts, and worked example form a clear
  desktop reading hierarchy.
- No Noetic system or project was accessed.

The production build still reports the known single-chunk size advisory. Route-level code splitting
is reserved for the cleanup/performance phase after the activity engines stabilize.

## Manual review

1. Run `npm.cmd run dev` from the repository root.
2. Open **Learn** and confirm eight topic cards and eight outline entries are present.
3. Select **Start lesson 1** and read the Elements lesson.
4. Use **Next lesson** to navigate through the course without returning to the catalog.
5. Open the date, body-correspondence, ruler, and opposite lessons and confirm their tables scroll
   horizontally when the viewport is narrow.
6. Open an invalid path such as `/learn/not-a-lesson` and confirm the course-map recovery link is
   available.

No user account is required for Phase 4 review.
