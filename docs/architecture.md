# Architecture

## Objective

LearningTemplate is one independently buildable application with replaceable course content. It is
not a quiz template, a monorepo, or a collection of copied legacy applications.

The central constraint is simple:

> Subject knowledge belongs to courses and extensions. Learning behavior belongs to the engine.

## Layers and dependency direction

```text
app
 ├─ composes course and generator registries
 ├─ configures branding and navigation
 └─ routes feature workflows

features ───────► engine contracts ◄────── courses
   │                    ▲                     │
   └────────► UI        │                     └─ generators/content
                        │
infrastructure ─────────┘
   ├─ local guest adapters
   └─ Supabase adapters (Phase 2+)
```

Allowed dependencies:

- `app` may compose every layer.
- `features` may depend on `engine`, `ui`, and application configuration.
- `courses` may depend on public `engine` contracts only.
- `infrastructure` may implement ports owned by `engine`.
- `ui` may render generic engine types but must not contain course knowledge.

Forbidden dependencies:

- `engine` importing React, Supabase, app configuration, or a course.
- A course importing an infrastructure adapter.
- Generic UI naming subject concepts.
- Feature workflows querying Supabase directly.

## Course hierarchy

```text
Course
  └─ Module
      └─ Topic
          ├─ Lesson
          │   └─ ContentBlock[]
          ├─ Activity[]
          └─ Skill[]
```

Course bundles are Git-backed, typed, and runtime validated when registered. Cross-references,
stable identifiers, correct-option membership, generator configuration, and duplicate IDs fail
early rather than producing broken screens later.

## Three independent activity dimensions

LearningTemplate does not use one overloaded `ActivityType` value. It separates:

1. **Mode** — the learning workflow: `quiz`, `drill`, or `flashcards`.
2. **Item kind** — the response renderer: single choice, multi-select, numeric input, text input, or
   flashcard.
3. **Source** — where items come from: static content or a generator.

This permits, for example, a fast static recall drill, a generated multiple-choice quiz, or a
generated numeric drill without adding subject-specific components.

## Static content

Static items have stable IDs and versions and live in a course bundle. They declare their skills,
prompt, answer contract, and optional explanation. Activities reference them by ID.

## Generated content

Generators are pure course extensions registered by `(id, version)`. Generation receives:

- A recorded seed
- A sequence number
- Difficulty and locale when configured
- A deterministic random source
- Runtime-validated generator configuration

An attempt can therefore retain the generator ID, version, seed, and sequence and reproduce the
same item later. `Math.random()` is deliberately absent from generator contracts.

## Learning evidence

`PracticeSession` describes lifecycle. `AttemptRecord` is immutable evidence and includes:

- Idempotency event ID
- Static/generated item reference and content version
- Response and result
- Optional response time
- Trust level (`local` or `trusted`)
- Weighted skill evidence

`SkillMastery` is a recalculable projection. It must never become the only surviving record of
learning activity.

## Persistence

Features will depend on `LearningRepository`, not a concrete database. Phase 1 defines the port and
a browser guest-identity adapter. Phase 2 will add local evidence persistence and a Supabase adapter
without changing course definitions or activity rendering.

## Configuration and cloning

`AppConfiguration` controls app name, brand accent, default course, enabled activity modes, feature
flags, and navigation. `CourseConfiguration` controls locale, enabled modes, and optional placement.

A subject-specific product should primarily change:

- App configuration and branding
- Registered course bundles
- Course generators
- Enabled optional features

It should not fork or rewrite the engine.
