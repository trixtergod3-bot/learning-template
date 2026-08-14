import type { ActivityItem, ActivityResult } from '@/engine/domain/activities';
import { createSeededRandom } from '@/engine/generators/random';

export type FlashcardActivityItem = Extract<ActivityItem, { kind: 'flashcard' }>;
export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy';

export function isFlashcardItem(item: ActivityItem): item is FlashcardActivityItem {
  return item.kind === 'flashcard';
}

export function buildFlashcardDeck(
  items: readonly ActivityItem[],
  cardCount: number,
  seed: string,
): FlashcardActivityItem[] {
  if (!Number.isInteger(cardCount) || cardCount <= 0) {
    throw new Error('A flashcard deck requires a positive whole-number card count.');
  }

  const cards = items.filter(isFlashcardItem);
  if (cards.length === 0) throw new Error('A flashcard deck requires at least one card.');
  return createSeededRandom(seed).shuffle(cards).slice(0, cardCount);
}

export function scheduleFlashcardReview(
  remainingCards: readonly FlashcardActivityItem[],
  reviewedCard: FlashcardActivityItem,
  rating: FlashcardRating,
): FlashcardActivityItem[] {
  if (rating === 'good' || rating === 'easy') return [...remainingCards];

  const queue = [...remainingCards];
  const offset = rating === 'again' ? 2 : 4;
  queue.splice(Math.min(offset, queue.length), 0, reviewedCard);
  return queue;
}

export function flashcardRatingResult(rating: FlashcardRating): ActivityResult {
  const scoreByRating: Record<FlashcardRating, number> = {
    again: 0,
    hard: 0.5,
    good: 0.8,
    easy: 1,
  };

  return {
    correct: rating === 'good' || rating === 'easy',
    score: scoreByRating[rating],
    maxScore: 1,
    feedback: `Self-rated ${rating}.`,
  };
}
