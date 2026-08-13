import { z } from 'zod';

import { ContentBlockSchema } from './content';
import {
  ActivityIdSchema,
  CourseIdSchema,
  LessonIdSchema,
  ModuleIdSchema,
  SkillIdSchema,
  TopicIdSchema,
} from './identifiers';

const TitleSchema = z.string().trim().min(1).max(120);
const SummarySchema = z.string().trim().min(1).max(320);

export const CourseSchema = z.object({
  id: CourseIdSchema,
  version: z.string().trim().min(1).max(40),
  title: TitleSchema,
  summary: SummarySchema,
  moduleIds: z.array(ModuleIdSchema),
});

export const ModuleSchema = z.object({
  id: ModuleIdSchema,
  courseId: CourseIdSchema,
  title: TitleSchema,
  summary: SummarySchema,
  topicIds: z.array(TopicIdSchema),
  prerequisiteModuleIds: z.array(ModuleIdSchema),
});

export const TopicSchema = z.object({
  id: TopicIdSchema,
  moduleId: ModuleIdSchema,
  title: TitleSchema,
  summary: SummarySchema,
  lessonIds: z.array(LessonIdSchema),
  activityIds: z.array(ActivityIdSchema),
  skillIds: z.array(SkillIdSchema),
});

export const LessonSchema = z.object({
  id: LessonIdSchema,
  topicId: TopicIdSchema,
  title: TitleSchema,
  blocks: z.array(ContentBlockSchema).min(1),
  activityIds: z.array(ActivityIdSchema),
});

export const SkillSchema = z.object({
  id: SkillIdSchema,
  courseId: CourseIdSchema,
  title: TitleSchema,
  description: SummarySchema,
  parentSkillId: SkillIdSchema.optional(),
});

export type Course = z.infer<typeof CourseSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Skill = z.infer<typeof SkillSchema>;
