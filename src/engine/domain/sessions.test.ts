import { describe, expect, it } from 'vitest';

import { ActivityResultSchema } from './activities';
import { ItemReferenceSchema, PracticeSessionSchema, SkillEvidenceSchema } from './sessions';

describe('durable learning evidence', () => {
  it('requires completed and abandoned sessions to record when they finished', () => {
    const result = PracticeSessionSchema.safeParse({
      id: '10000000-0000-4000-8000-000000000001',
      courseId: 'foundation-lab',
      activityId: 'learning-loop-check',
      mode: 'quiz',
      status: 'completed',
      contentVersion: '0.1.0',
      startedAt: '2026-08-14T10:00:00.000Z',
    });

    expect(result.success).toBe(false);
  });

  it('requires complete replay metadata for generated item references', () => {
    const result = ItemReferenceSchema.safeParse({
      itemId: 'generated-item',
      contentVersion: '1.0.0',
      generatorId: 'mental-math.addition',
    });

    expect(result.success).toBe(false);
    expect(
      ItemReferenceSchema.safeParse({
        itemId: 'generated-item',
        contentVersion: '1.0.0',
        generatorId: 'mental-math.addition',
        generatorVersion: '1.0.0',
        seed: 'replay-seed',
        sequence: 0,
      }).success,
    ).toBe(true);
  });

  it('keeps client evidence within database scoring and weighting bounds', () => {
    expect(ActivityResultSchema.safeParse({ correct: true, score: 2, maxScore: 1 }).success).toBe(
      false,
    );
    expect(
      SkillEvidenceSchema.safeParse({ skillId: 'recognize-patterns', weight: 11 }).success,
    ).toBe(false);
  });
});
