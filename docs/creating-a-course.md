# Creating a course

The `Foundation Lab` fixture under `src/courses/fixtures` is the smallest executable example.
`src/courses/astrology` is the first production example. Real course packages should follow the
same boundary and live in a clearly named production directory.

## 1. Choose stable IDs and a version

IDs are lowercase, URL-safe, and intended to survive title changes. Do not derive progress keys from
display text.

```ts
const course = courseId('example-course');
const module = moduleId('core-concepts');
const skill = skillId('recognize-core-concepts');
```

Increment content or generator versions whenever a change could alter the meaning or answer of an
item. Cosmetic text corrections may follow the course's documented version policy.

## 2. Define the hierarchy

Use `defineCourseBundle` to declare modules, topics, lessons, activities, skills, and static items in
one validated package. The parser rejects duplicate IDs and broken references.

Content blocks currently support:

- Heading and paragraph
- Ordered and unordered list
- Key facts and callouts
- Image with required alternative text
- Example and worked example
- Table
- Quote

## 3. Link activities to skills

Every item and activity must name at least one skill. A skill should express something a learner can
demonstrate, not merely the screen they visited.

Good: `identify-cell-organelles`, `multiply-by-seven`, `recognize-past-tense`

Weak: `chapter-one`, `quiz-page`, `finished-lesson`

## 4. Choose a source

For curated content:

```ts
source: { kind: 'static', itemIds: [itemId('stable-item-id')] }
```

For generated content:

```ts
source: {
  kind: 'generated',
  generatorId: 'example-course.generator-name',
  generatorVersion: '1.0.0',
  generatorConfig: { /* course-owned validated configuration */ },
}
```

## 5. Implement deterministic generators

An `ActivityGenerator` owns a Zod configuration schema and a `generate` method. Use the provided
`context.random` source; never call `Math.random()`, read wall-clock time, or perform network/database
work inside generation.

Given the same generator version, configuration, seed, sequence, difficulty, and locale, output must
be identical.

## 6. Register at the composition root

Register bundles, course configurations, and generators in `src/app/registries.ts`. Feature code
must ask the composition-root selectors for a course instead of importing a subject package
directly. Subject imports belong only at the composition root and in subject-owned tests.

## 7. Test the bundle

At minimum test:

- Runtime schema acceptance
- Duplicate and missing-reference rejection
- Correct answers are present in options
- Generator replay from a fixed seed
- Generator configuration rejection
- Content-specific calculations and edge cases
- Accessibility of any course-provided media

Course content also needs subject-matter review; type safety cannot verify factual correctness.
