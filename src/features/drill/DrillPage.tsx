import { Check, Gauge, Play, TimerReset, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { defaultCourseBundle } from '@/app/courses';
import { useApplicationServices } from '@/app/useApplicationServices';
import { buildStaticDrill, type DrillQuestion } from '@/engine/activities/drillEngine';
import type { Difficulty } from '@/engine/domain/activities';
import { sessionId, type SessionId, type TopicId } from '@/engine/domain/identifiers';
import { useAuthentication } from '@/features/auth/useAuthentication';
import { PageHeader } from '@/ui/components/PageHeader';

import { DrillRunner } from './DrillRunner';

const difficultyOptions: readonly { value: Difficulty; label: string; detail: string }[] = [
  { value: 'easy', label: 'Easy', detail: '6 choices' },
  { value: 'medium', label: 'Medium', detail: '9 choices' },
  { value: 'hard', label: 'Hard', detail: '12 choices' },
];
const roundSizeOptions = [10, 20, 40] as const;

interface ActiveRound {
  difficulty: Difficulty;
  questions: DrillQuestion[];
  seed: string;
  sessionId: SessionId;
  startedAt: string;
}

export function DrillPage() {
  const bundle = defaultCourseBundle;
  const [searchParams] = useSearchParams();
  const { learningRepository } = useApplicationServices();
  const { user } = useAuthentication();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [roundSize, setRoundSize] = useState(20);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<TopicId>>(() => {
    const requestedTopic = searchParams.get('topic');
    const matchingTopic = bundle.topics.find(({ id }) => id === requestedTopic);
    return new Set(matchingTopic ? [matchingTopic.id] : bundle.topics.map(({ id }) => id));
  });
  const [activeRound, setActiveRound] = useState<ActiveRound | null>(null);

  const selectedItems = useMemo(() => {
    const itemIds = new Set(
      bundle.activities
        .filter(
          (activity) =>
            activity.mode === 'drill' &&
            activity.difficulty === difficulty &&
            bundle.topics.some(
              (topic) => selectedTopicIds.has(topic.id) && topic.activityIds.includes(activity.id),
            ),
        )
        .flatMap((activity) => (activity.source.kind === 'static' ? activity.source.itemIds : [])),
    );

    return bundle.items.filter(({ id, kind }) => kind !== 'flashcard' && itemIds.has(id));
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

  const startRound = () => {
    const seed = crypto.randomUUID();
    setActiveRound({
      difficulty,
      questions: buildStaticDrill(selectedItems, Math.min(roundSize, selectedItems.length), seed),
      seed,
      sessionId: sessionId(crypto.randomUUID()),
      startedAt: new Date().toISOString(),
    });
  };

  if (activeRound) {
    return (
      <DrillRunner
        bundle={bundle}
        difficulty={activeRound.difficulty}
        onExit={() => setActiveRound(null)}
        onRetry={startRound}
        principalId={user?.id ?? null}
        questions={activeRound.questions}
        repository={learningRepository}
        seed={activeRound.seed}
        sessionId={activeRound.sessionId}
        startedAt={activeRound.startedAt}
      />
    );
  }

  const runSize = Math.min(roundSize, selectedItems.length);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${bundle.course.title} · Rapid drill`}
        title="Turn recognition into fluent recall"
        description="Move quickly, get a brief correction, and see exactly how accuracy and response speed change across the round."
      />

      <nav className="practice-mode-switcher" aria-label="Practice mode">
        <Link to="/practice">Quiz</Link>
        <Link to="/practice/flashcards">Flashcards</Link>
        <Link aria-current="page" className="practice-mode-switcher__active" to="/practice/drill">
          Rapid drill
        </Link>
      </nav>

      <div className="drill-builder">
        <section className="practice-builder__controls" aria-labelledby="drill-topic-title">
          <div className="control-heading">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2 id="drill-topic-title">Skills to mix</h2>
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
              <h2>Recognition challenge</h2>
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
                <span>{option.detail}</span>
              </button>
            ))}
          </div>

          <div className="control-heading control-heading--difficulty">
            <div>
              <p className="eyebrow">Step 3</p>
              <h2>Round length</h2>
            </div>
          </div>
          <div className="question-count-selector">
            {roundSizeOptions.map((size) => (
              <button
                aria-pressed={roundSize === size}
                className={roundSize === size ? 'question-count--selected' : undefined}
                key={size}
                onClick={() => setRoundSize(size)}
                type="button"
              >
                {size} prompts
              </button>
            ))}
          </div>
        </section>

        <aside className="drill-preview" aria-labelledby="drill-preview-title">
          <div className="drill-preview__icon">
            <Zap aria-hidden size={26} />
          </div>
          <p className="eyebrow">Speed round</p>
          <h2 id="drill-preview-title">{selectedItems.length} prompts available</h2>
          <div className="drill-preview__metrics">
            <span>
              <Gauge aria-hidden size={16} /> {difficulty}
            </span>
            <span>
              <TimerReset aria-hidden size={16} /> response telemetry
            </span>
          </div>
          <p>
            Answers advance automatically after a short correction. Your result includes accuracy,
            pace, average response time, and best streak.
          </p>
          <button
            className="button button--primary"
            disabled={runSize === 0}
            onClick={startRound}
            type="button"
          >
            <Play aria-hidden size={17} /> Start {runSize}-prompt drill
          </button>
        </aside>
      </div>
    </div>
  );
}
