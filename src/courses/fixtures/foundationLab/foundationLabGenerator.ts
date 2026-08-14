import { z } from 'zod';

import { itemId, skillId } from '@/engine/domain/identifiers';
import type { ActivityGenerator } from '@/engine/generators/generatorRegistry';

const FoundationLabGeneratorConfigurationSchema = z.object({
  minimum: z.number().int(),
  maximum: z.number().int(),
});

type FoundationLabGeneratorConfiguration = z.infer<
  typeof FoundationLabGeneratorConfigurationSchema
>;

export const foundationLabGenerator: ActivityGenerator<FoundationLabGeneratorConfiguration> = {
  id: 'foundation-lab.pair-sum',
  version: '1.0.0',
  configSchema: FoundationLabGeneratorConfigurationSchema.refine(
    ({ minimum, maximum }) => maximum >= minimum,
    'Maximum must be greater than or equal to minimum.',
  ),
  generate(context, configuration) {
    const left = context.random.integer(configuration.minimum, configuration.maximum);
    const right = context.random.integer(configuration.minimum, configuration.maximum);

    return {
      id: itemId(`generated-pair-${context.sequence}`),
      version: '1.0.0',
      kind: 'numeric-input',
      prompt: `What is ${left} + ${right}?`,
      answer: left + right,
      explanation: 'Combine the two quantities to find their total.',
      skillIds: [skillId('recognize-patterns')],
      ...(context.difficulty ? { difficulty: context.difficulty } : {}),
    };
  },
};
