import { ArrowRight, BookOpenCheck, BrainCircuit, Layers3, Route } from 'lucide-react';
import { Link } from 'react-router-dom';

import { foundationLabCourse } from '@/courses/fixtures/foundationLab/foundationLabCourse';

const learningStages = [
  { label: 'Learn', description: 'Build a clear mental model.', icon: BookOpenCheck },
  { label: 'Understand', description: 'Connect ideas and examples.', icon: Layers3 },
  { label: 'Practice', description: 'Retrieve with focused activities.', icon: BrainCircuit },
  { label: 'Master', description: 'Use evidence to choose what comes next.', icon: Route },
];

export function HomePage() {
  const course = foundationLabCourse.course;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <p className="eyebrow">Universal learning engine</p>
          <h1>Learn deeply. Practice deliberately. Master anything.</h1>
          <p>
            LearningTemplate gives lessons, quizzes, drills, flashcards, and progress one clean,
            extensible home—without binding the engine to a subject.
          </p>
          <div className="button-row">
            <Link className="button button--primary" to="/learn">
              Explore the fixture course <ArrowRight aria-hidden size={18} />
            </Link>
            <Link className="button button--secondary" to="/practice">
              See activity sources
            </Link>
          </div>
        </div>

        <div className="orbit-card" aria-label="Learning loop preview">
          <div className="orbit-card__core">
            <span>One engine</span>
            <strong>Many subjects</strong>
          </div>
          <span className="orbit-card__label orbit-card__label--one">Lessons</span>
          <span className="orbit-card__label orbit-card__label--two">Practice</span>
          <span className="orbit-card__label orbit-card__label--three">Mastery</span>
        </div>
      </section>

      <section aria-labelledby="learning-path-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Learning philosophy</p>
            <h2 id="learning-path-title">A path built for durable knowledge</h2>
          </div>
          <p>
            Each stage is generic enough for facts, concepts, languages, or generated mathematics.
          </p>
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

      <section className="course-highlight" aria-labelledby="course-highlight-title">
        <div>
          <p className="eyebrow">Registered course</p>
          <h2 id="course-highlight-title">{course.title}</h2>
          <p>{course.summary}</p>
        </div>
        <dl className="metric-row">
          <div>
            <dt>Modules</dt>
            <dd>{foundationLabCourse.modules.length}</dd>
          </div>
          <div>
            <dt>Activity modes</dt>
            <dd>3</dd>
          </div>
          <div>
            <dt>Sources</dt>
            <dd>Static + generated</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
