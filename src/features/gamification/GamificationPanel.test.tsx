import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { courseId } from '@/engine/domain/identifiers';
import type { LearningRepository } from '@/engine/ports/learningRepository';

import { GamificationPanel } from './GamificationPanel';

describe('GamificationPanel', () => {
  it('shows derived level progress, streaks, and earned achievements', async () => {
    const repository: LearningRepository = {
      saveSession: vi.fn(),
      findSession: vi.fn(),
      appendAttempt: vi.fn(),
      listAttempts: vi.fn(),
      findSkillMastery: vi.fn(),
      listCourseMastery: vi.fn(),
      getCourseGamification: vi.fn().mockResolvedValue({
        summary: {
          courseId: courseId('astrology'),
          xpTotal: 250,
          attemptCount: 12,
          accuracyPercentage: 84,
          activeStreakDays: 3,
          longestStreakDays: 4,
          lastPracticedAt: new Date().toISOString(),
          calculationVersion: 'gamification-v1',
        },
        achievements: [
          {
            courseId: courseId('astrology'),
            achievementId: 'first-steps',
            earnedAt: '2026-08-14T05:00:00.000Z',
            calculationVersion: 'gamification-v1',
          },
        ],
      }),
    };

    render(
      <GamificationPanel
        courseId={courseId('astrology')}
        principalId="gamification-user"
        repository={repository}
      />,
    );

    expect(await screen.findByRole('heading', { name: 'Level 2' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Level progress' })).toHaveAttribute(
      'aria-valuenow',
      '50',
    );
    expect(screen.getByText('250 total XP · 150 until level 3')).toBeInTheDocument();
    expect(screen.getByText('First steps').closest('article')).toHaveTextContent('Earned');
    expect(screen.getByText('Focused ten').closest('article')).toHaveTextContent('Locked');
  });
});
