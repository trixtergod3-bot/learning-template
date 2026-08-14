import { describe, expect, it } from 'vitest';

import { CourseBundleSchema } from '@/engine/content/courseBundle';

import { astrologyCourse, astrologyDifficulties, astrologyQuestionCount } from './astrologyCourse';
import { astrologyQuestionBank, astrologyTopicDefinitions } from './astrologyQuestionBank';

describe('Astrology course bundle', () => {
  it('registers the complete audited Astro11 question bank in the generic hierarchy', () => {
    expect(CourseBundleSchema.safeParse(astrologyCourse).success).toBe(true);
    expect(astrologyQuestionCount).toBe(53);
    expect(astrologyCourse.modules).toHaveLength(1);
    expect(astrologyCourse.topics).toHaveLength(astrologyTopicDefinitions.length);
    expect(astrologyCourse.lessons).toHaveLength(astrologyTopicDefinitions.length);
    expect(astrologyCourse.skills).toHaveLength(astrologyTopicDefinitions.length);
    expect(astrologyCourse.activities).toHaveLength(
      astrologyTopicDefinitions.length * (astrologyDifficulties.length * 2 + 1),
    );
    expect(astrologyCourse.items).toHaveLength(
      astrologyQuestionBank.length * (astrologyDifficulties.length + 1),
    );
  });

  it('connects every topic to one substantive lesson and its practice activities', () => {
    for (const topic of astrologyCourse.topics) {
      expect(topic.lessonIds).toHaveLength(1);

      const lesson = astrologyCourse.lessons.find(({ id }) => id === topic.lessonIds[0]);

      expect(lesson?.topicId).toBe(topic.id);
      expect(lesson?.blocks.length).toBeGreaterThanOrEqual(4);
      expect(lesson?.activityIds).toEqual(topic.activityIds);
    }
  });

  it.each([
    ['easy', 6],
    ['medium', 9],
    ['hard', 12],
  ] as const)('provides %s variants with %s deterministic choices', (difficulty, expectedCount) => {
    const items = astrologyCourse.items.filter((item) => item.difficulty === difficulty);

    expect(items).toHaveLength(astrologyQuestionBank.length);

    for (const item of items) {
      expect('options' in item ? item.options : []).toHaveLength(expectedCount);
    }
  });

  it('keeps every answer inside its validated option set', () => {
    for (const item of astrologyCourse.items) {
      if (item.kind === 'single-choice') {
        expect(item.options.some(({ id }) => id === item.correctOptionId)).toBe(true);
      }

      if (item.kind === 'multi-select') {
        const optionIds = new Set(item.options.map(({ id }) => id));
        expect(item.correctOptionIds.every((id) => optionIds.has(id))).toBe(true);
      }
    }
  });

  it('assigns each category and difficulty to one static activity', () => {
    for (const topic of astrologyCourse.topics) {
      const activities = astrologyCourse.activities.filter(
        ({ id, mode }) => mode === 'quiz' && topic.activityIds.includes(id),
      );

      expect(activities.map(({ difficulty }) => difficulty)).toEqual(astrologyDifficulties);
      expect(activities.every(({ source }) => source.kind === 'static')).toBe(true);
      expect(activities.every(({ skillIds }) => skillIds[0] === topic.skillIds[0])).toBe(true);
    }
  });

  it('provides one connected flashcard for every audited prompt', () => {
    const flashcards = astrologyCourse.items.filter(({ kind }) => kind === 'flashcard');
    const activities = astrologyCourse.activities.filter(({ mode }) => mode === 'flashcards');

    expect(flashcards).toHaveLength(astrologyQuestionBank.length);
    expect(activities).toHaveLength(astrologyTopicDefinitions.length);
    expect(activities.every(({ source }) => source.kind === 'static')).toBe(true);
    expect(
      activities.every(({ id }) =>
        astrologyCourse.topics.some(({ activityIds }) => activityIds.includes(id)),
      ),
    ).toBe(true);
  });

  it('connects every topic and difficulty to a rapid static drill', () => {
    for (const topic of astrologyCourse.topics) {
      const activities = astrologyCourse.activities.filter(
        ({ id, mode }) => mode === 'drill' && topic.activityIds.includes(id),
      );

      expect(activities.map(({ difficulty }) => difficulty)).toEqual(astrologyDifficulties);
      expect(activities.every(({ source }) => source.kind === 'static')).toBe(true);
      expect(activities.every(({ configuration }) => configuration.timer === 'elapsed')).toBe(true);
    }
  });
});
