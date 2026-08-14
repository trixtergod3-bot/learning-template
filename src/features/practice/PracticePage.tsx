import { Check, CircleCheck, Gauge, LockKeyhole, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { defaultCourseBundle } from '@/app/courses';
import type { ActivityItem, Difficulty } from '@/engine/domain/activities';
import type { TopicId } from '@/engine/domain/identifiers';
import { PageHeader } from '@/ui/components/PageHeader';

const difficultyOptions: readonly {
  value: Difficulty;
  label: string;
  description: string;
}[] = [
  { value: 'easy', label: 'Easy', description: '6 choices' },
  { value: 'medium', label: 'Medium', description: '9 choices' },
  { value: 'hard', label: 'Hard', description: '12 choices' },
];

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
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<TopicId>>(
    () => new Set(bundle.topics.map(({ id }) => id)),
  );

  const selectedItems = useMemo(() => {
    const activities = bundle.activities.filter(
      (activity) =>
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

  const previewItem = selectedItems[0];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${bundle.course.title} · Practice`}
        title={`Build your ${bundle.course.title} practice set`}
        description="Choose the knowledge you want to retrieve and how much challenge you want. The generic quiz runner arrives in Phase 5."
      />

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
        </section>

        <aside className="practice-preview" aria-labelledby="practice-preview-title">
          <div className="practice-preview__glow" aria-hidden="true" />
          <p className="eyebrow">Practice preview</p>
          <h2 id="practice-preview-title">{selectedItems.length} questions ready</h2>
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
          <button className="button button--primary button--locked" disabled type="button">
            <LockKeyhole aria-hidden size={17} /> Quiz runner arrives in Phase 5
          </button>
          <p className="practice-preview__note">
            <Sparkles aria-hidden size={16} /> Content and choices are already deterministic and
            validated. Phase 5 adds scoring, feedback, streaks, and results.
          </p>
        </aside>
      </div>
    </div>
  );
}
