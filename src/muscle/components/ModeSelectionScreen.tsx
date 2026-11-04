import React from 'react';
import { useStudyStore } from '../study/useStudyStore';

export default function ModeSelectionScreen() {
  const setAppMode = useStudyStore((s) => s.setAppMode);

  return (
    <div className="muscle-mode-selection">
      <div className="muscle-mode-selection__container">
        <header className="muscle-mode-selection__header">
          <div className="muscle-mode-selection__badge">Anatomy for Artists</div>
          <h1 className="muscle-mode-selection__title">Muscle Memory</h1>
          <p className="muscle-mode-selection__subtitle">
            Choose your learning mode to build spatial anatomical intuition.
          </p>
        </header>

        <div className="muscle-mode-selection__cards">
          {/* Study Mode Card */}
          <div
            className="muscle-mode-card muscle-mode-card--study"
            onClick={() => setAppMode('study')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setAppMode('study');
            }}
          >
            <div className="muscle-mode-card__tag">Recommended</div>
            <div className="muscle-mode-card__icon" aria-hidden="true">
              📖
            </div>
            <h2 className="muscle-mode-card__heading">Study Mode</h2>
            <p className="muscle-mode-card__description">
              Mobile-optimized, guided curriculum. Master anatomy terminology through text quizzes,
              then graduate to identifying features on the 3D model. Features a two-sided error
              queue that reinforces both mistaken structures.
            </p>
            <ul className="muscle-mode-card__features">
              <li>✓ Single-pane, distraction-free layout</li>
              <li>✓ Text terminology foundation first</li>
              <li>✓ 3D model feature identification by group</li>
              <li>✓ Dual-concept error reinforcement queue</li>
            </ul>
            <button
              type="button"
              className="muscle-mode-card__button muscle-mode-card__button--study"
              onClick={(e) => {
                e.stopPropagation();
                setAppMode('study');
              }}
            >
              Start Study Mode
            </button>
          </div>

          {/* Reference Mode Card */}
          <div
            className="muscle-mode-card muscle-mode-card--reference"
            onClick={() => setAppMode('reference')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setAppMode('reference');
            }}
          >
            <div className="muscle-mode-card__tag">Explorer</div>
            <div className="muscle-mode-card__icon" aria-hidden="true">
              🧭
            </div>
            <h2 className="muscle-mode-card__heading">Reference Mode</h2>
            <p className="muscle-mode-card__description">
              Free interactive 3D anatomy explorer. Inspect the full human atlas, peel layers from
              skin to skeleton, hover over structures, and review verified definition cards.
            </p>
            <ul className="muscle-mode-card__features">
              <li>✓ Split 3D canvas and research panel</li>
              <li>✓ Interactive 4-stop layer depth peeling</li>
              <li>✓ Hover highlighting and definition cards</li>
              <li>✓ Spaced-repetition active reps workbench</li>
            </ul>
            <button
              type="button"
              className="muscle-mode-card__button muscle-mode-card__button--reference"
              onClick={(e) => {
                e.stopPropagation();
                setAppMode('reference');
              }}
            >
              Open Reference Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
