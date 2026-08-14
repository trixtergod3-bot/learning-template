import { describe, expect, it } from 'vitest';

import { courseId } from '@/engine/domain/identifiers';

import { displayActiveStreak, levelForXp, levelProgress, xpForLevel } from './gamification';

describe('gamification', () => {
  it('uses a transparent quadratic level curve', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(400);
    expect(levelForXp(399)).toBe(2);
    expect(levelProgress(250)).toEqual({
      level: 2,
      currentFloor: 100,
      nextFloor: 400,
      earnedThisLevel: 150,
      requiredThisLevel: 300,
      percentage: 50,
    });
  });

  it('expires the displayed current streak after one missed UTC day', () => {
    const summary = {
      courseId: courseId('astrology'),
      xpTotal: 120,
      attemptCount: 6,
      accuracyPercentage: 75,
      activeStreakDays: 3,
      longestStreakDays: 3,
      lastPracticedAt: '2026-08-13T10:00:00.000Z',
      calculationVersion: 'gamification-v1',
    };

    expect(displayActiveStreak(summary, new Date('2026-08-14T23:00:00.000Z'))).toBe(3);
    expect(displayActiveStreak(summary, new Date('2026-08-15T00:01:00.000Z'))).toBe(0);
  });
});
