import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { astrologyCourse } from '@/courses/astrology/astrologyCourse';
import { sessionId } from '@/engine/domain/identifiers';

import { QuizRunner } from './QuizRunner';

describe('QuizRunner', () => {
  it('scores a complete multi-select answer and presents results', async () => {
    const user = userEvent.setup();
    const fireSigns = astrologyCourse.items.find(({ id }) => id === 'astrology.fire-signs.easy');

    if (!fireSigns) throw new Error('Missing Astrology fixture.');

    render(
      <QuizRunner
        bundle={astrologyCourse}
        difficulty="easy"
        items={[fireSigns]}
        onExit={vi.fn()}
        onRetry={vi.fn()}
        principalId={null}
        questionCount={1}
        repository={null}
        seed="quiz-test"
        sessionId={sessionId('60000000-0000-4000-8000-000000000006')}
        startedAt="2026-08-14T04:30:00.000Z"
      />,
    );

    const runner = screen.getByLabelText('Quiz runner');
    await user.click(within(runner).getByRole('button', { name: /Aries/i }));
    await user.click(within(runner).getByRole('button', { name: /Leo/i }));
    await user.click(within(runner).getByRole('button', { name: /Sagittarius/i }));
    await user.click(within(runner).getByRole('button', { name: /check answer/i }));

    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText(/Aries, Leo, and Sagittarius are the Fire signs/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /see results/i }));

    expect(screen.getByRole('heading', { name: '100% correct' })).toBeInTheDocument();
    expect(screen.getByText(/guest result stays in this practice run/i)).toBeInTheDocument();
  });
});
