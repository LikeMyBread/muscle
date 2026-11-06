import React, { lazy, Suspense, useEffect } from 'react';
import { useMuscleStore } from '../store/useMuscleStore';
import { getNodeById } from '../curriculum';
import { getAnatomyTermById } from '../curriculum/anatomyTerms';
import StudyTermVisualExample from './StudyTermVisualExample';
import { computeBestPeelDepthForNode } from './questionGenerator';
import type { StudyUnit } from './types';

const TrainingCanvas = lazy(() => import('../components/canvas/TrainingCanvas'));

export interface StudyUnitLessonProps {
  unit: StudyUnit;
  lessonIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onStartQuiz: () => void;
  onSkipToQuiz: () => void;
}

export default function StudyUnitLesson({
  unit,
  lessonIndex,
  onNext,
  onPrev,
  onStartQuiz,
  onSkipToQuiz,
}: StudyUnitLessonProps) {
  const currentItemId = unit.itemIds[lessonIndex] ?? unit.itemIds[0];
  const totalLessons = unit.itemIds.length;
  const isFirst = lessonIndex === 0;
  const isLast = lessonIndex === totalLessons - 1;
  const progressPct = Math.round(((lessonIndex + 1) / totalLessons) * 100);

  const resetCameraView = useMuscleStore((s) => s.resetCameraView);

  // Sync 3D canvas when item changes in 3D units
  useEffect(() => {
    if (unit.type !== '3d' || !currentItemId) return;

    const muscleStore = useMuscleStore.getState();
    const node = getNodeById(currentItemId);
    if (!node) return;

    muscleStore.setStudyActive(true);

    if (muscleStore.activeModuleId !== unit.moduleId || muscleStore.bodyView !== 'region') {
      muscleStore.setBodyView('region');
      muscleStore.setActiveModule(unit.moduleId);
    }

    const peel = computeBestPeelDepthForNode(node);
    muscleStore.setLayerPeelDepth(peel);
    muscleStore.setStudyTarget(currentItemId, null, 'idle');
    muscleStore.focusStructure(currentItemId);
  }, [currentItemId, unit.moduleId, unit.type]);

  if (unit.type === 'text') {
    const term = getAnatomyTermById(currentItemId);

    return (
      <div className="muscle-study-card muscle-study-lesson-card" data-testid="muscle-study-lesson">
        {/* Progress & Step Meter */}
        <div className="muscle-study-progress">
          <div className="muscle-study-progress__info">
            <span className="muscle-study-lesson-badge">
              📖 LESSON {lessonIndex + 1} OF {totalLessons} • NEW MATERIAL
            </span>
            <button
              type="button"
              className="muscle-study-skip-btn"
              onClick={onSkipToQuiz}
              title="Skip lesson and begin quiz immediately"
            >
              Skip to Quiz →
            </button>
          </div>
          <div
            className="muscle-study-progress__bar"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="muscle-study-progress__fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Lesson Header */}
        <div className="muscle-study-prompt-header">
          <div className="muscle-study-category-badge">
            {term?.category.replace('_', ' ').toUpperCase() || 'ANATOMY TERM'}
          </div>
          <h2 className="muscle-study-question-text">{term?.label || currentItemId}</h2>
        </div>

        {/* Term Definition & Artistic Notes */}
        {term ? (
          <div className="muscle-study-lesson-body">
            <div className="muscle-study-lesson-definition">
              <h3 className="muscle-study-lesson-subhead">Definition & Core Concept</h3>
              <p className="muscle-study-lesson-p">{term.definition}</p>
            </div>

            {term.example ? (
              <div className="muscle-study-lesson-example">
                <h4 className="muscle-study-lesson-subhead-sm">Figure & Motion Example</h4>
                <p className="muscle-study-lesson-p">{term.example}</p>
              </div>
            ) : null}

            {/* Visual anatomical diagram if available */}
            {term.visualization || term.example ? (
              <StudyTermVisualExample targetTerm={term} isCorrect={true} />
            ) : null}
          </div>
        ) : null}

        {/* Navigation Bar */}
        <div className="muscle-study-lesson-nav">
          <button
            type="button"
            disabled={isFirst}
            onClick={onPrev}
            className="muscle-study-lesson-nav-btn muscle-study-lesson-nav-btn--secondary"
          >
            ← Previous
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={onStartQuiz}
              className="muscle-study-lesson-nav-btn muscle-study-lesson-nav-btn--primary"
            >
              Start Practice Quiz 🚀
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="muscle-study-lesson-nav-btn muscle-study-lesson-nav-btn--primary"
            >
              Next Lesson →
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3D Unit Lesson Layout
  const node = getNodeById(currentItemId);

  return (
    <div className="muscle-study-3d-layout" data-testid="muscle-study-lesson">
      {/* 3D Model Viewport with Highlighted Target */}
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

        <div className="muscle-study-viewport-controls">
          <button
            type="button"
            className="muscle-study-reset-cam-btn"
            onClick={resetCameraView}
            title="Reset to optimal camera angle"
          >
            ⟲ Reset View
          </button>
          <span className="muscle-study-drag-hint">Drag to inspect • Structure highlighted</span>
        </div>

        {/* Floating Structure Pill */}
        <div className="muscle-study-lesson-viewport-badge">
          <span className="muscle-study-lesson-badge-dot" />
          <span>{node?.name || currentItemId}</span>
        </div>
      </div>

      {/* Lesson Details Card below Viewport */}
      <div className="muscle-study-3d-card muscle-study-lesson-card">
        {/* Progress & Step Meter */}
        <div className="muscle-study-progress">
          <div className="muscle-study-progress__info">
            <span className="muscle-study-lesson-badge">
              📖 LESSON {lessonIndex + 1} OF {totalLessons} • 3D LANDMARK PREVIEW
            </span>
            <button
              type="button"
              className="muscle-study-skip-btn"
              onClick={onSkipToQuiz}
              title="Skip lesson and begin quiz immediately"
            >
              Skip to Quiz →
            </button>
          </div>
          <div
            className="muscle-study-progress__bar"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="muscle-study-progress__fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Node Title & Category */}
        <div className="muscle-study-prompt-header">
          <div className="muscle-study-category-badge">
            {unit.groupName.toUpperCase()} • {node?.type.toUpperCase() || 'STRUCTURE'}
          </div>
          <h2 className="muscle-study-question-text">{node?.name || currentItemId}</h2>
        </div>

        {node ? (
          <div className="muscle-study-lesson-body">
            <p className="muscle-study-lesson-p">{node.details.definition}</p>

            {/* Muscle Attachments */}
            {node.type === 'muscle' && (node.originBoneId || node.insertionBoneId) ? (
              <div className="muscle-study-lesson-facts">
                {node.originBoneId ? (
                  <div className="muscle-study-fact-row">
                    <span className="muscle-study-fact-label">Origin:</span>
                    <span className="muscle-study-fact-val">
                      {getNodeById(node.originBoneId)?.name ?? node.originBoneId}
                    </span>
                  </div>
                ) : null}
                {node.insertionBoneId ? (
                  <div className="muscle-study-fact-row">
                    <span className="muscle-study-fact-label">Insertion:</span>
                    <span className="muscle-study-fact-val">
                      {getNodeById(node.insertionBoneId)?.name ?? node.insertionBoneId}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Bone Subcutaneous Landmarks */}
            {node.type === 'bone' && node.subcutaneousLandmarks?.length ? (
              <div className="muscle-study-lesson-facts">
                <div className="muscle-study-fact-row">
                  <span className="muscle-study-fact-label">Surface landmark:</span>
                  <span className="muscle-study-fact-val">{node.subcutaneousLandmarks.join(', ')}</span>
                </div>
              </div>
            ) : null}

            {/* Joint Type */}
            {node.type === 'joint' && node.jointType ? (
              <div className="muscle-study-lesson-facts">
                <div className="muscle-study-fact-row">
                  <span className="muscle-study-fact-label">Joint Type:</span>
                  <span className="muscle-study-fact-val">{node.jointType.replace('_', ' ')}</span>
                </div>
              </div>
            ) : null}

            {/* Colloquial / Common Names */}
            {node.details.colloquialNames?.length ? (
              <p className="muscle-study-lesson-aliases">
                <em>Common name: {node.details.colloquialNames.join(', ')}</em>
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Navigation Bar */}
        <div className="muscle-study-lesson-nav">
          <button
            type="button"
            disabled={isFirst}
            onClick={onPrev}
            className="muscle-study-lesson-nav-btn muscle-study-lesson-nav-btn--secondary"
          >
            ← Previous
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={onStartQuiz}
              className="muscle-study-lesson-nav-btn muscle-study-lesson-nav-btn--primary"
            >
              Start Practice Quiz 🚀
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="muscle-study-lesson-nav-btn muscle-study-lesson-nav-btn--primary"
            >
              Next Landmark →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
