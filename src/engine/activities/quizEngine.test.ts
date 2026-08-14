import { describe, expect, it } from 'vitest';

import type { ActivityItem } from '@/engine/domain/activities';
import { itemId, skillId } from '@/engine/domain/identifiers';

import { buildQuizQuestions, evaluateChoiceAnswer } from './quizEngine';

const items: ActivityItem[] = [
  {
    id: itemId('quiz.single'),
    version: '1.0.0',
    kind: 'single-choice',
    prompt: 'Choose one.',
    options: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ],
    correctOptionId: 'a',
    skillIds: [skillId('quiz.skill')],
  },
  {
    id: itemId('quiz.multi'),
    version: '1.0.0',
    kind: 'multi-select',
    prompt: 'Choose two.',
    options: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' },
    ],
    correctOptionIds: ['a', 'c'],
    skillIds: [skillId('quiz.skill')],
  },
];

describe('quiz engine', () => {
  it('builds a deterministic bounded question set', () => {
    expect(buildQuizQuestions(items, 1, 'same-seed')).toEqual(
      buildQuizQuestions(items, 1, 'same-seed'),
    );
    expect(buildQuizQuestions(items, 99, 'same-seed')).toHaveLength(2);
  });

  it('scores single-choice answers exactly', () => {
    const item = items[0];
    if (!item || item.kind !== 'single-choice') throw new Error('Missing fixture.');

    expect(evaluateChoiceAnswer(item, ['a']).correct).toBe(true);
    expect(evaluateChoiceAnswer(item, ['b']).correct).toBe(false);
  });

  it('requires the complete multi-select answer without extras', () => {
    const item = items[1];
    if (!item || item.kind !== 'multi-select') throw new Error('Missing fixture.');

    expect(evaluateChoiceAnswer(item, ['c', 'a']).correct).toBe(true);
    expect(evaluateChoiceAnswer(item, ['a']).correct).toBe(false);
    expect(evaluateChoiceAnswer(item, ['a', 'b', 'c']).correct).toBe(false);
  });
});
