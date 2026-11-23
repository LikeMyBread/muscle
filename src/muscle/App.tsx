import { lazy, Suspense, useEffect } from 'react';
import MuscleAnatomyDebugPanel from './components/debug/MuscleAnatomyDebugPanel';
import StructureInfoBox from './components/StructureInfoBox';
import { useMuscleStore } from './store/useMuscleStore';
import { useStudyStore } from './study/useStudyStore';

const TrainingCanvas = lazy(() => import('./components/canvas/TrainingCanvas'));

export default function App() {
  const init = useMuscleStore((s) => s.init);
  const hydrated = useMuscleStore((s) => s.hydrated);
  const setBodyView = useMuscleStore((s) => s.setBodyView);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (!hydrated) return;
    setBodyView('full_body');
    useStudyStore.getState().setAppMode('pose');
  }, [hydrated, setBodyView]);

  if (!hydrated) {
    return (
      <div className="muscle-app muscle-app--loading" role="status" aria-live="polite">
        Loading 3D anatomy model…
      </div>
    );
  }

  return (
    <>
      <div className="muscle-app muscle-app--artist-tool" data-testid="muscle-app">
        <main id="main" className="muscle-main">
          <Suspense
            fallback={
              <div className="muscle-canvas-loading" role="status" aria-live="polite">
                Loading 3D canvas…
              </div>
            }
          >
            <TrainingCanvas />
          </Suspense>
          <div className="muscle-canvas-citation" aria-label="Anatomy models citation">
            Anatomy models adapted from{' '}
            <a
              href="https://github.com/Z-Anatomy/Models-of-human-anatomy"
              target="_blank"
              rel="noopener noreferrer"
              className="muscle-canvas-citation__link"
            >
              Z-Anatomy
            </a>{' '}
            (
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="muscle-canvas-citation__link"
            >
              CC BY-SA 4.0
            </a>
            )
          </div>
          <StructureInfoBox />
        </main>
      </div>
      <MuscleAnatomyDebugPanel />
    </>
  );
}
