import React, { useEffect } from 'react';
import { useStudyStore } from './useStudyStore';
import { useMuscleStore } from '../store/useMuscleStore';
import StudyUnitLesson from './StudyUnitLesson';
import StudyTextQuestion from './StudyTextQuestion';
import Study3DQuestion from './Study3DQuestion';
import StudyUnitComplete from './StudyUnitComplete';
import StudyCurriculumNav from './StudyCurriculumNav';
import { getUnitById } from './studyCurriculum';

export default function StudyModeShell() {
  const activeUnitId = useStudyStore((s) => s.activeUnitId);
  const unitPhase = useStudyStore((s) => s.unitPhase);
  const lessonIndex = useStudyStore((s) => s.lessonIndex);
  const currentQuestion = useStudyStore((s) => s.currentQuestion);
  const unitCompleted = useStudyStore((s) => s.unitCompleted);
  const selectUnit = useStudyStore((s) => s.selectUnit);
  const nextLessonStep = useStudyStore((s) => s.nextLessonStep);
  const prevLessonStep = useStudyStore((s) => s.prevLessonStep);
  const startUnitQuiz = useStudyStore((s) => s.startUnitQuiz);

  useEffect(() => {
    useMuscleStore.getState().setStudyActive(true);
    return () => {
      useMuscleStore.getState().setStudyActive(false);
    };
  }, []);

  // Initialize active unit if needed
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
        ) : unitPhase === 'lesson' && unit ? (
          <StudyUnitLesson
            key={`lesson_${unit.id}_${lessonIndex}`}
            unit={unit}
            lessonIndex={lessonIndex}
            onNext={nextLessonStep}
            onPrev={prevLessonStep}
            onStartQuiz={startUnitQuiz}
            onSkipToQuiz={startUnitQuiz}
          />
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

        <footer className="muscle-study-footer">
          <p className="muscle-attribution">
            3D anatomy models adapted from{' '}
            <a
              href="https://github.com/Z-Anatomy/Models-of-human-anatomy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Z-Anatomy
            </a>{' '}
            (
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY-SA 4.0
            </a>
            )
          </p>
        </footer>
      </main>
    </div>
  );
}
