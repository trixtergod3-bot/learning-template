import { z } from 'zod';

import { ContentBlockSchema } from './content';
import { ActivityIdSchema, CourseIdSchema, ItemIdSchema, SkillIdSchema } from './identifiers';

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);
export const ActivityModeSchema = z.enum(['quiz', 'drill', 'flashcards']);

const ItemBaseShape = {
  id: ItemIdSchema,
  version: z.string().trim().min(1).max(40),
  prompt: z.string().trim().min(1),
  explanation: z.string().trim().min(1).optional(),
  skillIds: z.array(SkillIdSchema).min(1),
  difficulty: DifficultySchema.optional(),
};

const ChoiceOptionSchema = z.object({
  id: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1),
});

export const SingleChoiceItemSchema = z
  .object({
    ...ItemBaseShape,
    kind: z.literal('single-choice'),
    options: z.array(ChoiceOptionSchema).min(2),
    correctOptionId: z.string().trim().min(1),
  })
  .superRefine((item, context) => {
    const optionIds = new Set(item.options.map((option) => option.id));

    if (optionIds.size !== item.options.length) {
      context.addIssue({ code: 'custom', message: 'Choice option IDs must be unique.' });
    }

    if (!optionIds.has(item.correctOptionId)) {
      context.addIssue({
        code: 'custom',
        message: 'The correct choice must refer to an available option.',
        path: ['correctOptionId'],
      });
    }
  });

export const MultiSelectItemSchema = z
  .object({
    ...ItemBaseShape,
    kind: z.literal('multi-select'),
    options: z.array(ChoiceOptionSchema).min(2),
    correctOptionIds: z.array(z.string().trim().min(1)).min(1),
  })
  .superRefine((item, context) => {
    const optionIds = new Set(item.options.map((option) => option.id));
    const correctOptionIds = new Set(item.correctOptionIds);

    if (optionIds.size !== item.options.length) {
      context.addIssue({ code: 'custom', message: 'Choice option IDs must be unique.' });
    }

    if (correctOptionIds.size !== item.correctOptionIds.length) {
      context.addIssue({ code: 'custom', message: 'Correct option IDs must be unique.' });
    }

    for (const correctOptionId of correctOptionIds) {
      if (!optionIds.has(correctOptionId)) {
        context.addIssue({
          code: 'custom',
          message: 'Every correct choice must refer to an available option.',
          path: ['correctOptionIds'],
        });
      }
    }
  });

export const NumericInputItemSchema = z.object({
  ...ItemBaseShape,
  kind: z.literal('numeric-input'),
  answer: z.number().finite(),
  tolerance: z.number().finite().nonnegative().optional(),
  unit: z.string().trim().min(1).optional(),
});

export const TextInputItemSchema = z.object({
  ...ItemBaseShape,
  kind: z.literal('text-input'),
  acceptedAnswers: z.array(z.string().trim().min(1)).min(1),
  normalization: z.enum(['exact', 'case-insensitive', 'trimmed-case-insensitive']),
});

export const FlashcardItemSchema = z.object({
  ...ItemBaseShape,
  kind: z.literal('flashcard'),
  front: z.array(ContentBlockSchema).min(1),
  back: z.array(ContentBlockSchema).min(1),
});

export const ActivityItemSchema = z.union([
  SingleChoiceItemSchema,
  MultiSelectItemSchema,
  NumericInputItemSchema,
  TextInputItemSchema,
  FlashcardItemSchema,
]);

export const ActivitySourceSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('static'),
    itemIds: z.array(ItemIdSchema).min(1),
  }),
  z.object({
    kind: z.literal('generated'),
    generatorId: z.string().trim().min(1).max(96),
    generatorVersion: z.string().trim().min(1).max(40),
    generatorConfig: z.unknown(),
  }),
]);

export const ActivityConfigurationSchema = z.object({
  questionCount: z.number().int().positive().optional(),
  shuffle: z.boolean(),
  feedback: z.enum(['immediate', 'deferred']),
  timer: z.enum(['hidden', 'elapsed', 'countdown']),
});

export const ActivityDefinitionSchema = z.object({
  id: ActivityIdSchema,
  courseId: CourseIdSchema,
  title: z.string().trim().min(1).max(120),
  mode: ActivityModeSchema,
  skillIds: z.array(SkillIdSchema).min(1),
  difficulty: DifficultySchema.optional(),
  source: ActivitySourceSchema,
  configuration: ActivityConfigurationSchema,
});

export const ActivityResultSchema = z
  .object({
    correct: z.boolean(),
    score: z.number().finite().nonnegative(),
    maxScore: z.number().finite().positive(),
    feedback: z.string().trim().min(1).max(1000).optional(),
  })
  .refine((result) => result.score <= result.maxScore, {
    message: 'A result score cannot exceed its maximum score.',
    path: ['score'],
  });

export type Difficulty = z.infer<typeof DifficultySchema>;
export type ActivityMode = z.infer<typeof ActivityModeSchema>;
export type ActivityItem = z.infer<typeof ActivityItemSchema>;
export type ActivitySource = z.infer<typeof ActivitySourceSchema>;
export type ActivityConfiguration = z.infer<typeof ActivityConfigurationSchema>;
export type ActivityDefinition = z.infer<typeof ActivityDefinitionSchema>;
export type ActivityResult = z.infer<typeof ActivityResultSchema>;
