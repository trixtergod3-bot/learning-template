import { z } from 'zod';

import { ActivityModeSchema, ActivityResultSchema } from './activities';
import {
  ActivityIdSchema,
  CourseIdSchema,
  ItemIdSchema,
  SessionIdSchema,
  SkillIdSchema,
} from './identifiers';

export const PracticeSessionSchema = z
  .object({
    id: SessionIdSchema,
    courseId: CourseIdSchema,
    activityId: ActivityIdSchema,
    mode: ActivityModeSchema,
    status: z.enum(['active', 'completed', 'abandoned']),
    contentVersion: z.string().trim().min(1),
    seed: z.string().trim().min(1).optional(),
    startedAt: z.iso.datetime(),
    completedAt: z.iso.datetime().optional(),
  })
  .superRefine((session, context) => {
    if (session.status === 'active' && session.completedAt) {
      context.addIssue({
        code: 'custom',
        message: 'An active session cannot have a completion timestamp.',
        path: ['completedAt'],
      });
    }

    if (session.completedAt && session.completedAt < session.startedAt) {
      context.addIssue({
        code: 'custom',
        message: 'A session cannot complete before it starts.',
        path: ['completedAt'],
      });
    }
  });

export const ItemReferenceSchema = z.object({
  itemId: ItemIdSchema,
  contentVersion: z.string().trim().min(1),
  generatorId: z.string().trim().min(1).optional(),
  generatorVersion: z.string().trim().min(1).optional(),
  seed: z.string().trim().min(1).optional(),
  sequence: z.number().int().nonnegative().optional(),
});

export const AttemptSubmissionSchema = z.object({
  eventId: z.string().trim().min(1).max(128),
  sessionId: SessionIdSchema,
  itemRef: ItemReferenceSchema,
  response: z.unknown(),
  responseTimeMs: z.number().int().nonnegative().optional(),
  occurredAt: z.iso.datetime(),
});

export const SkillEvidenceSchema = z.object({
  skillId: SkillIdSchema,
  weight: z.number().finite().positive(),
});

export const AttemptRecordSchema = AttemptSubmissionSchema.extend({
  principalId: z.string().trim().min(1),
  result: ActivityResultSchema,
  validation: z.enum(['local', 'trusted']),
  skillEvidence: z.array(SkillEvidenceSchema).min(1),
});

export const SkillMasterySchema = z.object({
  skillId: SkillIdSchema,
  evidenceCount: z.number().int().nonnegative(),
  masteryScore: z.number().min(0).max(100),
  lastPracticedAt: z.iso.datetime().optional(),
  calculationVersion: z.string().trim().min(1),
});

export const UserProfileSchema = z.object({
  userId: z.string().trim().min(1),
  displayName: z.string().trim().min(1).max(80),
  locale: z.string().trim().min(2).max(35),
});

export type PracticeSession = z.infer<typeof PracticeSessionSchema>;
export type ItemReference = z.infer<typeof ItemReferenceSchema>;
export type AttemptSubmission = z.infer<typeof AttemptSubmissionSchema>;
export type AttemptRecord = z.infer<typeof AttemptRecordSchema>;
export type SkillEvidence = z.infer<typeof SkillEvidenceSchema>;
export type SkillMastery = z.infer<typeof SkillMasterySchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
