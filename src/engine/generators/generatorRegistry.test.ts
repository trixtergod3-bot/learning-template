import { describe, expect, it } from 'vitest';

import { foundationLabCourse } from '@/courses/fixtures/foundationLab/foundationLabCourse';
import { foundationLabGenerator } from '@/courses/fixtures/foundationLab/foundationLabGenerator';
import { GeneratorRegistry } from '@/engine/generators/generatorRegistry';

const generatedSource = (() => {
  const activity = foundationLabCourse.activities.find(({ source }) => source.kind === 'generated');

  if (!activity || activity.source.kind !== 'generated') {
    throw new Error('The fixture must expose a generated activity.');
  }

  return activity.source;
})();

describe('GeneratorRegistry', () => {
  it('replays a generated item from a stable seed and version', () => {
    const registry = new GeneratorRegistry();
    registry.register(foundationLabGenerator);

    const context = { seed: 'repeatable-session', sequence: 3, locale: 'en' } as const;
    const first = registry.generate(generatedSource, context);
    const replay = registry.generate(generatedSource, context);

    expect(replay).toEqual(first);
  });

  it('changes its deterministic stream when the sequence changes', () => {
    const registry = new GeneratorRegistry();
    registry.register(foundationLabGenerator);

    const first = registry.generate(generatedSource, {
      seed: 'repeatable-session',
      sequence: 1,
      locale: 'en',
    });
    const next = registry.generate(generatedSource, {
      seed: 'repeatable-session',
      sequence: 2,
      locale: 'en',
    });

    expect(next.prompt).not.toBe(first.prompt);
  });

  it('rejects an unknown generator version', () => {
    const registry = new GeneratorRegistry();
    registry.register(foundationLabGenerator);

    expect(() =>
      registry.generate(
        { ...generatedSource, generatorVersion: '2.0.0' },
        { seed: 'session', sequence: 0, locale: 'en' },
      ),
    ).toThrow(/unknown activity generator/i);
  });
});
