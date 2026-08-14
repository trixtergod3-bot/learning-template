import { ArrowRight, Brain, Check, Layers3, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { defaultCourseBundle } from '@/app/courses';
import { useApplicationServices } from '@/app/useApplicationServices';
import type { ActivityItem } from '@/engine/domain/activities';
import { sessionId, type SessionId, type TopicId } from '@/engine/domain/identifiers';
import { useAuthentication } from '@/features/auth/useAuthentication';
import { PageHeader } from '@/ui/components/PageHeader';

import { FlashcardRunner } from './FlashcardRunner';

const deckSizeOptions = [5, 10, 20] as const;

interface ActiveDeck {
  cardCount: number;
  items: ActivityItem[];
  seed: string;
  sessionId: SessionId;
  startedAt: string;
}

export function FlashcardPage() {
  const bundle = defaultCourseBundle;
  const [searchParams] = useSearchParams();
  const { learningRepository } = useApplicationServices();
  const { user } = useAuthentication();
  const [deckSize, setDeckSize] = useState(10);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<TopicId>>(() => {
    const requestedTopic = searchParams.get('topic');
    const matchingTopic = bundle.topics.find(({ id }) => id === requestedTopic);
    return new Set(matchingTopic ? [matchingTopic.id] : bundle.topics.map(({ id }) => id));
  });
  const [activeDeck, setActiveDeck] = useState<ActiveDeck | null>(null);

  const selectedCards = useMemo(() => {
    const itemIds = new Set(
      bundle.activities
        .filter(
          (activity) =>
            activity.mode === 'flashcards' &&
            bundle.topics.some(
              (topic) => selectedTopicIds.has(topic.id) && topic.activityIds.includes(activity.id),
            ),
        )
        .flatMap((activity) => (activity.source.kind === 'static' ? activity.source.itemIds : [])),
    );

    return bundle.items.filter(({ id, kind }) => kind === 'flashcard' && itemIds.has(id));
  }, [bundle, selectedTopicIds]);

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

  const startDeck = () => {
    setActiveDeck({
      cardCount: Math.min(deckSize, selectedCards.length),
      items: selectedCards,
      seed: crypto.randomUUID(),
      sessionId: sessionId(crypto.randomUUID()),
      startedAt: new Date().toISOString(),
    });
  };

  if (activeDeck) {
    return (
      <FlashcardRunner
        bundle={bundle}
        cardCount={activeDeck.cardCount}
        items={activeDeck.items}
        onExit={() => setActiveDeck(null)}
        onRetry={startDeck}
        principalId={user?.id ?? null}
        repository={learningRepository}
        seed={activeDeck.seed}
        sessionId={activeDeck.sessionId}
        startedAt={activeDeck.startedAt}
      />
    );
  }

  const runCardCount = Math.min(deckSize, selectedCards.length);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${bundle.course.title} · Flashcards`}
        title="Strengthen recall, one card at a time"
        description="Reveal the answer before rating your recall. Weak cards return later in the same session; strong cards graduate."
      />

      <nav className="practice-mode-switcher" aria-label="Practice mode">
        <Link to="/practice">Quiz</Link>
        <Link
          aria-current="page"
          className="practice-mode-switcher__active"
          to="/practice/flashcards"
        >
          Flashcards
        </Link>
      </nav>

      <div className="flashcard-builder">
        <section className="practice-builder__controls" aria-labelledby="flashcard-topic-title">
          <div className="control-heading">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2 id="flashcard-topic-title">Topics to review</h2>
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
              <h2>Deck size</h2>
            </div>
          </div>
          <div className="question-count-selector">
            {deckSizeOptions.map((size) => (
              <button
                aria-pressed={deckSize === size}
                className={deckSize === size ? 'question-count--selected' : undefined}
                key={size}
                onClick={() => setDeckSize(size)}
                type="button"
              >
                {size} cards
              </button>
            ))}
          </div>
        </section>

        <aside className="flashcard-preview" aria-labelledby="flashcard-preview-title">
          <div className="flashcard-preview__icon">
            <Layers3 aria-hidden size={26} />
          </div>
          <p className="eyebrow">Review deck</p>
          <h2 id="flashcard-preview-title">{selectedCards.length} cards available</h2>
          <p>
            Start with {runCardCount} cards. Choose Again or Hard to see a card once more before the
            session ends.
          </p>
          <button className="button button--primary" onClick={startDeck} type="button">
            <Play aria-hidden size={17} /> Review {runCardCount} cards
          </button>
          <Link className="flashcard-preview__quiz-link" to="/practice">
            <Brain aria-hidden size={16} /> Prefer a scored quiz?{' '}
            <ArrowRight aria-hidden size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
