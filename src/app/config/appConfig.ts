import { z } from 'zod';

import { ActivityModeSchema } from '@/engine/domain/activities';
import { CourseIdSchema, courseId } from '@/engine/domain/identifiers';

const NavigationItemSchema = z.object({
  id: z.enum(['home', 'learn', 'practice', 'progress', 'profile']),
  label: z.string().trim().min(1).max(40),
  path: z.string().startsWith('/'),
});

export const AppConfigurationSchema = z
  .object({
    appName: z.string().trim().min(1).max(80),
    tagline: z.string().trim().min(1).max(160),
    defaultCourseId: CourseIdSchema,
    enabledCourseIds: z.array(CourseIdSchema).min(1),
    enabledActivityModes: z.array(ActivityModeSchema).min(1),
    branding: z.object({
      logoText: z.string().trim().min(1).max(4),
      accent: z.string().regex(/^#[0-9a-f]{6}$/i),
    }),
    features: z.object({
      auth: z.boolean(),
      achievements: z.boolean(),
      dailyChallenge: z.boolean(),
      leaderboard: z.boolean(),
    }),
    navigation: z.array(NavigationItemSchema).min(1),
  })
  .superRefine((configuration, context) => {
    if (!configuration.enabledCourseIds.includes(configuration.defaultCourseId)) {
      context.addIssue({
        code: 'custom',
        message: 'The default course must be enabled.',
        path: ['defaultCourseId'],
      });
    }

    const navigationIds = new Set(configuration.navigation.map(({ id }) => id));
    if (navigationIds.size !== configuration.navigation.length) {
      context.addIssue({
        code: 'custom',
        message: 'Navigation item IDs must be unique.',
        path: ['navigation'],
      });
    }
  });

export type AppConfiguration = z.infer<typeof AppConfigurationSchema>;

export function defineAppConfiguration(input: unknown): AppConfiguration {
  return AppConfigurationSchema.parse(input);
}

export const appConfiguration = defineAppConfiguration({
  appName: 'LearningTemplate',
  tagline: 'One account. Every course.',
  defaultCourseId: courseId('astrology'),
  enabledCourseIds: [courseId('astrology')],
  enabledActivityModes: ['quiz', 'drill', 'flashcards'],
  branding: {
    logoText: 'LT',
    accent: '#f5b942',
  },
  features: {
    auth: true,
    achievements: true,
    dailyChallenge: false,
    leaderboard: false,
  },
  navigation: [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'learn', label: 'Learn', path: '/learn' },
    { id: 'practice', label: 'Practice', path: '/practice' },
    { id: 'progress', label: 'Progress', path: '/progress' },
    { id: 'profile', label: 'Profile', path: '/profile' },
  ],
});
