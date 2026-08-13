import { defineCourseBundle } from '@/engine/content/courseBundle';
import { defineCourseConfiguration } from '@/engine/content/courseConfiguration';
import {
  activityId,
  courseId,
  itemId,
  lessonId,
  moduleId,
  skillId,
  topicId,
} from '@/engine/domain/identifiers';

const ids = {
  course: courseId('foundation-lab'),
  module: moduleId('learning-loop'),
  topic: topicId('practice-with-purpose'),
  lesson: lessonId('meet-the-learning-loop'),
  skill: skillId('recognize-patterns'),
  staticItem: itemId('learning-loop-order'),
  staticActivity: activityId('learning-loop-check'),
  generatedActivity: activityId('generated-practice-check'),
};

export const foundationLabCourse = defineCourseBundle({
  course: {
    id: ids.course,
    version: '0.1.0',
    title: 'Foundation Lab',
    summary:
      'A development fixture that proves lessons, static questions, and generators fit one engine.',
    moduleIds: [ids.module],
  },
  modules: [
    {
      id: ids.module,
      courseId: ids.course,
      title: 'The learning loop',
      summary: 'Move from a clear explanation to focused retrieval and reflection.',
      topicIds: [ids.topic],
      prerequisiteModuleIds: [],
    },
  ],
  topics: [
    {
      id: ids.topic,
      moduleId: ids.module,
      title: 'Practice with purpose',
      summary: 'A compact example of content, skills, and activities working together.',
      lessonIds: [ids.lesson],
      activityIds: [ids.staticActivity, ids.generatedActivity],
      skillIds: [ids.skill],
    },
  ],
  lessons: [
    {
      id: ids.lesson,
      topicId: ids.topic,
      title: 'Meet the learning loop',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Learning becomes durable when understanding is followed by retrieval, feedback, and review.',
        },
        {
          kind: 'key-facts',
          facts: [
            { label: 'Learn', value: 'Build a clear mental model.' },
            { label: 'Practice', value: 'Retrieve without leaning on the explanation.' },
            { label: 'Review', value: 'Use feedback to choose what comes next.' },
          ],
        },
      ],
      activityIds: [ids.staticActivity],
    },
  ],
  skills: [
    {
      id: ids.skill,
      courseId: ids.course,
      title: 'Recognize patterns',
      description: 'Identify and apply a learned relationship in a new prompt.',
    },
  ],
  items: [
    {
      id: ids.staticItem,
      version: '1.0.0',
      kind: 'single-choice',
      prompt: 'Which step should follow an initial explanation?',
      options: [
        { id: 'practice', label: 'Focused retrieval practice' },
        { id: 'ignore', label: 'Ignore the idea for several months' },
        { id: 'decorate', label: 'Only decorate the notes' },
      ],
      correctOptionId: 'practice',
      explanation: 'Retrieval reveals what is understood and where feedback is needed.',
      skillIds: [ids.skill],
      difficulty: 'easy',
    },
  ],
  activities: [
    {
      id: ids.staticActivity,
      courseId: ids.course,
      title: 'Check the learning loop',
      mode: 'quiz',
      skillIds: [ids.skill],
      difficulty: 'easy',
      source: { kind: 'static', itemIds: [ids.staticItem] },
      configuration: {
        questionCount: 1,
        shuffle: false,
        feedback: 'immediate',
        timer: 'hidden',
      },
    },
    {
      id: ids.generatedActivity,
      courseId: ids.course,
      title: 'Generated practice check',
      mode: 'drill',
      skillIds: [ids.skill],
      source: {
        kind: 'generated',
        generatorId: 'foundation-lab.pair-sum',
        generatorVersion: '1.0.0',
        generatorConfig: { minimum: 2, maximum: 12 },
      },
      configuration: {
        questionCount: 5,
        shuffle: false,
        feedback: 'immediate',
        timer: 'elapsed',
      },
    },
  ],
});

export const foundationLabConfiguration = defineCourseConfiguration({
  courseId: ids.course,
  defaultLocale: 'en',
  supportedLocales: ['en'],
  enabledActivityModes: ['quiz', 'drill', 'flashcards'],
});
