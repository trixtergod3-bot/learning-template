import {
  Check,
  CheckCircle2,
  Clock3,
  Cloud,
  CloudOff,
  Gauge,
  RotateCcw,
  Settings2,
  Target,
  Trophy,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  drillAnswerLabel,
  evaluateDrillResponse,
  type DrillQuestion,
  type DrillResponse,
} from '@/engine/activities/drillEngine';
import type { CourseBundle } from '@/engine/content/courseBundle';
import type { Difficulty } from '@/engine/domain/activities';
import { activityId, type SessionId } from '@/engine/domain/identifiers';
import type { AttemptRecord, PracticeSession } from '@/engine/domain/sessions';
import type { LearningRepository } from '@/engine/ports/learningRepository';

interface DrillRunnerProps {
  bundle: CourseBundle;
  difficulty: Difficulty;
  principalId: string | null;
  questions: readonly DrillQuestion[];
  repository: LearningRepository | null;
  seed: string;
  sessionId: SessionId;
  startedAt: string;
  onExit(): void;
  onRetry(): void;
}

type SyncStatus = 'local' | 'saving' | 'synced' | 'error';
interface Outcome {
  correct: boolean;
  responseTimeMs: number;
}
interface FeedbackState {
  correct: boolean;
  outcomes: Outcome[];
}

const shortcutKeys = '1234567890abcdefghijklmnopqrstuvwxyz';

function formatSeconds(milliseconds: number) {
  return `${(milliseconds / 1000).toFixed(1)}s`;
}

export function DrillRunner({
  bundle,
  difficulty,
  principalId,
  questions,
  repository,
  seed,
  sessionId,
  startedAt,
  onExit,
  onRetry,
}: DrillRunnerProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [typedResponse, setTypedResponse] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtTimestamp = useMemo(() => new Date(startedAt).getTime(), [startedAt]);
  const questionStartedAt = useRef(startedAtTimestamp);
  const persistenceQueue = useRef(Promise.resolve());
  const advanceTimer = useRef<number | null>(null);
  const runnerRef = useRef<HTMLDivElement>(null);
  const canSync = Boolean(repository && principalId);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(canSync ? 'saving' : 'local');
  const currentQuestion = questions[questionIndex];

  const activeSession = useMemo<PracticeSession>(
    () => ({
      id: sessionId,
      courseId: bundle.course.id,
      activityId: activityId(`${bundle.course.id}.custom-drill.${difficulty}`),
      mode: 'drill',
      difficulty,
      status: 'active',
      contentVersion: bundle.course.version,
      seed,
      startedAt,
    }),
    [bundle.course.id, bundle.course.version, difficulty, seed, sessionId, startedAt],
  );

  const enqueuePersistence = useCallback(
    (operation: (learningRepository: LearningRepository, ownerId: string) => Promise<void>) => {
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
    const timer = window.setInterval(() => setElapsedMs(Date.now() - startedAtTimestamp), 250);
    return () => window.clearInterval(timer);
  }, [startedAtTimestamp]);

  useEffect(
    () => () => {
      if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    },
    [],
  );

  const advance = useCallback(
    (latestOutcomes: Outcome[]) => {
      if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;

      if (questionIndex === questions.length - 1) {
        const completedAt = new Date().toISOString();
        setOutcomes(latestOutcomes);
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

      questionStartedAt.current = Date.now();
      setQuestionIndex((index) => index + 1);
      setSelectedOptionIds([]);
      setTypedResponse('');
      setFeedback(null);
    },
    [activeSession, enqueuePersistence, questionIndex, questions.length],
  );

  const submitResponse = useCallback(
    (response: DrillResponse) => {
      if (!currentQuestion || feedback) return;
      const occurredAt = new Date();
      const result = evaluateDrillResponse(currentQuestion.item, response);
      const responseTimeMs = Math.max(0, occurredAt.getTime() - questionStartedAt.current);
      const latestOutcomes = [...outcomes, { correct: result.correct, responseTimeMs }];
      const nextStreak = result.correct ? currentStreak + 1 : 0;

      setOutcomes(latestOutcomes);
      setFeedback({ correct: result.correct, outcomes: latestOutcomes });
      setCurrentStreak(nextStreak);
      setBestStreak((streak) => Math.max(streak, nextStreak));

      if (repository && principalId) {
        const attempt: AttemptRecord = {
          eventId: crypto.randomUUID(),
          sessionId,
          principalId,
          itemRef: currentQuestion.itemRef,
          response,
          responseTimeMs,
          occurredAt: occurredAt.toISOString(),
          result,
          validation: 'local',
          skillEvidence: currentQuestion.item.skillIds.map((skillId) => ({ skillId, weight: 1 })),
        };
        enqueuePersistence((learningRepository) => learningRepository.appendAttempt(attempt));
      }

      advanceTimer.current = window.setTimeout(() => advance(latestOutcomes), 650);
    },
    [
      advance,
      currentQuestion,
      currentStreak,
      enqueuePersistence,
      feedback,
      outcomes,
      principalId,
      repository,
      sessionId,
    ],
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (feedback && event.key === 'Enter') {
      event.preventDefault();
      advance(feedback.outcomes);
      return;
    }
    if (!currentQuestion || feedback) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      if (currentQuestion.item.kind === 'multi-select' && selectedOptionIds.length > 0) {
        submitResponse(selectedOptionIds);
      } else if (
        (currentQuestion.item.kind === 'numeric-input' ||
          currentQuestion.item.kind === 'text-input') &&
        typedResponse.trim()
      ) {
        submitResponse(typedResponse);
      }
      return;
    }

    if (
      currentQuestion.item.kind === 'single-choice' ||
      currentQuestion.item.kind === 'multi-select'
    ) {
      const optionIndex = shortcutKeys.indexOf(event.key.toLowerCase());
      const option = currentQuestion.item.options[optionIndex];
      if (!option) return;
      event.preventDefault();
      if (currentQuestion.item.kind === 'single-choice') submitResponse(option.id);
      else
        setSelectedOptionIds((current) =>
          current.includes(option.id)
            ? current.filter((id) => id !== option.id)
            : [...current, option.id],
        );
    }
  };

  useEffect(() => {
    runnerRef.current?.focus();
  }, [feedback, questionIndex]);

  if (questions.length === 0 || !currentQuestion) throw new Error('The drill requires questions.');

  if (completed) {
    const correctCount = outcomes.filter(({ correct }) => correct).length;
    const accuracy = Math.round((correctCount / outcomes.length) * 100);
    const averageMs = Math.round(
      outcomes.reduce((sum, { responseTimeMs }) => sum + responseTimeMs, 0) / outcomes.length,
    );
    const promptsPerMinute =
      elapsedMs > 0 ? Math.round((outcomes.length / elapsedMs) * 60_000) : outcomes.length;

    return (
      <section className="drill-results" aria-labelledby="drill-results-title">
        <div className="drill-results__icon">
          <Trophy aria-hidden size={31} />
        </div>
        <p className="eyebrow">Speed round complete</p>
        <h1 id="drill-results-title">{accuracy}% accuracy</h1>
        <p>
          {correctCount} of {outcomes.length} prompts correct at {difficulty} difficulty.
        </p>
        <div className="drill-results__metrics">
          <div>
            <Target aria-hidden size={19} />
            <strong>{accuracy}%</strong>
            <span>Accuracy</span>
          </div>
          <div>
            <Gauge aria-hidden size={19} />
            <strong>{promptsPerMinute}</strong>
            <span>Per minute</span>
          </div>
          <div>
            <Clock3 aria-hidden size={19} />
            <strong>{formatSeconds(averageMs)}</strong>
            <span>Average</span>
          </div>
          <div>
            <Zap aria-hidden size={19} />
            <strong>{bestStreak}</strong>
            <span>Best streak</span>
          </div>
        </div>
        <DrillSyncNote status={syncStatus} />
        <div className="quiz-results__actions">
          <button className="button button--primary" onClick={onRetry} type="button">
            <RotateCcw aria-hidden size={18} /> Run another round
          </button>
          <button className="button button--secondary" onClick={onExit} type="button">
            <Settings2 aria-hidden size={18} /> Change settings
          </button>
        </div>
      </section>
    );
  }

  const item = currentQuestion.item;

  return (
    <div
      aria-label="Rapid drill"
      className="drill-runner"
      onKeyDown={handleKeyDown}
      ref={runnerRef}
      tabIndex={-1}
    >
      <header className="quiz-toolbar">
        <button className="quiz-exit" onClick={onExit} type="button">
          <X aria-hidden size={18} /> Exit
        </button>
        <div className="quiz-toolbar__progress">
          <span>
            Prompt {questionIndex + 1} of {questions.length}
          </span>
          <div aria-hidden className="quiz-progress-track">
            <div style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
        <div className="quiz-toolbar__stats">
          <span>
            <Zap aria-hidden size={16} /> {currentStreak}
          </span>
          <span>
            <Clock3 aria-hidden size={16} /> {formatSeconds(elapsedMs)}
          </span>
        </div>
      </header>

      <main
        className={`drill-card${feedback ? ` drill-card--${feedback.correct ? 'correct' : 'incorrect'}` : ''}`}
      >
        <div className="quiz-question-card__meta">
          <span>{difficulty}</span>
          <span>{item.kind.replaceAll('-', ' ')}</span>
        </div>
        <h1>{item.prompt}</h1>

        {item.kind === 'single-choice' || item.kind === 'multi-select' ? (
          <div className="drill-options">
            {item.options.map((option, index) => {
              const selected = selectedOptionIds.includes(option.id);
              return (
                <button
                  aria-pressed={selected}
                  className={`drill-option${selected ? ' drill-option--selected' : ''}`}
                  disabled={Boolean(feedback)}
                  key={option.id}
                  onClick={() =>
                    item.kind === 'single-choice'
                      ? submitResponse(option.id)
                      : setSelectedOptionIds((current) =>
                          current.includes(option.id)
                            ? current.filter((id) => id !== option.id)
                            : [...current, option.id],
                        )
                  }
                  type="button"
                >
                  <span>{shortcutKeys[index]}</span>
                  <strong>{option.label}</strong>
                  {selected ? <Check aria-hidden size={17} /> : null}
                </button>
              );
            })}
          </div>
        ) : (
          <label className="drill-input">
            <span>{item.kind === 'numeric-input' ? 'Type the number' : 'Type your answer'}</span>
            <input
              autoFocus
              disabled={Boolean(feedback)}
              inputMode={item.kind === 'numeric-input' ? 'decimal' : 'text'}
              onChange={(event) => setTypedResponse(event.target.value)}
              placeholder={item.kind === 'numeric-input' ? '0' : 'Your answer'}
              type="text"
              value={typedResponse}
            />
          </label>
        )}

        {item.kind === 'multi-select' && !feedback ? (
          <button
            className="button button--primary drill-submit"
            disabled={selectedOptionIds.length === 0}
            onClick={() => submitResponse(selectedOptionIds)}
            type="button"
          >
            Check selection
          </button>
        ) : null}
        {(item.kind === 'numeric-input' || item.kind === 'text-input') && !feedback ? (
          <button
            className="button button--primary drill-submit"
            disabled={!typedResponse.trim()}
            onClick={() => submitResponse(typedResponse)}
            type="button"
          >
            Submit answer
          </button>
        ) : null}

        {feedback ? (
          <section
            aria-live="assertive"
            className={`drill-feedback drill-feedback--${feedback.correct ? 'correct' : 'incorrect'}`}
          >
            <div>
              {feedback.correct ? (
                <CheckCircle2 aria-hidden size={22} />
              ) : (
                <XCircle aria-hidden size={22} />
              )}
              <strong>{feedback.correct ? 'Correct' : `Answer: ${drillAnswerLabel(item)}`}</strong>
            </div>
            <button onClick={() => advance(feedback.outcomes)} type="button">
              Next now
            </button>
          </section>
        ) : (
          <p className="drill-keyboard-note">
            Use the shown key or answer field. Enter submits typed and multi-select answers.
          </p>
        )}
      </main>
    </div>
  );
}

function DrillSyncNote({ status }: { status: SyncStatus }) {
  if (status === 'local')
    return (
      <p className="quiz-sync-note">
        <CloudOff aria-hidden size={16} /> Guest evidence stays in this round. Sign in to sync
        future drills.
      </p>
    );
  if (status === 'error')
    return (
      <p className="quiz-sync-note quiz-sync-note--error">
        <CloudOff aria-hidden size={16} /> Drill complete; cloud evidence could not sync.
      </p>
    );
  return (
    <p className="quiz-sync-note">
      <Cloud aria-hidden size={16} /> {status === 'saving' ? 'Saving evidence…' : 'Evidence synced'}
    </p>
  );
}
