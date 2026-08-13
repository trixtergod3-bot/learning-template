import { Braces, CheckCircle2, Gauge, Layers2, RefreshCw } from 'lucide-react';

import { foundationLabCourse } from '@/courses/fixtures/foundationLab/foundationLabCourse';
import { generatorRegistry } from '@/app/registries';
import { PageHeader } from '@/ui/components/PageHeader';

export function PracticePage() {
  const staticActivity = foundationLabCourse.activities.find(
    ({ source }) => source.kind === 'static',
  );
  const generatedActivity = foundationLabCourse.activities.find(
    ({ source }) => source.kind === 'generated',
  );

  if (!staticActivity || !generatedActivity || generatedActivity.source.kind !== 'generated') {
    throw new Error('The fixture must include static and generated activities.');
  }

  const generatedPreview = generatorRegistry.generate(generatedActivity.source, {
    seed: 'phase-one-preview',
    sequence: 0,
    difficulty: 'easy',
    locale: 'en',
  });

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Practice"
        title="One activity system, two content sources"
        description="Static knowledge and deterministic generators resolve to the same validated item contract. Full practice workflows arrive in their dedicated phases."
      />

      <div className="activity-grid">
        <article className="activity-card">
          <div className="activity-card__icon activity-card__icon--violet" aria-hidden="true">
            <Layers2 size={24} />
          </div>
          <div className="badge-row">
            <span className="badge">Quiz</span>
            <span className="badge badge--muted">Static</span>
          </div>
          <h2>{staticActivity.title}</h2>
          <p>Curated, versioned items with stable IDs, explanations, and explicit skill links.</p>
          <ul className="feature-list">
            <li>
              <CheckCircle2 aria-hidden size={17} /> Runtime-validated references
            </li>
            <li>
              <CheckCircle2 aria-hidden size={17} /> Single and multi-answer capable
            </li>
          </ul>
        </article>

        <article className="activity-card">
          <div className="activity-card__icon activity-card__icon--blue" aria-hidden="true">
            <Braces size={24} />
          </div>
          <div className="badge-row">
            <span className="badge">Drill</span>
            <span className="badge badge--muted">Generated</span>
          </div>
          <h2>{generatedActivity.title}</h2>
          <p>
            Pure generators use a recorded seed, sequence, and version so every prompt can be
            replayed.
          </p>
          <div className="generated-preview">
            <span>Deterministic preview</span>
            <strong>{generatedPreview.prompt}</strong>
          </div>
        </article>
      </div>

      <section className="boundary-panel" aria-labelledby="boundary-title">
        <div>
          <p className="eyebrow">Engine boundary</p>
          <h2 id="boundary-title">Mode, item kind, and source stay independent</h2>
        </div>
        <div className="boundary-grid">
          <div>
            <Gauge aria-hidden size={20} />
            <strong>Mode</strong>
            <span>Quiz · Drill · Flashcards</span>
          </div>
          <div>
            <RefreshCw aria-hidden size={20} />
            <strong>Item kind</strong>
            <span>Choice · Multi-select · Numeric · Text · Card</span>
          </div>
          <div>
            <Braces aria-hidden size={20} />
            <strong>Source</strong>
            <span>Static · Generated</span>
          </div>
        </div>
      </section>
    </div>
  );
}
