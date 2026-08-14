import { z } from 'zod';

const TextSchema = z.string().trim().min(1);

export const ContentBlockSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('heading'),
    level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    text: TextSchema,
  }),
  z.object({
    kind: z.literal('paragraph'),
    text: TextSchema,
  }),
  z.object({
    kind: z.literal('list'),
    style: z.enum(['ordered', 'unordered']),
    items: z.array(TextSchema).min(1),
  }),
  z.object({
    kind: z.literal('key-facts'),
    facts: z
      .array(
        z.object({
          label: TextSchema,
          value: TextSchema,
        }),
      )
      .min(1),
  }),
  z.object({
    kind: z.literal('callout'),
    tone: z.enum(['info', 'tip', 'warning']),
    content: TextSchema,
  }),
  z.object({
    kind: z.literal('image'),
    src: TextSchema,
    alt: TextSchema,
    caption: TextSchema.optional(),
  }),
  z.object({
    kind: z.enum(['example', 'worked-example']),
    title: TextSchema.optional(),
    steps: z.array(TextSchema).min(1),
  }),
  z.object({
    kind: z.literal('table'),
    columns: z.array(TextSchema).min(1),
    rows: z.array(z.array(TextSchema).min(1)).min(1),
  }),
  z.object({
    kind: z.literal('quote'),
    text: TextSchema,
    attribution: TextSchema.optional(),
  }),
]);

export type ContentBlock = z.infer<typeof ContentBlockSchema>;
