import React from 'react';
import { useStudyStore } from './useStudyStore';
import {
  STUDY_UNITS,
  getUnitById,
  isGraduatedTo3D,
  isUnitUnlocked,
} from './studyCurriculum';

export default function StudyUnitComplete() {
  const activeUnitId = useStudyStore((s) => s.activeUnitId);
  const completedUnitIds = useStudyStore((s) => s.completedUnitIds);
  const selectUnit = useStudyStore((s) => s.selectUnit);
  const setNavOpen = useStudyStore((s) => s.setNavOpen);
  const restartCurrentUnit = useStudyStore((s) => s.restartCurrentUnit);

  const currentUnit = getUnitById(activeUnitId);
  const graduated = isGraduatedTo3D(completedUnitIds);

  // Find next unit in the curriculum
  const currentIndex = STUDY_UNITS.findIndex((u) => u.id === activeUnitId);
  const nextUnit =
    currentIndex >= 0 && currentIndex < STUDY_UNITS.length - 1
      ? STUDY_UNITS[currentIndex + 1]
      : null;
  const nextUnlocked = nextUnit ? isUnitUnlocked(nextUnit.id, completedUnitIds) : false;

  const isGraduationMilestone = activeUnitId === 'unit_terms_joints' && graduated;

  return (
    <div className="muscle-unit-complete">
      <div className="muscle-unit-complete__card">
        <div className="muscle-unit-complete__badge" aria-hidden="true">
          {isGraduationMilestone ? '🎓' : '🏆'}
        </div>

        <h2 className="muscle-unit-complete__title">
          {isGraduationMilestone ? 'Graduated to 3D Anatomy!' : 'Unit Mastered!'}
        </h2>

        <p className="muscle-unit-complete__subtitle">
          {currentUnit
            ? `You've completed all active recall targets and resolved all mistake pairs in "${currentUnit.title}".`
            : 'All items mastered!'}
        </p>

        {isGraduationMilestone ? (
          <div className="muscle-unit-complete__graduation-box">
            <h3>🎉 Foundation Milestone Reached</h3>
            <p>
              You have mastered the foundational vocabulary and planes in the <strong>Language of Anatomy</strong>.
              You are now ready to graduate to identifying bones, landmarks, and muscle masses directly on the
              interactive 3D spatial models!
            </p>
          </div>
        ) : null}

        <div className="muscle-unit-complete__actions">
          {nextUnit && nextUnlocked ? (
            <button
              type="button"
              className="muscle-unit-complete__btn muscle-unit-complete__btn--primary"
              onClick={() => selectUnit(nextUnit.id)}
            >
              Continue to {nextUnit.title} ➔
            </button>
          ) : (
            <button
              type="button"
              className="muscle-unit-complete__btn muscle-unit-complete__btn--primary"
              onClick={() => setNavOpen(true)}
            >
              Browse Next Unit ➔
            </button>
          )}

          <div className="muscle-unit-complete__secondary-actions">
            <button
              type="button"
              className="muscle-unit-complete__btn muscle-unit-complete__btn--secondary"
              onClick={restartCurrentUnit}
            >
              Practice This Unit Again
            </button>
            <button
              type="button"
              className="muscle-unit-complete__btn muscle-unit-complete__btn--secondary"
              onClick={() => setNavOpen(true)}
            >
              Curriculum Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
