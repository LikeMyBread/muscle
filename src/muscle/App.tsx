import { lazy, Suspense, useEffect, useState } from 'react';
import SkipToMain from '../shared/components/SkipToMain';
import WorkoutPanel from './components/workout/WorkoutPanel';
import MuscleAnatomyDebugPanel from './components/debug/MuscleAnatomyDebugPanel';
import AppHeader from './components/AppHeader';
import ModeSelectionScreen from './components/ModeSelectionScreen';
import StudyModeShell from './study/StudyModeShell';
import { parseMuscleModuleFromSearch } from './routes/muscleAppUrl';
import { useMuscleStore } from './store/useMuscleStore';
import { useStudyStore } from './study/useStudyStore';

const TrainingCanvas = lazy(() => import('./components/canvas/TrainingCanvas'));

export default function App() {
  const init = useMuscleStore((s) => s.init);
  const hydrated = useMuscleStore((s) => s.hydrated);
  const setActiveModule = useMuscleStore((s) => s.setActiveModule);
  const setBodyView = useMuscleStore((s) => s.setBodyView);
  const appMode = useStudyStore((s) => s.appMode);
  const setAppMode = useStudyStore((s) => s.setAppMode);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'study' || modeParam === 'reference') {
      setAppMode(modeParam);
    } else if (params.has('e2eSeed')) {
      // E2e smoke tests expect reference mode
      setAppMode('reference');
    }
  }, [setAppMode]);

  useEffect(() => {
    if (!hydrated) return;
    const applyModuleFromSearch = () => {
      const moduleId = parseMuscleModuleFromSearch(window.location.search);
      if (moduleId) {
        setActiveModule(moduleId);
        return;
      }
      setBodyView('full_body');
    };
    applyModuleFromSearch();
    window.addEventListener('popstate', applyModuleFromSearch);
    return () => window.removeEventListener('popstate', applyModuleFromSearch);
  }, [hydrated, setActiveModule, setBodyView]);

  if (!hydrated) {
    return (
      <div className="muscle-app muscle-app--loading" role="status" aria-live="polite">
        Loading workout data…
      </div>
    );
  }

  if (appMode === 'selection') {
    return (
      <>
        <SkipToMain />
        <div className="muscle-app muscle-app--mode-selection" data-testid="muscle-app">
          <ModeSelectionScreen />
        </div>
        <MuscleAnatomyDebugPanel />
      </>
    );
  }

  if (appMode === 'study') {
    return (
      <>
        <SkipToMain />
        <div
          className="muscle-app muscle-app--study-mode"
          data-testid="muscle-app"
          style={{ flexDirection: 'column' }}
        >
          <AppHeader />
          <StudyModeShell />
        </div>
        <MuscleAnatomyDebugPanel />
      </>
    );
  }

  // Reference mode (classic split view with persistent header)
  return (
    <>
      <SkipToMain />
      <div
        className="muscle-app muscle-app--reference-mode"
        data-testid="muscle-app"
        style={{ flexDirection: 'column' }}
      >
        <AppHeader />
        <div
          className="muscle-app-body"
          style={{
            display: 'flex',
            flexDirection: 'row-reverse',
            flex: 1,
            width: '100%',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            className="muscle-mobile-panel-toggle"
            onClick={() => setPanelOpen((v) => !v)}
            aria-expanded={panelOpen}
            aria-controls="muscle-workout-drawer"
          >
            {panelOpen ? 'Hide workout panel' : 'Show workout panel'}
          </button>

          <div
            id="muscle-workout-drawer"
            className={`muscle-workout-drawer ${panelOpen ? 'is-open' : ''}`}
          >
            <WorkoutPanel />
          </div>

          <main id="main" className="muscle-main">
            <Suspense
              fallback={
                <div className="muscle-canvas-loading" role="status" aria-live="polite">
                  Loading 3D training canvas…
                </div>
              }
            >
              <TrainingCanvas />
            </Suspense>
          </main>
        </div>
      </div>
      <MuscleAnatomyDebugPanel />
    </>
  );
}
