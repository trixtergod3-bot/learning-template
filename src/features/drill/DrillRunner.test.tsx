import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { astrologyCourse } from '@/courses/astrology/astrologyCourse';
import type { DrillQuestion } from '@/engine/activities/drillEngine';
import { itemId, sessionId, skillId } from '@/engine/domain/identifiers';

import { DrillRunner } from './DrillRunner';

describe('DrillRunner', () => {
  it('accepts a typed numeric answer and reports response telemetry', async () => {
    const user = userEvent.setup();
    const questions: DrillQuestion[] = [
      {
        item: {
          id: itemId('seven-times-eight'),
          version: '1.0.0',
          kind: 'numeric-input',
          prompt: 'What is 7 × 8?',
          answer: 56,
          skillIds: [skillId('astrology.elements')],
        },
        itemRef: { itemId: itemId('seven-times-eight'), contentVersion: '1.0.0' },
      },
    ];

    render(
      <DrillRunner
        bundle={astrologyCourse}
        difficulty="easy"
        onExit={vi.fn()}
        onRetry={vi.fn()}
        principalId={null}
        questions={questions}
        repository={null}
        seed="numeric-test"
        sessionId={sessionId('80000000-0000-4000-8000-000000000008')}
        startedAt={new Date().toISOString()}
      />,
    );

    await user.type(screen.getByRole('textbox', { name: /type the number/i }), '56');
    await user.click(screen.getByRole('button', { name: /submit answer/i }));
    expect(screen.getByText('Correct')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next now/i }));
    expect(screen.getByRole('heading', { name: '100% accuracy' })).toBeInTheDocument();
    expect(screen.getByText('Per minute')).toBeInTheDocument();
    expect(screen.getByText('Average')).toBeInTheDocument();
  });
});
