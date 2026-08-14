import {
  ArrowRight,
  BookOpenCheck,
  BookOpenText,
  ChevronLeft,
  CircleCheckBig,
  Layers3,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { defaultCourseBundle } from '@/app/courses';
import type { CourseBundle } from '@/engine/content/courseBundle';
import type { Lesson } from '@/engine/domain/hierarchy';
import { ContentBlockRenderer } from '@/ui/components/ContentBlockRenderer';
import { PageHeader } from '@/ui/components/PageHeader';

function CourseOutline({ activeLesson, bundle }: { activeLesson?: Lesson; bundle: CourseBundle }) {
  const module = bundle.modules[0];

  if (!module) throw new Error(`Course has no module: ${bundle.course.id}`);

  const moduleTopics = bundle.topics.filter(({ moduleId }) => moduleId === module.id);

  return (
    <aside className="course-outline" aria-label="Course outline">
      <Link className="course-outline__course" to="/learn">
        <span className="eyebrow">{bundle.course.title}</span>
        <strong>{module.title}</strong>
      </Link>
      <ol>
        {moduleTopics.map((topic, index) => {
          const lesson = bundle.lessons.find(({ id }) => topic.lessonIds.includes(id));

          if (!lesson) return null;

          const isActive = lesson.id === activeLesson?.id;

          return (
            <li className={isActive ? 'course-outline__active' : undefined} key={lesson.id}>
              <Link aria-current={isActive ? 'page' : undefined} to={`/learn/${lesson.id}`}>
                <span>Lesson {index + 1}</span>
                <strong>{topic.title}</strong>
                <small>{lesson.title}</small>
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="course-outline__note">
        <BookOpenText aria-hidden size={18} />
        <span>{bundle.lessons.length} connected lessons with practice after every topic.</span>
      </div>
    </aside>
  );
}

function LessonView({ bundle, lesson }: { bundle: CourseBundle; lesson: Lesson }) {
  const lessonIndex = bundle.lessons.findIndex(({ id }) => id === lesson.id);
  const topic = bundle.topics.find(({ id }) => id === lesson.topicId);
  const skill = bundle.skills.find(({ id }) => topic?.skillIds.includes(id));
  const previousLesson = lessonIndex > 0 ? bundle.lessons[lessonIndex - 1] : undefined;
  const nextLesson =
    lessonIndex < bundle.lessons.length - 1 ? bundle.lessons[lessonIndex + 1] : undefined;

  if (!topic) throw new Error(`Lesson has no topic: ${lesson.id}`);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${bundle.course.title} · Lesson ${lessonIndex + 1} of ${bundle.lessons.length}`}
        title={lesson.title}
        description={topic.summary}
      />

      <div className="learning-layout">
        <CourseOutline activeLesson={lesson} bundle={bundle} />

        <article className="lesson-card">
          <div className="lesson-card__icon">
            <BookOpenCheck aria-hidden size={23} />
          </div>
          <ContentBlockRenderer blocks={lesson.blocks} />

          {skill ? (
            <div className="lesson-skill">
              <CircleCheckBig aria-hidden size={17} />
              <span>
                This lesson prepares you to <strong>{skill.title.toLowerCase()}</strong>.
              </span>
            </div>
          ) : null}

          <nav className="lesson-navigation" aria-label="Lesson navigation">
            {previousLesson ? (
              <Link className="button button--secondary" to={`/learn/${previousLesson.id}`}>
                <ChevronLeft aria-hidden size={18} /> Previous
              </Link>
            ) : (
              <Link className="button button--secondary" to="/learn">
                <ChevronLeft aria-hidden size={18} /> Course map
              </Link>
            )}
            {nextLesson ? (
              <Link className="button button--primary" to={`/learn/${nextLesson.id}`}>
                Next lesson <ArrowRight aria-hidden size={18} />
              </Link>
            ) : (
              <Link className="button button--primary" to={`/practice?topic=${topic.id}`}>
                Practice this topic <ArrowRight aria-hidden size={18} />
              </Link>
            )}
          </nav>
        </article>
      </div>
    </div>
  );
}

function CourseCatalog({ bundle }: { bundle: CourseBundle }) {
  const module = bundle.modules[0];

  if (!module) throw new Error(`Course has no module: ${bundle.course.id}`);

  const moduleTopics = bundle.topics.filter(({ moduleId }) => moduleId === module.id);
  const firstLesson = bundle.lessons[0];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${bundle.course.title} · Learn`}
        title={module.title}
        description={module.summary}
      />

      <div className="learning-layout learning-layout--catalog">
        <CourseOutline bundle={bundle} />

        <section className="topic-catalog" aria-labelledby="topic-catalog-title">
          <div className="topic-catalog__intro">
            <div>
              <p className="eyebrow">Course map</p>
              <h2 id="topic-catalog-title">Explore {module.title}</h2>
            </div>
            <p>
              Read each short lesson, then retrieve the same knowledge through connected practice.
              Every topic maps to one measurable skill.
            </p>
          </div>

          <div className="topic-grid">
            {moduleTopics.map((topic, index) => {
              const lesson = bundle.lessons.find(({ id }) => topic.lessonIds.includes(id));
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
                    <span>1 lesson</span>
                    <span>{promptCount} prompts</span>
                  </div>
                  {skill ? (
                    <div className="topic-card__skill">
                      <CircleCheckBig aria-hidden size={16} /> {skill.title}
                    </div>
                  ) : null}
                  {lesson ? (
                    <Link className="topic-card__link" to={`/learn/${lesson.id}`}>
                      Open lesson <ArrowRight aria-hidden size={16} />
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="course-next-step">
            <div>
              <p className="eyebrow">Start with the pattern</p>
              <h2>Build the map before testing recall</h2>
            </div>
            {firstLesson ? (
              <Link className="button button--primary" to={`/learn/${firstLesson.id}`}>
                Start lesson 1 <ArrowRight aria-hidden size={18} />
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export function LearnPage() {
  const { lessonId } = useParams();
  const bundle = defaultCourseBundle;

  if (!lessonId) return <CourseCatalog bundle={bundle} />;

  const lesson = bundle.lessons.find(({ id }) => id === lessonId);

  if (!lesson) {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow={`${bundle.course.title} · Learn`}
          title="Lesson not found"
          description="This lesson is not part of the current course version. Return to the course map to continue."
        />
        <Link className="button button--primary button--fit" to="/learn">
          View course map <ArrowRight aria-hidden size={18} />
        </Link>
      </div>
    );
  }

  return <LessonView bundle={bundle} lesson={lesson} />;
}
