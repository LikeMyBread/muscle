import React from 'react';
import { useStudyStore } from '../study/useStudyStore';
import { getUnitById } from '../study/studyCurriculum';
import { getQueueProgress } from '../study/studyQueue';

export default function AppHeader() {
  const appMode = useStudyStore((s) => s.appMode);
  const setAppMode = useStudyStore((s) => s.setAppMode);
  const activeUnitId = useStudyStore((s) => s.activeUnitId);
  const setNavOpen = useStudyStore((s) => s.setNavOpen);
  const activeQueue = useStudyStore((s) => s.activeQueue);
  const randomizeOrder = useStudyStore((s) => s.randomizeOrder);
  const toggleRandomizeOrder = useStudyStore((s) => s.toggleRandomizeOrder);

  const activeUnit = getUnitById(activeUnitId);
  const queueProgress = getQueueProgress(activeQueue);

  return (
    <header className="muscle-app-header" role="banner">
      <div className="muscle-app-header__left">
        <button
          type="button"
          className="muscle-app-header__brand"
          onClick={() => setAppMode('selection')}
          title="Return to Mode Selection"
        >
          <span className="muscle-app-header__logo" aria-hidden="true">
            💪
          </span>
          <span className="muscle-app-header__title">Muscle Memory</span>
        </button>

        {appMode === 'study' && activeUnit ? (
          <button
            type="button"
            className="muscle-app-header__unit-pill"
            onClick={() => setNavOpen(true)}
            aria-label="Change unit in curriculum"
          >
            <span className="muscle-app-header__unit-type">
              {activeUnit.type === 'text' ? '📝 Text' : '🧊 3D'}
            </span>
            <span className="muscle-app-header__unit-title">{activeUnit.title}</span>
            <span className="muscle-app-header__unit-dropdown">▾</span>
          </button>
        ) : null}
      </div>

      <div className="muscle-app-header__right">
        {appMode === 'study' ? (
          <button
            type="button"
            className={`muscle-app-header__shuffle-btn ${randomizeOrder ? 'is-active' : ''}`}
            onClick={toggleRandomizeOrder}
            title={
              randomizeOrder
                ? 'Question order: Randomized (click to present in order)'
                : 'Question order: In order (click to randomize)'
            }
            aria-label="Toggle randomize question order"
            aria-pressed={randomizeOrder}
          >
            <span aria-hidden="true">🔀</span>
            <span className="muscle-app-header__shuffle-text">{randomizeOrder ? 'Shuffle On' : 'In Order'}</span>
          </button>
        ) : null}

        {appMode === 'study' && queueProgress.inReviewCount > 0 ? (
          <div className="muscle-app-header__queue-badge" title="Mistakes queued for extra practice">
            ⚠️ {queueProgress.inReviewCount} to review
          </div>
        ) : null}

        <div className="muscle-app-header__mode-toggle" role="tablist" aria-label="Application Mode">
          <button
            type="button"
            role="tab"
            aria-selected={appMode === 'study'}
            className={`muscle-mode-tab ${appMode === 'study' ? 'is-active' : ''}`}
            onClick={() => setAppMode('study')}
          >
            📖 Study
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={appMode === 'reference'}
            className={`muscle-mode-tab ${appMode === 'reference' ? 'is-active' : ''}`}
            onClick={() => setAppMode('reference')}
          >
            🧭 Reference
          </button>
        </div>
      </div>
    </header>
  );
}
