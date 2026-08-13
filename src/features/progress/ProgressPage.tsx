import { Activity, Clock3, ShieldCheck, Target } from 'lucide-react';

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
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Progress"
        title="Measure learning at the skill level"
        description="Phase 1 defines the evidence model. Persistence and a clear V1 mastery calculation arrive after the dedicated Auth and database foundation."
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
            <Activity aria-hidden size={19} /> Persistence intentionally begins in Phase 2.
          </div>
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
