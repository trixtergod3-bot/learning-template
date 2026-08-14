import { Activity, Clock3, ShieldCheck, Target } from 'lucide-react';

import { defaultCourseBundle } from '@/app/courses';
import { PageHeader } from '@/ui/components/PageHeader';

const evidenceCards = [
  {
    icon: Target,
    title: 'Skill evidence',
    description: 'Every attempt can contribute explicit weighted evidence to one or more skills.',
  },
  {
    icon: Clock3,
    title: 'Response telemetry',
    description: 'Session and item timing are modeled without assuming arithmetic operators.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust level',
    description: 'Local learning evidence stays distinct from future trusted competitive results.',
  },
];

export function ProgressPage() {
  const bundle = defaultCourseBundle;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${bundle.course.title} · Progress`}
        title="Eight skills, one connected course map"
        description="The secure evidence store is ready. Phase 8 will calculate mastery from real quiz, flashcard, and drill attempts rather than awarding progress manually."
      />

      <section className="mastery-preview" aria-label="Mastery model preview">
        <div className="mastery-preview__visual">
          <div className="mastery-ring">
            <span>—</span>
            <small>No evidence yet</small>
          </div>
        </div>
        <div>
          <p className="eyebrow">Mastery projection</p>
          <h2>Progress is derived, not manually awarded</h2>
          <p>
            Immutable attempts remain the source of truth. Accuracy, recency, evidence count, and
            response speed can then be recalculated without losing learning history.
          </p>
          <div className="status-note">
            <Activity aria-hidden size={19} /> Attempt persistence is ready for the activity
            runners.
          </div>
        </div>
      </section>

      <section aria-labelledby="course-skills-title">
        <div className="section-heading section-heading--compact">
          <div>
            <p className="eyebrow">Course skill map</p>
            <h2 id="course-skills-title">What your activity will measure</h2>
          </div>
          <p>Each question in {bundle.course.title} points to one of these stable skill IDs.</p>
        </div>
        <div className="skill-preview-grid">
          {bundle.skills.map((skill) => (
            <article className="skill-preview-card" key={skill.id}>
              <Target aria-hidden size={18} />
              <div>
                <h3>{skill.title}</h3>
                <p>{skill.description}</p>
              </div>
              <span>Awaiting evidence</span>
            </article>
          ))}
        </div>
      </section>

      <div className="evidence-grid">
        {evidenceCards.map(({ icon: Icon, title, description }) => (
          <article className="evidence-card" key={title}>
            <Icon aria-hidden size={22} />
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
