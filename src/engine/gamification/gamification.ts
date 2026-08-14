import { z } from 'zod';

import { CourseIdSchema } from '@/engine/domain/identifiers';

export const AchievementIdSchema = z.enum([
  'first-steps',
  'focused-ten',
  'three-day-rhythm',
  'high-accuracy',
  'course-strong',
]);

export const GamificationSummarySchema = z.object({
  courseId: CourseIdSchema,
  xpTotal: z.number().int().nonnegative(),
  attemptCount: z.number().int().nonnegative(),
  accuracyPercentage: z.number().min(0).max(100),
  activeStreakDays: z.number().int().nonnegative(),
  longestStreakDays: z.number().int().nonnegative(),
  lastPracticedAt: z.iso.datetime().optional(),
  calculationVersion: z.string().trim().min(1).max(40),
});

export const AchievementRecordSchema = z.object({
  courseId: CourseIdSchema,
  achievementId: AchievementIdSchema,
  earnedAt: z.iso.datetime(),
  calculationVersion: z.string().trim().min(1).max(40),
});

export type AchievementId = z.infer<typeof AchievementIdSchema>;
export type GamificationSummary = z.infer<typeof GamificationSummarySchema>;
export type AchievementRecord = z.infer<typeof AchievementRecordSchema>;

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
}

export const achievementCatalog: readonly AchievementDefinition[] = [
  { id: 'first-steps', title: 'First steps', description: 'Record your first learning attempt.' },
  { id: 'focused-ten', title: 'Focused ten', description: 'Complete ten learning attempts.' },
  {
    id: 'three-day-rhythm',
    title: 'Three-day rhythm',
    description: 'Practice on three consecutive UTC days.',
  },
  {
    id: 'high-accuracy',
    title: 'Precision practice',
    description: 'Reach 80% accuracy across at least ten attempts.',
  },
  {
    id: 'course-strong',
    title: 'Connected mastery',
    description: 'Reach Strong status in every published course skill.',
  },
];

export function xpForLevel(level: number) {
  if (!Number.isInteger(level) || level < 1) throw new Error('A level must be a positive integer.');
  return (level - 1) ** 2 * 100;
}

export function levelForXp(xpTotal: number) {
  if (!Number.isFinite(xpTotal) || xpTotal < 0) throw new Error('XP must be nonnegative.');
  return Math.floor(Math.sqrt(xpTotal / 100)) + 1;
}

export function levelProgress(xpTotal: number) {
  const level = levelForXp(xpTotal);
  const currentFloor = xpForLevel(level);
  const nextFloor = xpForLevel(level + 1);
  return {
    level,
    currentFloor,
    nextFloor,
    earnedThisLevel: xpTotal - currentFloor,
    requiredThisLevel: nextFloor - currentFloor,
    percentage: Math.round(((xpTotal - currentFloor) / (nextFloor - currentFloor)) * 100),
  };
}

export function displayActiveStreak(summary: GamificationSummary, now = new Date()) {
  if (!summary.lastPracticedAt) return 0;
  const last = utcDayNumber(new Date(summary.lastPracticedAt));
  const today = utcDayNumber(now);
  return today - last <= 1 ? summary.activeStreakDays : 0;
}

function utcDayNumber(value: Date) {
  return Math.floor(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()) / 86_400_000,
  );
}
