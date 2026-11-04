import React, { lazy, Suspense, useEffect } from 'react';
import { useStudyStore } from './useStudyStore';
import { useMuscleStore } from '../store/useMuscleStore';
import { getQueueProgress } from './studyQueue';
import type { StudyQuestion } from './types';

const TrainingCanvas = lazy(() => import('../components/canvas/TrainingCanvas'));
const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

export default function Study3DQuestion({ question }: { question: StudyQuestion }) {
  const submitAnswer = useStudyStore((s) => s.submitAnswer);
  const nextQuestion = useStudyStore((s) => s.nextQuestion);
  const feedback = useStudyStore((s) => s.feedback);
  const activeQueue = useStudyStore((s) => s.activeQueue);
  const resetCameraView = useMuscleStore((s) => s.resetCameraView);
  const randomizeOrder = useStudyStore((s) => s.randomizeOrder);
  const toggleRandomizeOrder = useStudyStore((s) => s.toggleRandomizeOrder);

  useEffect(() => {
    useMuscleStore.getState().setStudyActive(true);
    useStudyStore.getState().syncCanvasForQuestion(question);
  }, [question]);

  const progress = getQueueProgress(activeQueue);
  const isAnswered = Boolean(feedback?.answered);

  return (
    <div className="muscle-study-3d-layout">
      {/* 3D Model Viewport */}
      <div className="muscle-study-3d-viewport">
        <Suspense
          fallback={
            <div className="muscle-canvas-loading" role="status" aria-live="polite">
              Loading 3D anatomy model…
            </div>
          }
        >
          <TrainingCanvas />
        </Suspense>

        {/* Viewport Hint & Reset Controls */}
        <div className="muscle-study-viewport-controls">
          <button
            type="button"
            className="muscle-study-reset-cam-btn"
            onClick={resetCameraView}
            title="Reset to optimal camera angle"
          >
            ⟲ Reset View
          </button>
          <span className="muscle-study-drag-hint">Drag to rotate • Scroll to zoom</span>
        </div>

        {/* Visual Legend for feedback state */}
        {isAnswered && !feedback?.isCorrect ? (
          <div className="muscle-study-3d-legend" role="note">
            <span className="muscle-study-legend-item">
              <span className="muscle-study-legend-dot muscle-study-legend-dot--target" />
              Target: {question.targetName}
            </span>
            {feedback?.twoSidedReinforcement ? (
              <span className="muscle-study-legend-item">
                <span className="muscle-study-legend-dot muscle-study-legend-dot--mistake" />
                Your choice: {feedback.twoSidedReinforcement.mistakeName}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Question Card below viewport */}
      <div className="muscle-study-3d-card">
        {/* Progress meter */}
        <div className="muscle-study-progress">
          <div className="muscle-study-progress__info">
            <span className="muscle-study-progress__count">
              {progress.masteredCount} of {progress.totalItems} mastered
            </span>
            <div className="muscle-study-progress__meta">
              {progress.inReviewCount > 0 ? (
                <span className="muscle-study-progress__review">
                  ⚡ {progress.inReviewCount} in error review
                </span>
              ) : null}
              <button
                type="button"
                className={`muscle-study-shuffle-btn ${randomizeOrder ? 'is-active' : ''}`}
                onClick={toggleRandomizeOrder}
                title={
                  randomizeOrder
                    ? 'Questions randomized (click to present in order)'
                    : 'Questions presented in order (click to randomize)'
                }
                aria-label="Toggle randomize question order"
                aria-pressed={randomizeOrder}
              >
                <span aria-hidden="true">🔀</span>
                <span>{randomizeOrder ? 'Shuffle On' : 'In Order'}</span>
              </button>
            </div>
          </div>
          <div
            className="muscle-study-progress__bar"
            role="progressbar"
            aria-valuenow={progress.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="muscle-study-progress__fill"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question prompt header */}
        <div className="muscle-study-prompt-header">
          <div className="muscle-study-category-badge">{question.category || '3D ANATOMY'}</div>
          <h2 className="muscle-study-question-text">{question.prompt}</h2>
        </div>

        {/* 4 Group-focused Choices */}
        <div className="muscle-study-choices" role="radiogroup" aria-label="Anatomical choices">
          {question.choices.map((choice, index) => {
            const letter = CHOICE_LABELS[index] || '';
            const isSelected = feedback?.selectedId === choice.id;
            const isTarget = choice.id === question.targetId;

            let statusClass = '';
            if (isAnswered) {
              if (isSelected && feedback?.isCorrect) {
                statusClass = 'is-correct';
              } else if (isSelected && !feedback?.isCorrect) {
                statusClass = 'is-incorrect';
              } else if (isTarget && !feedback?.isCorrect) {
                statusClass = 'is-target-reveal';
              }
            }

            return (
              <button
                key={choice.id}
                type="button"
                disabled={isAnswered}
                onClick={() => submitAnswer(choice.id)}
                className={`muscle-study-choice-btn ${statusClass}`}
              >
                <span className="muscle-study-choice-letter">{letter}</span>
                <div className="muscle-study-choice-body">
                  <span className="muscle-study-choice-text">{choice.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback Banner */}
        {isAnswered && feedback ? (
          <div
            className={`muscle-study-feedback-card ${
              feedback.isCorrect ? 'is-correct' : 'is-incorrect'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="muscle-study-feedback-card__header">
              <span className="muscle-study-feedback-card__icon" aria-hidden="true">
                {feedback.isCorrect ? '✓' : '✗'}
              </span>
              <span className="muscle-study-feedback-card__title">
                {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>

            <p className="muscle-study-feedback-card__msg">{feedback.message}</p>

            {question.explanation ? (
              <div className="muscle-study-feedback-card__explanation">
                <strong>Anatomical Notes:</strong> {question.explanation}
              </div>
            ) : null}

            {/* Two-Sided Queue Reinforcement Notice */}
            {!feedback.isCorrect && feedback.twoSidedReinforcement ? (
              <div className="muscle-study-dual-queue-notice">
                <span className="muscle-study-dual-queue-notice__icon">🔄</span>
                <div className="muscle-study-dual-queue-notice__text">
                  <strong>Two-Sided Learning Queue Active:</strong>
                  <p>
                    {feedback.twoSidedReinforcement.explanation} Both have been highlighted on the model
                    (Blue = target, Red = chosen distractor) so you can compare their locations.
                  </p>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              className="muscle-study-continue-btn"
              onClick={nextQuestion}
              autoFocus
            >
              Continue ➔
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
