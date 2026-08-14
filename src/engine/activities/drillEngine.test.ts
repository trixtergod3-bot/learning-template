import { describe, expect, it } from 'vitest';

import { foundationLabGenerator } from '@/courses/fixtures/foundationLab/foundationLabGenerator';
import { itemId, skillId } from '@/engine/domain/identifiers';
import { GeneratorRegistry } from '@/engine/generators/generatorRegistry';

import { buildGeneratedDrill, buildStaticDrill, evaluateDrillResponse } from './drillEngine';

describe('drillEngine', () => {
  const numericItem = {
    id: itemId('numeric-seven-times-eight'),
    version: '1.0.0',
    kind: 'numeric-input' as const,
    prompt: 'What is 7 × 8?',
    answer: 56,
    explanation: 'Seven groups of eight make 56.',
    skillIds: [skillId('multiplication-seven')],
  };

  it('evaluates choice, numeric, and normalized text responses', () => {
    expect(evaluateDrillResponse(numericItem, '56').correct).toBe(true);

    expect(
      evaluateDrillResponse(
        {
          id: itemId('text-fire'),
          version: '1.0.0',
          kind: 'text-input',
          prompt: 'Name the element.',
          acceptedAnswers: ['Fire'],
          normalization: 'trimmed-case-insensitive',
          skillIds: [skillId('elements')],
        },
        ' fire ',
      ).correct,
    ).toBe(true);
  });

  it('builds a deterministic static set with replayable item references', () => {
    const first = buildStaticDrill([numericItem], 1, 'static-seed');
    const replay = buildStaticDrill([numericItem], 1, 'static-seed');

    expect(replay).toEqual(first);
    expect(first[0]?.itemRef).toEqual({
      itemId: 'numeric-seven-times-eight',
      contentVersion: '1.0.0',
    });
  });

  it('generates the same numeric round from the recorded source, seed, and sequence', () => {
    const registry = new GeneratorRegistry();
    registry.register(foundationLabGenerator);
    const source = {
      kind: 'generated' as const,
      generatorId: foundationLabGenerator.id,
      generatorVersion: foundationLabGenerator.version,
      generatorConfig: { minimum: 2, maximum: 12 },
    };

    const first = buildGeneratedDrill(source, 4, 'generated-seed', registry);
    const replay = buildGeneratedDrill(source, 4, 'generated-seed', registry);

    expect(replay).toEqual(first);
    expect(first[2]?.itemRef).toMatchObject({
      generatorId: foundationLabGenerator.id,
      generatorVersion: foundationLabGenerator.version,
      seed: 'generated-seed',
      sequence: 2,
    });
  });
});
