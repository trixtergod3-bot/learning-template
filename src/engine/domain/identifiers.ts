import { z } from 'zod';

declare const identifierBrand: unique symbol;

export type Identifier<Kind extends string> = string & {
  readonly [identifierBrand]: Kind;
};

export type CourseId = Identifier<'Course'>;
export type ModuleId = Identifier<'Module'>;
export type TopicId = Identifier<'Topic'>;
export type LessonId = Identifier<'Lesson'>;
export type ActivityId = Identifier<'Activity'>;
export type ItemId = Identifier<'Item'>;
export type SkillId = Identifier<'Skill'>;
export type SessionId = Identifier<'Session'>;

const identifierPattern = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

function identifierSchema<Kind extends string>(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(96, `${label} must be 96 characters or fewer.`)
    .regex(identifierPattern, `${label} must use lowercase URL-safe characters.`)
    .transform((value) => value as Identifier<Kind>);
}

export const CourseIdSchema = identifierSchema<'Course'>('Course ID');
export const ModuleIdSchema = identifierSchema<'Module'>('Module ID');
export const TopicIdSchema = identifierSchema<'Topic'>('Topic ID');
export const LessonIdSchema = identifierSchema<'Lesson'>('Lesson ID');
export const ActivityIdSchema = identifierSchema<'Activity'>('Activity ID');
export const ItemIdSchema = identifierSchema<'Item'>('Item ID');
export const SkillIdSchema = identifierSchema<'Skill'>('Skill ID');
export const SessionIdSchema = identifierSchema<'Session'>('Session ID');

export const courseId = (value: string): CourseId => CourseIdSchema.parse(value);
export const moduleId = (value: string): ModuleId => ModuleIdSchema.parse(value);
export const topicId = (value: string): TopicId => TopicIdSchema.parse(value);
export const lessonId = (value: string): LessonId => LessonIdSchema.parse(value);
export const activityId = (value: string): ActivityId => ActivityIdSchema.parse(value);
export const itemId = (value: string): ItemId => ItemIdSchema.parse(value);
export const skillId = (value: string): SkillId => SkillIdSchema.parse(value);
export const sessionId = (value: string): SessionId => SessionIdSchema.parse(value);
