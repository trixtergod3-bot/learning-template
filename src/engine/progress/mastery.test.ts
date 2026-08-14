import { describe, expect, it } from 'vitest';

import { astrologyCourse } from '@/courses/astrology/astrologyCourse';
import { skillId } from '@/engine/domain/identifiers';

import { buildCourseProgress, masteryStatus } from './mastery';

describe('mastery progress', () => {
  it('maps transparent score bands to learner-facing states', () => {
    expect(
      masteryStatus({
        skillId: skillId('a'),
        evidenceCount: 0,
        masteryScore: 0,
        calculationVersion: 'v1',
      }),
    ).toBe('not-started');
    expect(
      masteryStatus({
        skillId: skillId('a'),
        evidenceCount: 2,
        masteryScore: 49,
        calculationVersion: 'v1',
      }),
    ).toBe('building');
    expect(
      masteryStatus({
        skillId: skillId('a'),
        evidenceCount: 3,
        masteryScore: 74,
        calculationVersion: 'v1',
      }),
    ).toBe('developing');
    expect(
      masteryStatus({
        skillId: skillId('a'),
        evidenceCount: 5,
        masteryScore: 75,
        calculationVersion: 'v1',
      }),
    ).toBe('strong');
  });

  it('includes unpracticed skills in overall progress and recommends the weakest first', () => {
    const progress = buildCourseProgress(astrologyCourse, [
      {
        skillId: skillId('astrology.elements'),
        evidenceCount: 5,
        masteryScore: 80,
        lastPracticedAt: '2026-08-14T05:00:00.000Z',
        calculationVersion: 'mastery-v1',
      },
      {
        skillId: skillId('astrology.modalities'),
        evidenceCount: 2,
        masteryScore: 40,
        lastPracticedAt: '2026-08-14T05:01:00.000Z',
        calculationVersion: 'mastery-v1',
      },
    ]);

    expect(progress.masteryScore).toBe(15);
    expect(progress.evidenceCount).toBe(7);
    expect(progress.practicedSkills).toBe(2);
    expect(progress.strongSkills).toBe(1);
    expect(progress.modules[0]).toMatchObject({ practicedSkills: 2, skillCount: 8 });
    expect(progress.suggestedSkills[0]?.mastery.evidenceCount).toBe(0);
  });
});
