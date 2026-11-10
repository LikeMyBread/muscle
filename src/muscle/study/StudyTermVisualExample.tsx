import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { AnatomyTerm } from '../types/anatomyTerm';
import type { MuscleMemoryNode } from '../types/node';
import { getAnatomyTermById } from '../curriculum/anatomyTerms';
import { getHighlightNodeIdsForTerm } from '../curriculum/anatomyTermMatches';
import { getNodeById } from '../curriculum';
import { PLANE_TERM_IDS } from '../components/terms/anatomyTermPlaneSpecs';
import { useMuscleStore } from '../store/useMuscleStore';

const TrainingCanvas = lazy(() => import('../components/canvas/TrainingCanvas'));

export interface StudyTermVisualExampleProps {
  targetTerm: AnatomyTerm;
  mistakeTerm?: AnatomyTerm;
  isCorrect: boolean;
}

function getVisualExampleNodes(term: AnatomyTerm): MuscleMemoryNode[] {
  const ids = getHighlightNodeIdsForTerm(term);
  const nodes: MuscleMemoryNode[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const node = getNodeById(id);
    if (node && !seen.has(node.id)) {
      seen.add(node.id);
      nodes.push(node);
    }
  }
  return nodes;
}

export default function StudyTermVisualExample({
  targetTerm,
  mistakeTerm,
  isCorrect,
}: StudyTermVisualExampleProps): React.ReactElement {
  const [selectedTermId, setSelectedTermId] = useState<string>(targetTerm.id);
  const focusedNodeId = useMuscleStore((s) => s.focusedNodeId);
  const resetCameraView = useMuscleStore((s) => s.resetCameraView);

  const activeTerm =
    selectedTermId === mistakeTerm?.id && mistakeTerm ? mistakeTerm : targetTerm;
  const isViewingTarget = activeTerm.id === targetTerm.id;

  const exampleNodes = useMemo(() => getVisualExampleNodes(activeTerm), [activeTerm]);

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
                : '• Joint motion demonstration'}
            </span>
          ) : null}
        </div>
      </div>

      {/* Term Details & Reference Information */}
      <div className="muscle-study-visual-details">
        <div className="muscle-study-visual-meta">
          <div className="muscle-study-visual-header-row">
            <h3 className="muscle-study-visual-heading">{activeTerm.label}</h3>
            <span className="muscle-study-visual-category-pill">
              {activeTerm.category.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="muscle-study-visual-definition">{activeTerm.definition}</p>
          {activeTerm.example ? (
            <p className="muscle-study-visual-example-note">
              <strong>Example:</strong> {activeTerm.example}
            </p>
          ) : null}
        </div>

        {/* Cardinal reference planes switcher */}
        {activeTerm.category === 'plane' ? (
          <div className="muscle-study-visual-planes">
            <span className="muscle-study-visual-chips-title">Cardinal planes:</span>
            <div className="muscle-study-visual-chips-row">
              {(['sagittal', 'coronal', 'transverse'] as const).map((kind) => {
                const planeTermId = PLANE_TERM_IDS[kind];
                const planeTerm = getAnatomyTermById(planeTermId);
                const isActive = activeTerm.id === planeTermId;
                return (
                  <button
                    key={planeTermId}
                    type="button"
                    className={`muscle-study-visual-chip${isActive ? ' is-active' : ''}`}
                    onClick={() => setSelectedTermId(planeTermId)}
                  >
                    {planeTerm?.label ?? kind}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Structures highlighted on the 3D model */}
        {exampleNodes.length > 0 ? (
          <div className="muscle-study-visual-structures">
            <div className="muscle-study-visual-structures-header">
              <span className="muscle-study-visual-chips-title">
                On the 3D model ({exampleNodes.length}{' '}
                {exampleNodes.length === 1 ? 'structure' : 'structures'}):
              </span>
              {exampleNodes.length > 1 ? (
                <button
                  type="button"
                  className="muscle-study-visual-all-btn"
                  onClick={() => {
                    const ids = exampleNodes.map((n) => n.id);
                    useMuscleStore.getState().focusStudyGroup(ids);
                  }}
                >
                  Highlight all
                </button>
              ) : null}
            </div>
            <div className="muscle-study-visual-chips-row">
              {exampleNodes.map((node) => {
                const isNodeActive = focusedNodeId === node.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`muscle-study-visual-chip${isNodeActive ? ' is-active' : ''}`}
                    onClick={() => {
                      const muscleStore = useMuscleStore.getState();
                      muscleStore.focusStructure(node.id);
                      if (node.type === 'bone' || node.type === 'joint' || node.layerDepth >= 2) {
                        muscleStore.setLayerPeelDepth(
                          node.type === 'bone' || node.type === 'joint' ? 3 : 2,
                        );
                      } else {
                        muscleStore.setLayerPeelDepth(0);
                      }
                    }}
                  >
                    {node.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
