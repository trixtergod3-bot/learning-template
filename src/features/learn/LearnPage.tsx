import { ArrowRight, BookOpenText, CircleCheckBig, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { defaultCourseBundle } from '@/app/courses';
import { PageHeader } from '@/ui/components/PageHeader';

export function LearnPage() {
  const bundle = defaultCourseBundle;
  const module = bundle.modules[0];

  if (!module) throw new Error(`Course has no module: ${bundle.course.id}`);

  const moduleTopics = bundle.topics.filter(({ moduleId }) => moduleId === module.id);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${bundle.course.title} · Learn`}
        title={module.title}
        description={module.summary}
      />

      <div className="learning-layout learning-layout--catalog">
        <aside className="course-outline" aria-label="Course outline">
          <p className="eyebrow">{bundle.course.title}</p>
          <ol>
            <li className="course-outline__active">
              <span>Module 1</span>
              <strong>{module.title}</strong>
              <small>{moduleTopics.length} connected topics</small>
            </li>
          </ol>
          <div className="course-outline__note">
            <BookOpenText aria-hidden size={18} />
            <span>Structured lessons arrive in Phase 4.</span>
          </div>
        </aside>

        <section className="topic-catalog" aria-labelledby="topic-catalog-title">
          <div className="topic-catalog__intro">
            <div>
              <p className="eyebrow">Course map</p>
              <h2 id="topic-catalog-title">Explore {module.title}</h2>
            </div>
            <p>
              Each topic owns stable activities and one measurable skill. Lessons, quizzes, and
              later flashcards all connect to this same map.
            </p>
          </div>

          <div className="topic-grid">
            {moduleTopics.map((topic, index) => {
              const skill = bundle.skills.find(({ id }) => topic.skillIds.includes(id));
              const promptCount = new Set(
                bundle.items
                  .filter((item) => item.skillIds.some((id) => topic.skillIds.includes(id)))
                  .map(({ prompt }) => prompt),
              ).size;

              return (
                <article className="topic-card" key={topic.id}>
                  <div className="topic-card__number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <Layers3 aria-hidden size={21} />
                  <h3>{topic.title}</h3>
                  <p>{topic.summary}</p>
                  <div className="topic-card__meta">
                    <span>{promptCount} prompts</span>
                    <span>3 difficulties</span>
                  </div>
                  {skill ? (
                    <div className="topic-card__skill">
                      <CircleCheckBig aria-hidden size={16} /> {skill.title}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="course-next-step">
            <div>
              <p className="eyebrow">Ready to retrieve?</p>
              <h2>Turn this map into a focused practice set</h2>
            </div>
            <Link className="button button--primary" to="/practice">
              Configure practice <ArrowRight aria-hidden size={18} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
