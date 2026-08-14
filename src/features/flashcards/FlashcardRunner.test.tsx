import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { astrologyCourse } from '@/courses/astrology/astrologyCourse';
import { sessionId } from '@/engine/domain/identifiers';

import { FlashcardRunner } from './FlashcardRunner';

describe('FlashcardRunner', () => {
  it('reveals, self-rates, and completes a one-card deck', async () => {
    const user = userEvent.setup();
    const card = astrologyCourse.items.find(({ id }) => id === 'astrology.fire-signs.flashcard');

    if (!card) throw new Error('Missing flashcard fixture.');

    render(
      <FlashcardRunner
        bundle={astrologyCourse}
        cardCount={1}
        items={[card]}
        onExit={vi.fn()}
        onRetry={vi.fn()}
        principalId={null}
        repository={null}
        seed="flashcard-test"
        sessionId={sessionId('70000000-0000-4000-8000-000000000007')}
        startedAt="2026-08-14T05:00:00.000Z"
      />,
    );

    expect(screen.getByText('Which signs are Fire signs?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reveal answer/i }));

    expect(screen.getByRole('heading', { name: 'Aries, Leo, Sagittarius' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Good.*Graduate/i }));

    expect(screen.getByRole('heading', { name: '1 cards reviewed' })).toBeInTheDocument();
    expect(screen.getByText(/1 total reviews/i)).toBeInTheDocument();
  });
});
