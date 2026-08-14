import type { CourseId, SessionId, SkillId } from '../domain/identifiers';
import type { AttemptRecord, PracticeSession, SkillMastery } from '../domain/sessions';

export interface LearningRepository {
  saveSession(principalId: string, session: PracticeSession): Promise<void>;
  findSession(sessionId: SessionId): Promise<PracticeSession | null>;
  appendAttempt(attempt: AttemptRecord): Promise<void>;
  listAttempts(sessionId: SessionId): Promise<readonly AttemptRecord[]>;
  findSkillMastery(
    principalId: string,
    courseId: CourseId,
    skillId: SkillId,
  ): Promise<SkillMastery | null>;
}

export interface GuestIdentityStore {
  getOrCreatePrincipalId(): string;
  clear(): void;
}
