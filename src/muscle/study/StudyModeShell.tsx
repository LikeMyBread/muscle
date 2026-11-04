import React, { useEffect } from 'react';
import { useStudyStore } from './useStudyStore';
import StudyTextQuestion from './StudyTextQuestion';
import Study3DQuestion from './Study3DQuestion';
import StudyUnitComplete from './StudyUnitComplete';
import StudyCurriculumNav from './StudyCurriculumNav';
import { getUnitById } from './studyCurriculum';

export default function StudyModeShell() {
  const activeUnitId = useStudyStore((s) => s.activeUnitId);
  const currentQuestion = useStudyStore((s) => s.currentQuestion);
  const unitCompleted = useStudyStore((s) => s.unitCompleted);
  const selectUnit = useStudyStore((s) => s.selectUnit);

  // Initialize active unit question if empty on mount
  useEffect(() => {
    if (!currentQuestion && !unitCompleted) {
      selectUnit(activeUnitId);
    }
  }, [activeUnitId, currentQuestion, unitCompleted, selectUnit]);

  const unit = getUnitById(activeUnitId);

  return (
    <div className="muscle-study-shell" data-testid="muscle-study-shell">
      <StudyCurriculumNav />

      <main id="main" className="muscle-study-pane">
        {unitCompleted ? (
          <StudyUnitComplete />
        ) : currentQuestion ? (
          currentQuestion.type === 'text' ? (
            <StudyTextQuestion key={currentQuestion.id} question={currentQuestion} />
          ) : (
            <Study3DQuestion key={currentQuestion.id} question={currentQuestion} />
          )
        ) : (
          <div className="muscle-study-loading" role="status" aria-live="polite">
            <p>Loading {unit?.title || 'study unit'}…</p>
          </div>
        )}
      </main>
    </div>
  );
}
