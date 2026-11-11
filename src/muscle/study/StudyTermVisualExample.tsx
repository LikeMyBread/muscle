import React, { lazy, Suspense, useEffect, useState } from 'react';
import type { AnatomyTerm } from '../types/anatomyTerm';
import { getHighlightNodeIdsForTerm } from '../curriculum/anatomyTermMatches';
import { getNodeById } from '../curriculum';
import { useMuscleStore } from '../store/useMuscleStore';

const TrainingCanvas = lazy(() => import('../components/canvas/TrainingCanvas'));

export interface StudyTermVisualExampleProps {
  targetTerm: AnatomyTerm;
  mistakeTerm?: AnatomyTerm;
  isCorrect: boolean;
}

export default function StudyTermVisualExample({
  targetTerm,
  mistakeTerm,
  isCorrect,
}: StudyTermVisualExampleProps): React.ReactElement {
  const [selectedTermId, setSelectedTermId] = useState<string>(targetTerm.id);
  const resetCameraView = useMuscleStore((s) => s.resetCameraView);

  const activeTerm =
    selectedTermId === mistakeTerm?.id && mistakeTerm ? mistakeTerm : targetTerm;
  const isViewingTarget = activeTerm.id === targetTerm.id;

  // Synchronize 3D scene whenever the active term changes
  useEffect(() => {
    const muscleStore = useMuscleStore.getState();
    muscleStore.setStudyActive(true);
    muscleStore.setBodyView('full_body');
    muscleStore.setActiveModule('anatomy_terms');
    muscleStore.setActiveTermId(activeTerm.id);

    const highlightIds = getHighlightNodeIdsForTerm(activeTerm);
    if (highlightIds.length > 0) {
      if (highlightIds.length === 1) {
        muscleStore.focusStructure(highlightIds[0]);
      } else {
        muscleStore.focusStudyGroup(highlightIds);
      }
      const firstNode = getNodeById(highlightIds[0]);
      if (
        firstNode &&
        (firstNode.type === 'bone' || firstNode.type === 'joint' || firstNode.layerDepth >= 2)
      ) {
        muscleStore.setLayerPeelDepth(firstNode.type === 'bone' || firstNode.type === 'joint' ? 3 : 2);
      } else {
        muscleStore.setLayerPeelDepth(0);
      }
    } else {
      muscleStore.clearFocus();
      muscleStore.setLayerPeelDepth(0);
      muscleStore.resetCameraView();
    }
  }, [activeTerm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const muscleStore = useMuscleStore.getState();
      muscleStore.setActiveTermId(null);
      muscleStore.clearFocus();
    };
  }, []);

  return (
    <div className="muscle-study-visual-example" data-testid="muscle-study-visual-example">
      {/* Comparison tabs if answered incorrectly */}
      {!isCorrect && mistakeTerm ? (
        <div
          className="muscle-study-visual-tabs"
          role="tablist"
          aria-label="Compare correct term and your choice"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isViewingTarget}
            className={`muscle-study-visual-tab muscle-study-visual-tab--target${
              isViewingTarget ? ' is-active' : ''
            }`}
            onClick={() => setSelectedTermId(targetTerm.id)}
          >
            <span className="muscle-study-visual-tab__badge">✓ Correct</span>
            <span className="muscle-study-visual-tab__name">{targetTerm.label}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={!isViewingTarget}
            className={`muscle-study-visual-tab muscle-study-visual-tab--mistake${
              !isViewingTarget ? ' is-active' : ''
            }`}
            onClick={() => setSelectedTermId(mistakeTerm.id)}
          >
            <span className="muscle-study-visual-tab__badge">✗ Your choice</span>
            <span className="muscle-study-visual-tab__name">{mistakeTerm.label}</span>
          </button>
        </div>
      ) : null}

      {/* 3D Viewport displaying the reference visual example */}
      <div className="muscle-study-visual-viewport">
        <Suspense
          fallback={
            <div className="muscle-canvas-loading" role="status" aria-live="polite">
              Loading 3D anatomy visualization…
            </div>
          }
        >
          <TrainingCanvas />
        </Suspense>

        {/* Viewport controls */}
        <div className="muscle-study-viewport-controls">
          <button
            type="button"
            className="muscle-study-reset-cam-btn"
            onClick={resetCameraView}
            title="Reset to default camera view"
          >
            ⟲ Reset View
          </button>
          <span className="muscle-study-drag-hint">Drag to rotate • Scroll to zoom</span>
        </div>

        {/* Canvas pill overlay */}
        <div className="muscle-study-visual-badge">
          <span className="muscle-study-visual-badge__tag">
            {activeTerm.category.replace(/_/g, ' ').toUpperCase()}
          </span>
          <span className="muscle-study-visual-badge__name">{activeTerm.label}</span>
          {activeTerm.visualization === 'joint_motion' ? (
            <span className="muscle-study-visual-badge__sub">
              {activeTerm.id === 'term_flexion'
                ? '• Elbow bends toward upper arm (angle closes)'
                : activeTerm.id === 'term_extension'
                ? '• Knee straightens leg (angle opens)'
                : activeTerm.id === 'term_abduction'
                ? '• Arm raises away from midline'
                : activeTerm.id === 'term_adduction'
                ? '• Arm lowers toward midline'
                : activeTerm.id === 'term_pronation'
                ? '• Forearm rotates inward (palm turns backward)'
                : activeTerm.id === 'term_supination'
                ? '• Forearm rotates outward (palm turns forward)'
                : '• Joint motion demonstration'}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
