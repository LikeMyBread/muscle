import React from 'react';
import { useStudyStore } from './useStudyStore';
import { getQueueProgress } from './studyQueue';
import { getAnatomyTermById } from '../curriculum/anatomyTerms';
import StudyTermVisualExample from './StudyTermVisualExample';
import type { StudyQuestion } from './types';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

export default function StudyTextQuestion({ question }: { question: StudyQuestion }) {
  const submitAnswer = useStudyStore((s) => s.submitAnswer);
  const nextQuestion = useStudyStore((s) => s.nextQuestion);
  const feedback = useStudyStore((s) => s.feedback);
  const activeQueue = useStudyStore((s) => s.activeQueue);
  const reviewLesson = useStudyStore((s) => s.reviewLesson);

  const progress = getQueueProgress(activeQueue);
  const isAnswered = Boolean(feedback?.answered);

  const targetTerm = getAnatomyTermById(question.targetId);
  const mistakeTerm = feedback?.selectedId ? getAnatomyTermById(feedback.selectedId) : undefined;

  return (
    <div className="muscle-study-card">
      {/* Top progress meter */}
      <div className="muscle-study-progress">
        <div className="muscle-study-progress__info">
          <span>
            {progress.masteredCount} of {progress.totalItems} mastered
          </span>
          <div className="muscle-study-progress__actions">
            {progress.inReviewCount > 0 ? (
              <span className="muscle-study-progress__review">
                ⚡ {progress.inReviewCount} in error review
              </span>
            ) : null}
            <button
              type="button"
              className="muscle-study-revisit-lesson-btn"
              onClick={reviewLesson}
              title="Review lesson slides for this unit"
            >
              📖 Lesson
            </button>
          </div>
        </div>
        <div className="muscle-study-progress__bar" role="progressbar" aria-valuenow={progress.progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="muscle-study-progress__fill"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question header */}
      <div className="muscle-study-prompt-header">
        <div className="muscle-study-category-row">
          <div className="muscle-study-category-badge">{question.category || 'ANATOMY TERM'}</div>
          {question.isReview ? (
            <div className="muscle-study-review-badge">
              🔄 Spaced Review
            </div>
          ) : null}
        </div>
        <h2 className="muscle-study-question-text">{question.prompt}</h2>
      </div>

      {/* 4 Choices */}
      <div className="muscle-study-choices" role="radiogroup" aria-label="Answer options">
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

          {/* Visual Example Section from Reference Mode */}
          {targetTerm ? (
            <StudyTermVisualExample
              targetTerm={targetTerm}
              mistakeTerm={mistakeTerm}
              isCorrect={feedback.isCorrect}
            />
          ) : question.explanation ? (
            <div className="muscle-study-feedback-card__explanation">
              <strong>Definition:</strong> {question.explanation}
            </div>
          ) : null}

          {/* Two-Sided Queue Reinforcement Notice */}
          {!feedback.isCorrect && feedback.twoSidedReinforcement ? (
            <div className="muscle-study-dual-queue-notice">
              <span className="muscle-study-dual-queue-notice__icon">🔄</span>
              <div className="muscle-study-dual-queue-notice__text">
                <strong>Two-Sided Learning Queue Active:</strong>
                <p>
                  To eliminate confusion between <em>{feedback.twoSidedReinforcement.targetName}</em> and{' '}
                  <em>{feedback.twoSidedReinforcement.mistakeName}</em>, questions for both terms have
                  been queued for repeat practice.
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
  );
}
