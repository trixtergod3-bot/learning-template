import type { ActivityItem, ActivityResult } from '@/engine/domain/activities';
import { createSeededRandom } from '@/engine/generators/random';

export type ChoiceActivityItem = Extract<ActivityItem, { kind: 'single-choice' | 'multi-select' }>;

export function isChoiceActivityItem(item: ActivityItem): item is ChoiceActivityItem {
  return item.kind === 'single-choice' || item.kind === 'multi-select';
}

export function buildQuizQuestions(
  items: readonly ActivityItem[],
  questionCount: number,
  seed: string,
): ChoiceActivityItem[] {
  if (!Number.isInteger(questionCount) || questionCount <= 0) {
    throw new Error('A quiz requires a positive whole-number question count.');
  }

  const choiceItems = items.filter(isChoiceActivityItem);

  if (choiceItems.length === 0) throw new Error('A quiz requires at least one choice question.');

  return createSeededRandom(seed).shuffle(choiceItems).slice(0, questionCount);
}

export function evaluateChoiceAnswer(
  item: ChoiceActivityItem,
  selectedOptionIds: readonly string[],
): ActivityResult {
  const selected = new Set(selectedOptionIds);
  const expected = new Set(
    item.kind === 'single-choice' ? [item.correctOptionId] : item.correctOptionIds,
  );
  const correct =
    selected.size === expected.size && [...expected].every((optionId) => selected.has(optionId));

  return {
    correct,
    score: correct ? 1 : 0,
    maxScore: 1,
    feedback: item.explanation,
  };
}

export function correctOptionIds(item: ChoiceActivityItem): readonly string[] {
  return item.kind === 'single-choice' ? [item.correctOptionId] : item.correctOptionIds;
}
