import { Flame, LockKeyhole, Medal, Sparkles, Target, Trophy, Zap } from 'lucide-react';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';

import type { CourseId } from '@/engine/domain/identifiers';
import {
  achievementCatalog,
  displayActiveStreak,
  levelProgress,
  type GamificationSummary,
} from '@/engine/gamification/gamification';
import type { CourseGamification, LearningRepository } from '@/engine/ports/learningRepository';

interface GamificationPanelProps {
  courseId: CourseId;
  principalId: string;
  repository: LearningRepository;
}

type LoadState =
  | { status: 'idle' }
  | { status: 'ready'; ownerId: string; gamification: CourseGamification }
  | { status: 'error'; ownerId: string };

function emptySummary(courseId: CourseId): GamificationSummary {
  return {
    courseId,
    xpTotal: 0,
    attemptCount: 0,
    accuracyPercentage: 0,
    activeStreakDays: 0,
    longestStreakDays: 0,
    calculationVersion: 'gamification-v1',
  };
}

export function GamificationPanel({ courseId, principalId, repository }: GamificationPanelProps) {
  const [load, setLoad] = useState<LoadState>({ status: 'idle' });

  useEffect(() => {
    let active = true;
    void repository
      .getCourseGamification(principalId, courseId)
      .then((gamification) => {
        if (active) setLoad({ status: 'ready', ownerId: principalId, gamification });
      })
      .catch(() => {
        if (active) setLoad({ status: 'error', ownerId: principalId });
      });
    return () => {
      active = false;
    };
  }, [courseId, principalId, repository]);

  const gamification =
    load.status === 'ready' && load.ownerId === principalId ? load.gamification : null;
  const summary = gamification?.summary ?? emptySummary(courseId);
  const level = useMemo(() => levelProgress(summary.xpTotal), [summary.xpTotal]);
  const earnedIds = new Set(gamification?.achievements.map(({ achievementId }) => achievementId));

  if (load.status === 'error' && load.ownerId === principalId) {
    return (
      <section className="gamification-panel gamification-panel--error">
        <Target aria-hidden size={24} />
        <div>
          <p className="eyebrow">Optional motivation</p>
          <h2>Gamification is temporarily unavailable</h2>
          <p>Your mastery and attempt evidence are unaffected.</p>
        </div>
      </section>
    );
  }

  if (!gamification && load.status !== 'ready') {
    return <section aria-label="Loading achievements" className="gamification-skeleton" />;
  }

  return (
    <section className="gamification-panel" aria-labelledby="gamification-title">
      <div className="gamification-level-card">
        <div className="gamification-level-badge">
          <Zap aria-hidden size={25} />
          <strong>{level.level}</strong>
        </div>
        <div>
          <p className="eyebrow">Personal level</p>
          <h2 id="gamification-title">Level {level.level}</h2>
          <p>
            {summary.xpTotal} total XP · {level.nextFloor - summary.xpTotal} until level{' '}
            {level.level + 1}
          </p>
        </div>
        <div
          aria-label="Level progress"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={level.percentage}
          className="gamification-level-progress"
          role="progressbar"
          style={{ '--level-progress': `${level.percentage}%` } as CSSProperties}
        >
          <span />
        </div>
        <small>
          {level.earnedThisLevel} / {level.requiredThisLevel} XP this level
        </small>
      </div>

      <div className="gamification-stats">
        <article>
          <Flame aria-hidden size={21} />
          <strong>{displayActiveStreak(summary)}</strong>
          <span>Current streak</span>
          <small>Best {summary.longestStreakDays} days</small>
        </article>
        <article>
          <Target aria-hidden size={21} />
          <strong>{Math.round(summary.accuracyPercentage)}%</strong>
          <span>Accuracy</span>
          <small>{summary.attemptCount} attempts</small>
        </article>
        <article>
          <Trophy aria-hidden size={21} />
          <strong>
            {earnedIds.size}/{achievementCatalog.length}
          </strong>
          <span>Achievements</span>
          <small>Personal milestones</small>
        </article>
      </div>

      <div className="achievement-collection">
        <div className="achievement-collection__heading">
          <div>
            <p className="eyebrow">Achievement collection</p>
            <h3>Milestones earned through practice</h3>
          </div>
          <span>
            <Sparkles aria-hidden size={15} /> Local learning rewards
          </span>
        </div>
        <div className="achievement-grid">
          {achievementCatalog.map((achievement) => {
            const earned = earnedIds.has(achievement.id);
            return (
              <article
                className={`achievement-card${earned ? ' achievement-card--earned' : ''}`}
                key={achievement.id}
              >
                <div>
                  {earned ? <Medal aria-hidden size={19} /> : <LockKeyhole aria-hidden size={17} />}
                </div>
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                <span>{earned ? 'Earned' : 'Locked'}</span>
              </article>
            );
          })}
        </div>
      </div>
      <p className="gamification-trust-note">
        XP is a personal motivation layer calculated from local learning evidence. It does not
        create trusted leaderboard standing.
      </p>
    </section>
  );
}
