import { z } from 'zod';

import {
  ActivityItemSchema,
  DifficultySchema,
  type ActivityItem,
  type ActivitySource,
} from '../domain/activities';
import { createSeededRandom, type RandomSource } from './random';

export const GenerationContextSchema = z.object({
  seed: z.string().trim().min(1),
  sequence: z.number().int().nonnegative(),
  difficulty: DifficultySchema.optional(),
  locale: z.string().trim().min(2).max(35),
});

export type GenerationContext = z.infer<typeof GenerationContextSchema>;

export interface GeneratorContext extends GenerationContext {
  random: RandomSource;
}

export interface ActivityGenerator<Configuration> {
  readonly id: string;
  readonly version: string;
  readonly configSchema: z.ZodType<Configuration>;
  generate(context: GeneratorContext, configuration: Configuration): ActivityItem;
}

type GeneratedActivitySource = Extract<ActivitySource, { kind: 'generated' }>;

const generatorKey = (id: string, version: string) => `${id}@${version}`;

export class GeneratorRegistry {
  readonly #generators = new Map<string, ActivityGenerator<unknown>>();

  register<Configuration>(generator: ActivityGenerator<Configuration>): void {
    const key = generatorKey(generator.id, generator.version);

    if (this.#generators.has(key)) {
      throw new Error(`Activity generator is already registered: ${key}`);
    }

    this.#generators.set(key, generator as unknown as ActivityGenerator<unknown>);
  }

  generate(source: GeneratedActivitySource, input: GenerationContext): ActivityItem {
    const context = GenerationContextSchema.parse(input);
    const key = generatorKey(source.generatorId, source.generatorVersion);
    const generator = this.#generators.get(key);

    if (!generator) {
      throw new Error(`Unknown activity generator: ${key}`);
    }

    const configuration = generator.configSchema.parse(source.generatorConfig);
    const random = createSeededRandom(`${context.seed}:${context.sequence}:${key}`);

    return ActivityItemSchema.parse(generator.generate({ ...context, random }, configuration));
  }
}
