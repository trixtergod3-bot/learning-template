import { ArrowRight, BookOpenCheck, BrainCircuit, LibraryBig, Route, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  defaultCourseBundle,
  defaultCourseConfiguration,
  enabledCourseBundles,
} from '@/app/courses';
import { courseConfigurations } from '@/app/registries';

const learningStages = [
  { label: 'Learn', description: 'Build a clear mental model.', icon: BookOpenCheck },
  { label: 'Practice', description: 'Retrieve with focused activities.', icon: BrainCircuit },
  { label: 'Review', description: 'Use feedback to target weak concepts.', icon: Sparkles },
  { label: 'Master', description: 'Let evidence guide what comes next.', icon: Route },
];

function getPromptCount(itemPrompts: readonly string[]) {
  return new Set(itemPrompts).size;
}

export function HomePage() {
  const defaultCourse = defaultCourseBundle.course;

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--cosmic">
        <div className="cosmic-stars" aria-hidden="true" />
        <div className="hero-panel__copy">
          <p className="eyebrow">One multi-course learning platform</p>
          <h1>One place to learn deeply, practice deliberately, and master more.</h1>
          <p>
            Start with {defaultCourse.title} today. The same account, engine, and progress model
            will carry every new subject we add.
          </p>
          <div className="button-row">
            <Link className="button button--primary" to="/learn">
              Explore {defaultCourse.title} <ArrowRight aria-hidden size={18} />
            </Link>
            <Link className="button button--secondary" to="/practice">
              Build a practice set
            </Link>
          </div>
        </div>

        <div className="course-orbit" aria-label={`${defaultCourse.title} course preview`}>
          <span className="course-orbit__halo" aria-hidden="true" />
          <div className="course-orbit__core">
            <span className="course-orbit__symbol" aria-hidden="true">
              {defaultCourseConfiguration.presentation.symbol}
            </span>
            <span>First course</span>
            <strong>{defaultCourse.title}</strong>
          </div>
          {defaultCourseConfiguration.presentation.highlights.map((highlight, index) => (
            <span
              className={`course-orbit__label course-orbit__label--${index + 1}`}
              key={highlight}
            >
              {highlight}
            </span>
          ))}
        </div>
      </section>

      <section aria-labelledby="course-library-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Course library</p>
            <h2 id="course-library-title">Choose what you want to learn</h2>
          </div>
          <p>
            Every course plugs into one neutral engine while keeping its own knowledge, skills, and
            visual character.
          </p>
        </div>

        <div className="course-library-grid">
          {enabledCourseBundles.map((bundle) => {
            const promptCount = getPromptCount(bundle.items.map(({ prompt }) => prompt));
            const configuration = courseConfigurations.get(bundle.course.id);
            const difficultyCount = new Set(
              bundle.items.flatMap(({ difficulty }) => (difficulty ? [difficulty] : [])),
            ).size;

            if (!configuration) {
              throw new Error(`Course is missing its configuration: ${bundle.course.id}`);
            }

            return (
              <article
                className="course-library-card course-library-card--featured"
                key={bundle.course.id}
              >
                <div className="course-library-card__symbol" aria-hidden="true">
                  {configuration.presentation.symbol}
                </div>
                <div className="badge-row">
                  <span className="badge">Available now</span>
                  <span className="badge badge--muted">{configuration.presentation.badge}</span>
                </div>
                <h3>{bundle.course.title}</h3>
                <p>{bundle.course.summary}</p>
                <dl className="course-library-card__metrics">
                  <div>
                    <dt>Topics</dt>
                    <dd>{bundle.topics.length}</dd>
                  </div>
                  <div>
                    <dt>Questions</dt>
                    <dd>{promptCount}</dd>
                  </div>
                  <div>
                    <dt>Levels</dt>
                    <dd>{difficultyCount}</dd>
                  </div>
                </dl>
                <Link className="text-link" to="/learn">
                  Open course <ArrowRight aria-hidden size={17} />
                </Link>
              </article>
            );
          })}

          <article className="course-library-card course-library-card--future">
            <div className="course-library-card__symbol" aria-hidden="true">
              <LibraryBig size={26} />
            </div>
            <p className="eyebrow">Shared engine</p>
            <h3>More subjects, no rebuild</h3>
            <p>
              The next validation courses will test generated drills and a third knowledge domain.
              Both will use this same course library and account.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="learning-path-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Learning philosophy</p>
            <h2 id="learning-path-title">A path built for durable knowledge</h2>
          </div>
          <p>Course knowledge changes. The learning loop stays dependable.</p>
        </div>
        <div className="stage-grid">
          {learningStages.map(({ label, description, icon: Icon }, index) => (
            <article className="stage-card" key={label}>
              <span className="stage-card__number">0{index + 1}</span>
              <Icon aria-hidden size={24} />
              <h3>{label}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
