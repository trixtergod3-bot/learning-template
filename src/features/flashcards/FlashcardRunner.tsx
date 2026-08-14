import {
  ArrowRight,
  Cloud,
  CloudOff,
  Layers3,
  RotateCcw,
  Settings2,
  Sparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  buildFlashcardDeck,
  flashcardRatingResult,
  scheduleFlashcardReview,
  type FlashcardRating,
} from '@/engine/activities/flashcardEngine';
import type { CourseBundle } from '@/engine/content/courseBundle';
import { activityId, type SessionId } from '@/engine/domain/identifiers';
import type { AttemptRecord, PracticeSession } from '@/engine/domain/sessions';
import type { LearningRepository } from '@/engine/ports/learningRepository';
import { ContentBlockRenderer } from '@/ui/components/ContentBlockRenderer';

interface FlashcardRunnerProps {
  bundle: CourseBundle;
  cardCount: number;
  items: CourseBundle['items'];
  principalId: string | null;
  repository: LearningRepository | null;
  seed: string;
  sessionId: SessionId;
  startedAt: string;
  onExit(): void;
  onRetry(): void;
}

type SyncStatus = 'local' | 'saving' | 'synced' | 'error';
type RatingCounts = Record<FlashcardRating, number>;

const ratings: readonly { rating: FlashcardRating; label: string; detail: string }[] = [
  { rating: 'again', label: 'Again', detail: 'Soon' },
  { rating: 'hard', label: 'Hard', detail: 'Later' },
  { rating: 'good', label: 'Good', detail: 'Graduate' },
  { rating: 'easy', label: 'Easy', detail: 'Graduate' },
];

export function FlashcardRunner({
  bundle,
  cardCount,
  items,
  principalId,
  repository,
  seed,
  sessionId,
  startedAt,
  onExit,
  onRetry,
}: FlashcardRunnerProps) {
  const initialCards = useMemo(
    () => buildFlashcardDeck(items, cardCount, seed),
    [cardCount, items, seed],
  );
  const [queue, setQueue] = useState(initialCards);
  const [revealed, setRevealed] = useState(false);
  const [graduatedIds, setGraduatedIds] = useState<Set<string>>(() => new Set());
  const [ratingCounts, setRatingCounts] = useState<RatingCounts>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [reviewCount, setReviewCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const persistenceQueue = useRef(Promise.resolve());
  const cardStartedAt = useRef(new Date(startedAt).getTime());
  const runnerRef = useRef<HTMLDivElement>(null);
  const canSync = Boolean(repository && principalId);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(canSync ? 'saving' : 'local');
  const currentCard = queue[0];

  const activeSession = useMemo<PracticeSession>(
    () => ({
      id: sessionId,
      courseId: bundle.course.id,
      activityId: activityId(`${bundle.course.id}.custom-flashcards`),
      mode: 'flashcards',
      status: 'active',
      contentVersion: bundle.course.version,
      seed,
      startedAt,
    }),
    [bundle.course.id, bundle.course.version, seed, sessionId, startedAt],
  );

  const enqueuePersistence = useCallback(
    (operation: (repository: LearningRepository, principalId: string) => Promise<void>) => {
      if (!repository || !principalId) return;
      setSyncStatus('saving');
      persistenceQueue.current = persistenceQueue.current
        .then(() => operation(repository, principalId))
        .then(() => setSyncStatus('synced'))
        .catch(() => setSyncStatus('error'));
    },
    [principalId, repository],
  );

  useEffect(() => {
    if (!repository || !principalId) return;

    let active = true;
    persistenceQueue.current = persistenceQueue.current
      .then(() => repository.saveSession(principalId, activeSession))
      .then(() => {
        if (active) setSyncStatus('synced');
      })
      .catch(() => {
        if (active) setSyncStatus('error');
      });

    return () => {
      active = false;
    };
  }, [activeSession, principalId, repository]);

  useEffect(() => {
    runnerRef.current?.focus();
  }, [revealed, reviewCount]);

  const rateCard = useCallback(
    (rating: FlashcardRating) => {
      if (!revealed || !currentCard) return;

      const occurredAt = new Date();
      const result = flashcardRatingResult(rating);
      const nextQueue = scheduleFlashcardReview(queue.slice(1), currentCard, rating);
      const nextReviewCount = reviewCount + 1;

      setRatingCounts((counts) => ({ ...counts, [rating]: counts[rating] + 1 }));
      setReviewCount(nextReviewCount);

      if (rating === 'good' || rating === 'easy') {
        setGraduatedIds((ids) => new Set([...ids, currentCard.id]));
      }

      if (repository && principalId) {
        const attempt: AttemptRecord = {
          eventId: crypto.randomUUID(),
          sessionId,
          principalId,
          itemRef: { itemId: currentCard.id, contentVersion: currentCard.version },
          response: { rating },
          responseTimeMs: Math.max(0, occurredAt.getTime() - cardStartedAt.current),
          occurredAt: occurredAt.toISOString(),
          result,
          validation: 'local',
          skillEvidence: currentCard.skillIds.map((skillId) => ({ skillId, weight: 1 })),
        };
        enqueuePersistence((learningRepository) => learningRepository.appendAttempt(attempt));
      }

      if (nextQueue.length === 0) {
        const completedAt = occurredAt.toISOString();
        setCompleted(true);
        enqueuePersistence((learningRepository, ownerId) =>
          learningRepository.saveSession(ownerId, {
            ...activeSession,
            status: 'completed',
            completedAt,
          }),
        );
        return;
      }

      cardStartedAt.current = Date.now();
      setQueue(nextQueue);
      setRevealed(false);
    },
    [
      activeSession,
      currentCard,
      enqueuePersistence,
      principalId,
      queue,
      repository,
      revealed,
      reviewCount,
      sessionId,
    ],
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!revealed && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault();
      setRevealed(true);
      return;
    }

    if (revealed && ['1', '2', '3', '4'].includes(event.key)) {
      event.preventDefault();
      const rating = ratings[Number(event.key) - 1]?.rating;
      if (rating) rateCard(rating);
    }
  };

  if (completed) {
    return (
      <section className="flashcard-results" aria-labelledby="flashcard-results-title">
        <div className="flashcard-results__icon">
          <Sparkles aria-hidden size={31} />
        </div>
        <p className="eyebrow">Deck complete</p>
        <h1 id="flashcard-results-title">{initialCards.length} cards reviewed</h1>
        <p>{reviewCount} total reviews, including cards that returned for another look.</p>
        <div className="flashcard-results__ratings">
          {ratings.map(({ rating, label }) => (
            <div key={rating}>
              <strong>{ratingCounts[rating]}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <FlashcardSyncNote status={syncStatus} />
        <div className="quiz-results__actions">
          <button className="button button--primary" onClick={onRetry} type="button">
            <RotateCcw aria-hidden size={18} /> Review another deck
          </button>
          <button className="button button--secondary" onClick={onExit} type="button">
            <Settings2 aria-hidden size={18} /> Change settings
          </button>
        </div>
      </section>
    );
  }

  if (!currentCard) throw new Error('The flashcard deck did not produce a current card.');

  return (
    <div
      aria-label="Flashcard review"
      className="flashcard-runner"
      onKeyDown={handleKeyDown}
      ref={runnerRef}
      tabIndex={-1}
    >
      <header className="flashcard-toolbar">
        <button className="quiz-exit" onClick={onExit} type="button">
          <X aria-hidden size={18} /> Exit
        </button>
        <div>
          <span>
            {graduatedIds.size} of {initialCards.length} graduated
          </span>
          <div aria-hidden className="quiz-progress-track">
            <div style={{ width: `${(graduatedIds.size / initialCards.length) * 100}%` }} />
          </div>
        </div>
        <span className="flashcard-toolbar__remaining">{queue.length} in queue</span>
      </header>

      <article className={`flashcard-card${revealed ? ' flashcard-card--revealed' : ''}`}>
        <div className="flashcard-card__label">
          <Layers3 aria-hidden size={17} /> {revealed ? 'Answer' : 'Prompt'}
        </div>
        <ContentBlockRenderer blocks={revealed ? currentCard.back : currentCard.front} />
        {!revealed ? (
          <button
            className="button button--primary flashcard-reveal"
            onClick={() => setRevealed(true)}
            type="button"
          >
            Reveal answer <ArrowRight aria-hidden size={18} />
          </button>
        ) : null}
      </article>

      {revealed ? (
        <section className="flashcard-ratings" aria-label="Rate your recall">
          <p>How well did you recall it?</p>
          <div>
            {ratings.map(({ rating, label, detail }, index) => (
              <button
                aria-label={`${label} — ${detail}`}
                className={`flashcard-rating flashcard-rating--${rating}`}
                key={rating}
                onClick={() => rateCard(rating)}
                type="button"
              >
                <span>{index + 1}</span>
                <strong>{label}</strong>
                <small>{detail}</small>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <p className="flashcard-keyboard-note">Press Space or Enter to reveal the answer.</p>
      )}
    </div>
  );
}

function FlashcardSyncNote({ status }: { status: SyncStatus }) {
  if (status === 'local') {
    return (
      <p className="quiz-sync-note">
        <CloudOff aria-hidden size={16} /> Guest review stays in this session. Sign in to sync
        future evidence.
      </p>
    );
  }
  if (status === 'error') {
    return (
      <p className="quiz-sync-note quiz-sync-note--error">
        <CloudOff aria-hidden size={16} /> Review complete; cloud evidence could not sync.
      </p>
    );
  }
  return (
    <p className="quiz-sync-note">
      <Cloud aria-hidden size={16} /> {status === 'saving' ? 'Saving evidence…' : 'Evidence synced'}
    </p>
  );
}
