import { defineCourseBundle } from '@/engine/content/courseBundle';
import { defineCourseConfiguration } from '@/engine/content/courseConfiguration';
import type { ActivityItem, Difficulty } from '@/engine/domain/activities';
import {
  activityId,
  courseId,
  itemId,
  lessonId,
  moduleId,
  skillId,
  topicId,
} from '@/engine/domain/identifiers';

import { astrologyLessonDefinitions } from './astrologyLessons';
import {
  astrologyQuestionBank,
  astrologyTopicDefinitions,
  zodiacSigns,
  type AstrologyQuestionSeed,
  type AstrologyTopicId,
  type ZodiacSign,
} from './astrologyQuestionBank';

export const astrologyDifficulties = [
  'easy',
  'medium',
  'hard',
] as const satisfies readonly Difficulty[];

const optionCountByDifficulty: Record<Difficulty, number> = {
  easy: 6,
  medium: 9,
  hard: 12,
};

const astrologyIds = {
  course: courseId('astrology'),
  module: moduleId('astrology.zodiac-foundations'),
};

const astrologyTopicId = (value: AstrologyTopicId) => topicId(`astrology.${value}`);
const astrologySkillId = (value: AstrologyTopicId) => skillId(`astrology.${value}`);
const astrologyLessonId = (value: AstrologyTopicId) => lessonId(`astrology.${value}.foundations`);

function stableHash(value: string): number {
  let hash = 2_166_136_261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
}

function deterministicOrder<T>(values: readonly T[], seed: string, identify: (value: T) => string) {
  return [...values].sort((left, right) => {
    const leftRank = stableHash(`${seed}:${identify(left)}`);
    const rightRank = stableHash(`${seed}:${identify(right)}`);

    if (leftRank !== rightRank) return leftRank - rightRank;
    return identify(left).localeCompare(identify(right));
  });
}

function optionId(sign: ZodiacSign) {
  return sign.toLowerCase();
}

function buildOptions(question: AstrologyQuestionSeed, difficulty: Difficulty) {
  const correctAnswers = new Set<ZodiacSign>(question.correctAnswers);
  const incorrectSigns = zodiacSigns.filter((sign) => !correctAnswers.has(sign));
  const requiredDistractors = optionCountByDifficulty[difficulty] - question.correctAnswers.length;
  const distractors = deterministicOrder(
    incorrectSigns,
    `${question.id}:${difficulty}:distractors`,
    (sign) => sign,
  ).slice(0, Math.max(0, requiredDistractors));
  const labels = deterministicOrder(
    [...question.correctAnswers, ...distractors],
    `${question.id}:${difficulty}:options`,
    (sign) => sign,
  );

  return labels.map((sign) => ({ id: optionId(sign), label: sign }));
}

function buildItem(question: AstrologyQuestionSeed, difficulty: Difficulty): ActivityItem {
  const shared = {
    id: itemId(`astrology.${question.id}.${difficulty}`),
    version: '1.0.0',
    prompt: question.prompt,
    explanation: question.explanation,
    skillIds: [astrologySkillId(question.topicId)],
    difficulty,
    options: buildOptions(question, difficulty),
  };

  if (question.correctAnswers.length === 1) {
    const answer = question.correctAnswers[0];

    if (!answer) throw new Error(`Astrology question has no answer: ${question.id}`);

    return {
      ...shared,
      kind: 'single-choice',
      correctOptionId: optionId(answer),
    };
  }

  return {
    ...shared,
    kind: 'multi-select',
    correctOptionIds: question.correctAnswers.map(optionId),
  };
}

const items = astrologyQuestionBank.flatMap((question) =>
  astrologyDifficulties.map((difficulty) => buildItem(question, difficulty)),
);

const activities = astrologyTopicDefinitions.flatMap((topic) =>
  astrologyDifficulties.map((difficulty) => {
    const matchingItems = items.filter(
      (item) =>
        item.difficulty === difficulty && item.skillIds.includes(astrologySkillId(topic.id)),
    );

    return {
      id: activityId(`astrology.${topic.id}.${difficulty}`),
      courseId: astrologyIds.course,
      title: `${topic.title} · ${difficulty[0]?.toUpperCase()}${difficulty.slice(1)}`,
      mode: 'quiz' as const,
      skillIds: [astrologySkillId(topic.id)],
      difficulty,
      source: {
        kind: 'static' as const,
        itemIds: matchingItems.map(({ id }) => id),
      },
      configuration: {
        shuffle: true,
        feedback: 'immediate' as const,
        timer: 'elapsed' as const,
      },
    };
  }),
);

export const astrologyCourse = defineCourseBundle({
  course: {
    id: astrologyIds.course,
    version: '1.1.0',
    title: 'Astrology Foundations',
    summary:
      'Learn the zodiac through focused lessons and rapid recognition practice inspired by Astro11.',
    moduleIds: [astrologyIds.module],
  },
  modules: [
    {
      id: astrologyIds.module,
      courseId: astrologyIds.course,
      title: 'Zodiac Foundations',
      summary:
        'Build a connected map of signs, elements, modalities, dates, rulers, traits, polarity, and opposites.',
      topicIds: astrologyTopicDefinitions.map(({ id }) => astrologyTopicId(id)),
      prerequisiteModuleIds: [],
    },
  ],
  topics: astrologyTopicDefinitions.map((topic) => ({
    id: astrologyTopicId(topic.id),
    moduleId: astrologyIds.module,
    title: topic.title,
    summary: topic.summary,
    lessonIds: [astrologyLessonId(topic.id)],
    activityIds: astrologyDifficulties.map((difficulty) =>
      activityId(`astrology.${topic.id}.${difficulty}`),
    ),
    skillIds: [astrologySkillId(topic.id)],
  })),
  lessons: astrologyLessonDefinitions.map((lesson) => ({
    id: astrologyLessonId(lesson.topicId),
    topicId: astrologyTopicId(lesson.topicId),
    title: lesson.title,
    blocks: [...lesson.blocks],
    activityIds: astrologyDifficulties.map((difficulty) =>
      activityId(`astrology.${lesson.topicId}.${difficulty}`),
    ),
  })),
  skills: astrologyTopicDefinitions.map((topic) => ({
    id: astrologySkillId(topic.id),
    courseId: astrologyIds.course,
    title: topic.skillTitle,
    description: topic.skillDescription,
  })),
  items,
  activities,
});

export const astrologyConfiguration = defineCourseConfiguration({
  courseId: astrologyIds.course,
  defaultLocale: 'en',
  supportedLocales: ['en'],
  enabledActivityModes: ['quiz', 'drill', 'flashcards'],
  presentation: {
    badge: 'Inspired by Astro11',
    symbol: '☾',
    highlights: ['Elements', 'Rulers', 'Opposites'],
  },
});

export const astrologyQuestionCount = astrologyQuestionBank.length;
