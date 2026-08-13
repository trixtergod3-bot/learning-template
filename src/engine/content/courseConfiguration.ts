import { z } from 'zod';

import { ActivityModeSchema } from '../domain/activities';
import { ActivityIdSchema, CourseIdSchema } from '../domain/identifiers';

export const CourseConfigurationSchema = z.object({
  courseId: CourseIdSchema,
  defaultLocale: z.string().trim().min(2).max(35),
  supportedLocales: z.array(z.string().trim().min(2).max(35)).min(1),
  enabledActivityModes: z.array(ActivityModeSchema).min(1),
  placementActivityId: ActivityIdSchema.optional(),
});

export type CourseConfiguration = z.infer<typeof CourseConfigurationSchema>;

export function defineCourseConfiguration(input: unknown): CourseConfiguration {
  return CourseConfigurationSchema.parse(input);
}
