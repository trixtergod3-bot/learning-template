import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  Brain,
  CircleAlert,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { defaultCourseBundle } from '@/app/courses';
import { appConfiguration } from '@/app/config/appConfig';
import { useApplicationServices } from '@/app/useApplicationServices';
import { buildCourseProgress, type MasteryStatus } from '@/engine/progress/mastery';
import type { SkillMastery } from '@/engine/domain/sessions';
import { useAuthentication } from '@/features/auth/useAuthentication';
import { GamificationPanel } from '@/features/gamification/GamificationPanel';
import { PageHeader } from '@/ui/components/PageHeader';

type MasteryLoad =
  | { status: 'idle' }
  | { status: 'ready'; ownerId: string; records: readonly SkillMastery[] }
  | { status: 'error'; ownerId: string; message: string };

const statusLabels: Record<MasteryStatus, string> = {
  'not-started': 'Not started',
  building: 'Building',
  developing: 'Developing',
  strong: 'Strong',
};

export function ProgressPage() {
  const bundle = defaultCourseBundle;
  const { learningRepository } = useApplicationServices();
  const { status: authenticationStatus, user } = useAuthentication();
  const [masteryLoad, setMasteryLoad] = useState<MasteryLoad>({ status: 'idle' });

  useEffect(() => {
    let active = true;

    if (!user || !learningRepository) return;

    void learningRepository
      .listCourseMastery(user.id, bundle.course.id)
      .then((records) => {
        if (active) setMasteryLoad({ status: 'ready', ownerId: user.id, records });
      })
      .catch((error: unknown) => {
        if (active) {
          setMasteryLoad({
            status: 'error',
            ownerId: user.id,
            message: error instanceof Error ? error.message : 'Progress could not be loaded.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [bundle.course.id, learningRepository, user]);

  const progress = useMemo(() => {
    const records =
      masteryLoad.status === 'ready' && masteryLoad.ownerId === user?.id ? masteryLoad.records : [];
    return buildCourseProgress(bundle, records);
  }, [bundle, masteryLoad, user?.id]);

  const loadMatchesUser = masteryLoad.status !== 'idle' && masteryLoad.ownerId === user?.id;

  if (authenticationStatus === 'loading' || (user && !loadMatchesUser)) {
    return <ProgressLoading />;
  }

  if (!user) return <GuestProgress />;

  if (masteryLoad.status === 'error' && masteryLoad.ownerId === user.id) {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow={`${bundle.course.title} · Progress`}
          title="Your progress is temporarily unavailable"
          description="Your immutable attempt history is safe. This page could not read the current mastery projection."
        />
        <section className="progress-state-card progress-state-card--error">
          <CircleAlert aria-hidden size={26} />
          <h2>Could not load mastery</h2>
          <p>{masteryLoad.message}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${bundle.course.title} · Progress`}
        title="A clear map of what you know—and what to practice next"
        description="Every score comes from immutable quiz, flashcard, and drill evidence. Practice more to increase both accuracy and confidence."
      />

      <section className="progress-overview" aria-label="Course mastery overview">
        <div
          className="mastery-ring mastery-ring--active"
          style={{ '--mastery-angle': `${progress.masteryScore * 3.6}deg` } as CSSProperties}
        >
          <span>{progress.masteryScore}%</span>
          <small>Course mastery</small>
        </div>
        <div className="progress-overview__copy">
          <p className="eyebrow">Mastery projection</p>
          <h2>
            {progress.evidenceCount === 0
              ? 'Your first practice set will start the map'
              : 'Your evidence is becoming a learning plan'}
          </h2>
          <p>
            Mastery combines weighted accuracy with confidence that grows across the first five
            pieces of evidence. Unpracticed skills remain visible at zero, so the course score never
            hides gaps.
          </p>
          <div className="progress-summary-metrics">
            <div>
              <strong>{progress.evidenceCount}</strong>
              <span>Evidence events</span>
            </div>
            <div>
              <strong>
                {progress.practicedSkills}/{bundle.skills.length}
              </strong>
              <span>Skills practiced</span>
            </div>
            <div>
              <strong>{progress.strongSkills}</strong>
              <span>Strong skills</span>
            </div>
          </div>
        </div>
      </section>

      {appConfiguration.features.achievements && learningRepository ? (
        <GamificationPanel
          courseId={bundle.course.id}
          principalId={user.id}
          repository={learningRepository}
        />
      ) : null}

      <section aria-labelledby="practice-next-title">
        <div className="section-heading section-heading--compact">
          <div>
            <p className="eyebrow">Recommended next</p>
            <h2 id="practice-next-title">Strengthen the weakest links</h2>
          </div>
          <p>Recommendations prioritize unpracticed and lower-mastery skills.</p>
        </div>
        <div className="practice-next-grid">
          {progress.suggestedSkills.map(({ mastery, skill, status, topicId }, index) => (
            <article className="practice-next-card" key={skill.id}>
              <span className="practice-next-card__rank">0{index + 1}</span>
              <div>
                <small>
                  {statusLabels[status]} · {Math.round(mastery.masteryScore)}%
                </small>
                <h3>{skill.title}</h3>
                <p>
                  {mastery.evidenceCount === 0
                    ? 'Start collecting evidence for this skill.'
                    : `${mastery.evidenceCount} evidence events recorded.`}
                </p>
              </div>
              <Link to={`/practice/drill${topicId ? `?topic=${topicId}` : ''}`}>
                Practice now <ArrowRight aria-hidden size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="course-skills-title">
        <div className="section-heading section-heading--compact">
          <div>
            <p className="eyebrow">Course skill map</p>
            <h2 id="course-skills-title">Mastery by concept</h2>
          </div>
          <p>Scores remain understandable, recalculable, and separate from competitive trust.</p>
        </div>
        <div className="mastery-skill-grid">
          {progress.skills.map(({ lessonId, mastery, skill, status, topicId }) => (
            <article className={`mastery-skill-card mastery-skill-card--${status}`} key={skill.id}>
              <div className="mastery-skill-card__heading">
                <Target aria-hidden size={18} />
                <span>{statusLabels[status]}</span>
              </div>
              <h3>{skill.title}</h3>
              <p>{skill.description}</p>
              <div
                aria-label={`${skill.title} mastery`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={Math.round(mastery.masteryScore)}
                className="mastery-bar"
                role="progressbar"
              >
                <span style={{ width: `${mastery.masteryScore}%` }} />
              </div>
              <div className="mastery-skill-card__meta">
                <strong>{Math.round(mastery.masteryScore)}%</strong>
                <span>{mastery.evidenceCount} evidence</span>
              </div>
              <div className="mastery-skill-card__actions">
                <Link to={`/learn/${lessonId ?? ''}`}>
                  <BookOpenCheck aria-hidden size={15} /> Review
                </Link>
                <Link to={`/practice?topic=${topicId ?? ''}`}>
                  <Brain aria-hidden size={15} /> Quiz
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mastery-explainer" aria-labelledby="mastery-explainer-title">
        <ShieldCheck aria-hidden size={25} />
        <div>
          <p className="eyebrow">How the number works</p>
          <h2 id="mastery-explainer-title">Accuracy × confidence, versioned as mastery-v1</h2>
          <p>
            Correctness and partial flashcard scores are weighted by their skill evidence.
            Confidence rises from 64% after one event to 100% after five. The projection is rebuilt
            by the database after each valid attempt; the browser can read it but cannot write it.
          </p>
        </div>
      </section>
    </div>
  );
}

function ProgressLoading() {
  return (
    <section className="progress-state-card" aria-label="Loading progress">
      <LoaderCircle aria-hidden className="spin" size={30} />
      <h1>Building your mastery map…</h1>
    </section>
  );
}

function GuestProgress() {
  const bundle = defaultCourseBundle;
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${bundle.course.title} · Progress`}
        title="Practice freely. Sign in when you want the map to remember."
        description="Guest quizzes, flashcards, and drills work immediately. A private account connects those attempts into a cross-device mastery map."
      />
      <section className="progress-guest-card">
        <div className="progress-guest-card__icon">
          <Sparkles aria-hidden size={28} />
        </div>
        <div>
          <p className="eyebrow">Private by default</p>
          <h2>Your progress belongs to your account</h2>
          <p>
            Sign in to sync immutable evidence and see skill-by-skill recommendations. No public
            profile or leaderboard is required.
          </p>
        </div>
        <div className="progress-guest-card__actions">
          <Link className="button button--primary" to="/profile">
            Sign in to track progress
          </Link>
          <Link className="button button--secondary" to="/practice">
            Keep practicing as guest
          </Link>
        </div>
      </section>
      <div className="evidence-grid">
        <article className="evidence-card">
          <Activity aria-hidden size={22} />
          <h2>Attempt evidence</h2>
          <p>Quiz, flashcard, and drill results feed one shared learning history.</p>
        </article>
        <article className="evidence-card">
          <Target aria-hidden size={22} />
          <h2>Skill mastery</h2>
          <p>Every item points to stable course skills, so progress stays specific.</p>
        </article>
        <article className="evidence-card">
          <ShieldCheck aria-hidden size={22} />
          <h2>Read-only projection</h2>
          <p>The database calculates mastery; the browser cannot award it directly.</p>
        </article>
      </div>
    </div>
  );
}
