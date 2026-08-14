import { BookOpenText, CircleCheckBig } from 'lucide-react';

import { foundationLabCourse } from '@/courses/fixtures/foundationLab/foundationLabCourse';
import { ContentBlockRenderer } from '@/ui/components/ContentBlockRenderer';
import { PageHeader } from '@/ui/components/PageHeader';

export function LearnPage() {
  const module = foundationLabCourse.modules[0];
  const topic = foundationLabCourse.topics[0];
  const lesson = foundationLabCourse.lessons[0];

  if (!module || !topic || !lesson) {
    throw new Error('The foundation fixture must include a module, topic, and lesson.');
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Learn"
        title="Structured content, not a wall of quiz questions"
        description="Courses can express modules, topics, lessons, reusable blocks, and linked skills while the engine stays neutral."
      />

      <div className="learning-layout">
        <aside className="course-outline" aria-label="Course outline">
          <p className="eyebrow">{foundationLabCourse.course.title}</p>
          <ol>
            <li className="course-outline__active">
              <span>Module 1</span>
              <strong>{module.title}</strong>
              <small>{topic.title}</small>
            </li>
          </ol>
        </aside>

        <article className="lesson-card">
          <div className="lesson-card__icon" aria-hidden="true">
            <BookOpenText size={24} />
          </div>
          <p className="eyebrow">Lesson · 3 min</p>
          <h2>{lesson.title}</h2>
          <ContentBlockRenderer blocks={lesson.blocks} />
          <div className="lesson-skill">
            <CircleCheckBig aria-hidden size={20} />
            <span>
              Linked skill: <strong>{foundationLabCourse.skills[0]?.title}</strong>
            </span>
          </div>
        </article>
      </div>
    </div>
  );
}
