import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Cloud,
  CloudOff,
  RotateCcw,
  Settings2,
  Trophy,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CourseBundle } from '@/engine/content/courseBundle';
import type { Difficulty } from '@/engine/domain/activities';
import { activityId, type SessionId } from '@/engine/domain/identifiers';
import type { AttemptRecord, PracticeSession } from '@/engine/domain/sessions';
import type { LearningRepository } from '@/engine/ports/learningRepository';
import {
  buildQuizQuestions,
  correctOptionIds,
  evaluateChoiceAnswer,
} from '@/engine/activities/quizEngine';

interface QuizRunnerProps {
  bundle: CourseBundle;
  difficulty: Difficulty;
  items: CourseBundle['items'];
  principalId: string | null;
  questionCount: number;
  repository: LearningRepository | null;
  seed: string;
  sessionId: SessionId;
  startedAt: string;
  onExit(): void;
  onRetry(): void;
}

type SyncStatus = 'local' | 'saving' | 'synced' | 'error';

const shortcutKeys = '1234567890abcdefghijklmnopqrstuvwxyz';

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function QuizRunner({
  bundle,
  difficulty,
  items,
  principalId,
  questionCount,
  repository,
  seed,
  sessionId,
  startedAt,
  onExit,
  onRetry,
}: QuizRunnerProps) {
  const questions = useMemo(
    () => buildQuizQuestions(items, questionCount, seed),
    [items, questionCount, seed],
  );
  const startedAtTimestamp = useMemo(() => new Date(startedAt).getTime(), [startedAt]);
  const questionStartedAt = useRef(startedAtTimestamp);
  const runnerRef = useRef<HTMLDivElement>(null);
  const persistenceQueue = useRef(Promise.resolve());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<ReturnType<typeof evaluateChoiceAnswer> | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const canSync = Boolean(repository && principalId);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(canSync ? 'saving' : 'local');
  const currentQuestion = questions[questionIndex];

  const activeSession = useMemo<PracticeSession>(
    () => ({
      id: sessionId,
      courseId: bundle.course.id,
      activityId: activityId(`${bundle.course.id}.custom-quiz.${difficulty}`),
      mode: 'quiz',
      difficulty,
      status: 'active',
      contentVersion: bundle.course.version,
      seed,
      startedAt,
    }),
    [bundle.course.id, bundle.course.version, difficulty, seed, sessionId, startedAt],
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
    const timer = window.setInterval(() => setElapsedMs(Date.now() - startedAtTimestamp), 500);
    return () => window.clearInterval(timer);
  }, [startedAtTimestamp]);

  useEffect(() => {
    runnerRef.current?.focus();
  }, [feedback, questionIndex]);

  const toggleOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion || feedback) return;

      if (currentQuestion.kind === 'single-choice') {
        setSelectedOptionIds([optionId]);
        return;
      }

      setSelectedOptionIds((current) =>
        current.includes(optionId)
          ? current.filter((selectedId) => selectedId !== optionId)
          : [...current, optionId],
      );
    },
    [currentQuestion, feedback],
  );

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || feedback || selectedOptionIds.length === 0) return;

    const result = evaluateChoiceAnswer(currentQuestion, selectedOptionIds);
    const nextStreak = result.correct ? currentStreak + 1 : 0;
    const occurredAt = new Date();

    setFeedback(result);
    setCorrectCount((count) => count + (result.correct ? 1 : 0));
    setCurrentStreak(nextStreak);
    setBestStreak((streak) => Math.max(streak, nextStreak));

    if (repository && principalId) {
      const attempt: AttemptRecord = {
        eventId: crypto.randomUUID(),
        sessionId,
        principalId,
        itemRef: {
          itemId: currentQuestion.id,
          contentVersion: currentQuestion.version,
        },
        response: selectedOptionIds,
        responseTimeMs: Math.max(0, occurredAt.getTime() - questionStartedAt.current),
        occurredAt: occurredAt.toISOString(),
        result,
        validation: 'local',
        skillEvidence: currentQuestion.skillIds.map((skillId) => ({ skillId, weight: 1 })),
      };

      enqueuePersistence((learningRepository) => learningRepository.appendAttempt(attempt));
    }
  }, [
    currentQuestion,
    currentStreak,
    enqueuePersistence,
    feedback,
    principalId,
    repository,
    selectedOptionIds,
    sessionId,
  ]);

  const advance = useCallback(() => {
    if (!feedback) return;

    if (questionIndex === questions.length - 1) {
      const completedAt = new Date().toISOString();
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
    setFeedback(null);
  }, [activeSession, enqueuePersistence, feedback, questionIndex, questions.length]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (feedback) advance();
      else submitAnswer();
      return;
    }

    const shortcutIndex = shortcutKeys.indexOf(event.key.toLowerCase());
    const option = currentQuestion?.options[shortcutIndex];

    if (shortcutIndex >= 0 && option) {
      event.preventDefault();
      toggleOption(option.id);
    }
  };

  if (!currentQuestion) throw new Error('The quiz did not produce a current question.');

  if (completed) {
    const percentage = Math.round((correctCount / questions.length) * 100);

    return (
      <section className="quiz-results" aria-labelledby="quiz-results-title">
        <div className="quiz-results__icon">
          <Trophy aria-hidden size={32} />
        </div>
        <p className="eyebrow">Practice complete</p>
        <h1 id="quiz-results-title">{percentage}% correct</h1>
        <p>
          You answered {correctCount} of {questions.length} questions correctly on {difficulty}{' '}
          difficulty.
        </p>
        <div className="quiz-results__metrics">
          <div>
            <strong>{correctCount}</strong>
            <span>Correct</span>
          </div>
          <div>
            <strong>{bestStreak}</strong>
            <span>Best streak</span>
          </div>
          <div>
            <strong>{formatDuration(elapsedMs)}</strong>
            <span>Elapsed</span>
          </div>
        </div>
        <SyncNote status={syncStatus} />
        <div className="quiz-results__actions">
          <button className="button button--primary" onClick={onRetry} type="button">
            <RotateCcw aria-hidden size={18} /> Practice another set
          </button>
          <button className="button button--secondary" onClick={onExit} type="button">
            <Settings2 aria-hidden size={18} /> Change settings
          </button>
        </div>
      </section>
    );
  }

  const expectedIds = new Set(correctOptionIds(currentQuestion));
  const correctLabels = currentQuestion.options
    .filter(({ id }) => expectedIds.has(id))
    .map(({ label }) => label)
    .join(', ');

  return (
    <div
      aria-label="Quiz runner"
      className="quiz-runner"
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
            Question {questionIndex + 1} of {questions.length}
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
            <Clock3 aria-hidden size={16} /> {formatDuration(elapsedMs)}
          </span>
        </div>
      </header>

      <main className="quiz-question-card">
        <div className="quiz-question-card__meta">
          <span>{difficulty}</span>
          <span>
            {currentQuestion.kind === 'multi-select' ? 'Select all that apply' : 'Choose one'}
          </span>
        </div>
        <h1>{currentQuestion.prompt}</h1>

        <div className="quiz-options">
          {currentQuestion.options.map((option, optionIndex) => {
            const selected = selectedOptionIds.includes(option.id);
            const isExpected = expectedIds.has(option.id);
            const answerClass = feedback
              ? isExpected
                ? ' quiz-option--correct'
                : selected
                  ? ' quiz-option--incorrect'
                  : ''
              : '';

            return (
              <button
                aria-pressed={selected}
                className={`quiz-option${selected ? ' quiz-option--selected' : ''}${answerClass}`}
                disabled={Boolean(feedback)}
                key={option.id}
                onClick={() => toggleOption(option.id)}
                type="button"
              >
                <span className="quiz-option__shortcut">{shortcutKeys[optionIndex]}</span>
                <strong>{option.label}</strong>
                {feedback && isExpected ? <Check aria-hidden size={19} /> : null}
                {feedback && selected && !isExpected ? <X aria-hidden size={19} /> : null}
              </button>
            );
          })}
        </div>

        {feedback ? (
          <section
            aria-live="polite"
            className={`quiz-feedback quiz-feedback--${feedback.correct ? 'correct' : 'incorrect'}`}
          >
            <div className="quiz-feedback__title">
              {feedback.correct ? (
                <CheckCircle2 aria-hidden size={22} />
              ) : (
                <XCircle aria-hidden size={22} />
              )}
              <strong>{feedback.correct ? 'Correct' : 'Not quite'}</strong>
            </div>
            {!feedback.correct ? <p>The correct answer is {correctLabels}.</p> : null}
            {feedback.feedback ? <p>{feedback.feedback}</p> : null}
          </section>
        ) : null}

        <div className="quiz-question-card__actions">
          <p>Keyboard: choose with the shown key, then press Enter.</p>
          {feedback ? (
            <button className="button button--primary" onClick={advance} type="button">
              {questionIndex === questions.length - 1 ? 'See results' : 'Next question'}
              <ArrowRight aria-hidden size={18} />
            </button>
          ) : (
            <button
              className="button button--primary"
              disabled={selectedOptionIds.length === 0}
              onClick={submitAnswer}
              type="button"
            >
              Check answer <ArrowRight aria-hidden size={18} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function SyncNote({ status }: { status: SyncStatus }) {
  if (status === 'local') {
    return (
      <p className="quiz-sync-note">
        <CloudOff aria-hidden size={16} /> Guest result stays in this practice run. Sign in to sync
        future evidence.
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="quiz-sync-note quiz-sync-note--error">
        <CloudOff aria-hidden size={16} /> The quiz completed, but cloud evidence could not sync.
      </p>
    );
  }

  return (
    <p className="quiz-sync-note">
      <Cloud aria-hidden size={16} /> {status === 'saving' ? 'Saving evidence…' : 'Evidence synced'}
    </p>
  );
}
