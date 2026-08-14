import type { SupabaseClient } from '@supabase/supabase-js';

import type { CourseId, SessionId, SkillId } from '@/engine/domain/identifiers';
import {
  AttemptRecordSchema,
  PracticeSessionSchema,
  SkillMasterySchema,
  type AttemptRecord,
  type PracticeSession,
} from '@/engine/domain/sessions';
import type { LearningRepository } from '@/engine/ports/learningRepository';
import type { Database, Json } from '@/infrastructure/supabase/database.types';

type SessionRow = Database['public']['Tables']['practice_sessions']['Row'];
type AttemptRow = Database['public']['Tables']['activity_attempts']['Row'];

function toPracticeSession(row: SessionRow): PracticeSession {
  return PracticeSessionSchema.parse({
    id: row.id,
    courseId: row.course_id,
    activityId: row.activity_id,
    mode: row.mode,
    difficulty: row.difficulty ?? undefined,
    status: row.status,
    contentVersion: row.content_version,
    seed: row.seed ?? undefined,
    startedAt: row.started_at,
    completedAt: row.completed_at ?? undefined,
  });
}

function toAttemptRecord(
  row: AttemptRow,
  evidence: readonly { skill_id: string; weight: number }[],
): AttemptRecord {
  return AttemptRecordSchema.parse({
    eventId: row.event_id,
    sessionId: row.session_id,
    principalId: row.user_id,
    itemRef: {
      itemId: row.item_id,
      contentVersion: row.content_version,
      generatorId: row.generator_id ?? undefined,
      generatorVersion: row.generator_version ?? undefined,
      seed: row.generator_seed ?? undefined,
      sequence: row.generator_sequence ?? undefined,
    },
    response: row.response,
    responseTimeMs: row.response_time_ms ?? undefined,
    occurredAt: row.occurred_at,
    result: {
      correct: row.correct,
      score: row.score,
      maxScore: row.max_score,
      feedback: row.feedback ?? undefined,
    },
    validation: row.validation,
    skillEvidence: evidence.map(({ skill_id, weight }) => ({ skillId: skill_id, weight })),
  });
}

export class SupabaseLearningRepository implements LearningRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async saveSession(principalId: string, session: PracticeSession) {
    const parsed = PracticeSessionSchema.parse(session);
    const { data: existing, error: readError } = await this.client
      .from('practice_sessions')
      .select('id')
      .eq('id', parsed.id)
      .maybeSingle();

    if (readError) throw readError;

    if (existing) {
      const { error } = await this.client
        .from('practice_sessions')
        .update({ status: parsed.status, completed_at: parsed.completedAt ?? null })
        .eq('id', parsed.id);

      if (error) throw error;
      return;
    }

    const { error } = await this.client.from('practice_sessions').insert({
      id: parsed.id,
      user_id: principalId,
      course_id: parsed.courseId,
      activity_id: parsed.activityId,
      mode: parsed.mode,
      difficulty: parsed.difficulty ?? null,
      status: parsed.status,
      content_version: parsed.contentVersion,
      seed: parsed.seed ?? null,
      started_at: parsed.startedAt,
      completed_at: parsed.completedAt ?? null,
    });

    if (error) throw error;
  }

  async findSession(id: SessionId) {
    const { data, error } = await this.client
      .from('practice_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toPracticeSession(data) : null;
  }

  async appendAttempt(attempt: AttemptRecord) {
    const parsed = AttemptRecordSchema.parse(attempt);
    const generator = parsed.itemRef.generatorId
      ? {
          p_generator_id: parsed.itemRef.generatorId,
          p_generator_version: parsed.itemRef.generatorVersion!,
          p_generator_seed: parsed.itemRef.seed!,
          p_generator_sequence: parsed.itemRef.sequence!,
        }
      : {};
    const { error } = await this.client.rpc('record_local_attempt', {
      p_event_id: parsed.eventId,
      p_session_id: parsed.sessionId,
      p_item_id: parsed.itemRef.itemId,
      p_content_version: parsed.itemRef.contentVersion,
      p_response: parsed.response as Json,
      p_correct: parsed.result.correct,
      p_score: parsed.result.score,
      p_max_score: parsed.result.maxScore,
      p_occurred_at: parsed.occurredAt,
      p_skill_evidence: parsed.skillEvidence.map(({ skillId, weight }) => ({
        skill_id: skillId,
        weight,
      })),
      ...(parsed.result.feedback ? { p_feedback: parsed.result.feedback } : {}),
      ...(parsed.responseTimeMs === undefined ? {} : { p_response_time_ms: parsed.responseTimeMs }),
      ...generator,
    });

    if (error) throw error;
  }

  async listAttempts(id: SessionId) {
    const { data: attempts, error: attemptError } = await this.client
      .from('activity_attempts')
      .select('*')
      .eq('session_id', id)
      .order('occurred_at');

    if (attemptError) throw attemptError;
    if (attempts.length === 0) return [];

    const attemptIds = attempts.map(({ id: attemptId }) => attemptId);
    const { data: evidence, error: evidenceError } = await this.client
      .from('attempt_skill_evidence')
      .select('attempt_id, skill_id, weight')
      .in('attempt_id', attemptIds);

    if (evidenceError) throw evidenceError;

    return attempts.map((attempt) =>
      toAttemptRecord(
        attempt,
        evidence.filter(({ attempt_id }) => attempt_id === attempt.id),
      ),
    );
  }

  async findSkillMastery(principalId: string, courseId: CourseId, skillId: SkillId) {
    const { data, error } = await this.client
      .from('skill_mastery')
      .select('*')
      .eq('user_id', principalId)
      .eq('course_id', courseId)
      .eq('skill_id', skillId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return SkillMasterySchema.parse({
      skillId: data.skill_id,
      evidenceCount: data.evidence_count,
      masteryScore: data.mastery_score,
      lastPracticedAt: data.last_practiced_at ?? undefined,
      calculationVersion: data.calculation_version,
    });
  }
}
