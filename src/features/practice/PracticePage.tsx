import { Check, CircleCheck, Gauge, Play, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useApplicationServices } from '@/app/useApplicationServices';
import { defaultCourseBundle } from '@/app/courses';
import type { ActivityItem, Difficulty } from '@/engine/domain/activities';
import { sessionId, type SessionId, type TopicId } from '@/engine/domain/identifiers';
import { useAuthentication } from '@/features/auth/useAuthentication';
import { PageHeader } from '@/ui/components/PageHeader';

import { QuizRunner } from './QuizRunner';

const difficultyOptions: readonly {
  value: Difficulty;
  label: string;
  description: string;
}[] = [
  { value: 'easy', label: 'Easy', description: '6 choices' },
  { value: 'medium', label: 'Medium', description: '9 choices' },
  { value: 'hard', label: 'Hard', description: '12 choices' },
];

const questionCountOptions = [5, 10, 20] as const;

interface ActiveQuiz {
  difficulty: Difficulty;
  items: ActivityItem[];
  questionCount: number;
  seed: string;
  sessionId: SessionId;
  startedAt: string;
}

function getStaticItems(itemIds: readonly string[]) {
  const itemIdSet = new Set(itemIds);
  return defaultCourseBundle.items.filter(({ id }) => itemIdSet.has(id));
}

function optionCount(item: ActivityItem | undefined) {
  if (!item || !('options' in item)) return 0;
  return item.options.length;
}

export function PracticePage() {
  const bundle = defaultCourseBundle;
  const [searchParams] = useSearchParams();
  const { learningRepository } = useApplicationServices();
  const { user } = useAuthentication();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<TopicId>>(() => {
    const requestedTopic = searchParams.get('topic');
    const matchingTopic = bundle.topics.find(({ id }) => id === requestedTopic);
    return new Set(matchingTopic ? [matchingTopic.id] : bundle.topics.map(({ id }) => id));
  });
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);

  const selectedItems = useMemo(() => {
    const activities = bundle.activities.filter(
      (activity) =>
        activity.mode === 'quiz' &&
        activity.difficulty === difficulty &&
        bundle.topics.some(
          (topic) => selectedTopicIds.has(topic.id) && topic.activityIds.includes(activity.id),
        ),
    );

    return activities.flatMap((activity) =>
      activity.source.kind === 'static' ? getStaticItems(activity.source.itemIds) : [],
    );
  }, [bundle, difficulty, selectedTopicIds]);

  const toggleTopic = (id: TopicId) => {
    setSelectedTopicIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        if (next.size === 1) return current;
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const startQuiz = () => {
    setActiveQuiz({
      difficulty,
      items: selectedItems,
      questionCount: Math.min(questionCount, selectedItems.length),
      seed: crypto.randomUUID(),
      sessionId: sessionId(crypto.randomUUID()),
      startedAt: new Date().toISOString(),
    });
  };

  if (activeQuiz) {
    return (
      <QuizRunner
        bundle={bundle}
        difficulty={activeQuiz.difficulty}
        items={activeQuiz.items}
        onExit={() => setActiveQuiz(null)}
        onRetry={startQuiz}
        principalId={user?.id ?? null}
        questionCount={activeQuiz.questionCount}
        repository={learningRepository}
        seed={activeQuiz.seed}
        sessionId={activeQuiz.sessionId}
        startedAt={activeQuiz.startedAt}
      />
    );
  }

  const previewItem = selectedItems[0];
  const runQuestionCount = Math.min(questionCount, selectedItems.length);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${bundle.course.title} · Practice`}
        title={`Build your ${bundle.course.title} practice set`}
        description="Choose what to retrieve, set the challenge, and get immediate explanations after every answer."
      />

      <nav className="practice-mode-switcher" aria-label="Practice mode">
        <Link aria-current="page" className="practice-mode-switcher__active" to="/practice">
          Quiz
        </Link>
        <Link to="/practice/flashcards">Flashcards</Link>
        <Link to="/practice/drill">Rapid drill</Link>
      </nav>

      <div className="practice-builder">
        <section className="practice-builder__controls" aria-labelledby="topic-selector-title">
          <div className="control-heading">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2 id="topic-selector-title">Question types</h2>
            </div>
            <span>
              {selectedTopicIds.size} of {bundle.topics.length} selected
            </span>
          </div>
          <div className="topic-selector">
            {bundle.topics.map((topic) => {
              const selected = selectedTopicIds.has(topic.id);

              return (
                <button
                  aria-pressed={selected}
                  className={`topic-selector__button${selected ? ' topic-selector__button--selected' : ''}`}
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  type="button"
                >
                  {selected ? <Check aria-hidden size={15} /> : null}
                  {topic.title}
                </button>
              );
            })}
          </div>

          <div className="control-heading control-heading--difficulty">
            <div>
              <p className="eyebrow">Step 2</p>
              <h2>Difficulty</h2>
            </div>
          </div>
          <div className="difficulty-selector">
            {difficultyOptions.map((option) => (
              <button
                aria-pressed={difficulty === option.value}
                className={`difficulty-card difficulty-card--${option.value}${difficulty === option.value ? ' difficulty-card--selected' : ''}`}
                key={option.value}
                onClick={() => setDifficulty(option.value)}
                type="button"
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>

          <div className="control-heading control-heading--difficulty">
            <div>
              <p className="eyebrow">Step 3</p>
              <h2>Set length</h2>
            </div>
          </div>
          <div className="question-count-selector">
            {questionCountOptions.map((count) => (
              <button
                aria-pressed={questionCount === count}
                className={questionCount === count ? 'question-count--selected' : undefined}
                key={count}
                onClick={() => setQuestionCount(count)}
                type="button"
              >
                {count} questions
              </button>
            ))}
          </div>
        </section>

        <aside className="practice-preview" aria-labelledby="practice-preview-title">
          <div className="practice-preview__glow" aria-hidden="true" />
          <p className="eyebrow">Practice preview</p>
          <h2 id="practice-preview-title">{selectedItems.length} questions available</h2>
          <div className="practice-preview__stats">
            <div>
              <Gauge aria-hidden size={18} />
              <span>{difficulty}</span>
            </div>
            <div>
              <CircleCheck aria-hidden size={18} />
              <span>{optionCount(previewItem)} choices each</span>
            </div>
          </div>
          {previewItem ? (
            <div className="question-preview">
              <span>Sample prompt</span>
              <strong>{previewItem.prompt}</strong>
            </div>
          ) : null}
          <button
            className="button button--primary practice-start"
            disabled={runQuestionCount === 0}
            onClick={startQuiz}
            type="button"
          >
            <Play aria-hidden size={17} /> Start {runQuestionCount}-question quiz
          </button>
          <p className="practice-preview__note">
            <Sparkles aria-hidden size={16} /> Guest practice works immediately. Sign in when you
            want your attempt evidence synced securely across devices.
          </p>
        </aside>
      </div>
    </div>
  );
}
