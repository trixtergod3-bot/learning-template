import { describe, expect, it } from 'vitest';

import { astrologyCourse } from '@/courses/astrology/astrologyCourse';

import {
  buildFlashcardDeck,
  flashcardRatingResult,
  scheduleFlashcardReview,
} from './flashcardEngine';

describe('flashcard engine', () => {
  const cards = astrologyCourse.items.filter(({ kind }) => kind === 'flashcard');

  it('builds deterministic bounded decks', () => {
    expect(buildFlashcardDeck(cards, 5, 'same-seed')).toEqual(
      buildFlashcardDeck(cards, 5, 'same-seed'),
    );
    expect(buildFlashcardDeck(cards, 999, 'same-seed')).toHaveLength(cards.length);
  });

  it('requeues weak cards while graduating strong cards', () => {
    const [reviewed, ...remaining] = buildFlashcardDeck(cards, 6, 'queue-test');
    if (!reviewed) throw new Error('Missing flashcard fixture.');

    expect(scheduleFlashcardReview(remaining, reviewed, 'again')[2]).toBe(reviewed);
    expect(scheduleFlashcardReview(remaining, reviewed, 'hard')[4]).toBe(reviewed);
    expect(scheduleFlashcardReview(remaining, reviewed, 'good')).toEqual(remaining);
    expect(scheduleFlashcardReview(remaining, reviewed, 'easy')).toEqual(remaining);
  });

  it('maps self-ratings to bounded local evidence', () => {
    expect(flashcardRatingResult('again')).toMatchObject({ correct: false, score: 0 });
    expect(flashcardRatingResult('hard')).toMatchObject({ correct: false, score: 0.5 });
    expect(flashcardRatingResult('good')).toMatchObject({ correct: true, score: 0.8 });
    expect(flashcardRatingResult('easy')).toMatchObject({ correct: true, score: 1 });
  });
});
