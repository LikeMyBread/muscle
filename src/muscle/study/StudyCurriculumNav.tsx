import React from 'react';
import { useStudyStore } from './useStudyStore';
import {
  STUDY_MODULE_METADATA,
  STUDY_UNITS,
  isGraduatedTo3D,
  isUnitUnlocked,
} from './studyCurriculum';
import type { MuscleRegion } from '../types/node';

const MODULE_ORDER: MuscleRegion[] = [
  'anatomy_terms',
  'fundamentals',
  'torso',
  'shoulder_neck',
  'arm',
  'hand',
  'leg',
  'foot',
];

export default function StudyCurriculumNav() {
  const navOpen = useStudyStore((s) => s.navOpen);
  const setNavOpen = useStudyStore((s) => s.setNavOpen);
  const activeUnitId = useStudyStore((s) => s.activeUnitId);
  const selectUnit = useStudyStore((s) => s.selectUnit);
  const completedUnitIds = useStudyStore((s) => s.completedUnitIds);

  if (!navOpen) return null;

  const graduated = isGraduatedTo3D(completedUnitIds);

  return (
    <div className="muscle-curriculum-modal" role="dialog" aria-modal="true" aria-label="Curriculum Navigation">
      <div className="muscle-curriculum-modal__backdrop" onClick={() => setNavOpen(false)} />
      <div className="muscle-curriculum-modal__content">
        <header className="muscle-curriculum-modal__header">
          <div>
            <h2 className="muscle-curriculum-modal__title">Study Curriculum</h2>
            <p className="muscle-curriculum-modal__subtitle">
              Follow the guided artist sequence from terminology to 3D spatial mastery.
            </p>
          </div>
          <button
            type="button"
            className="muscle-curriculum-modal__close"
            onClick={() => setNavOpen(false)}
            aria-label="Close curriculum menu"
          >
            ✕
          </button>
        </header>

        {/* Graduation Status Callout */}
        <div
          className={`muscle-curriculum-graduation-banner ${
            graduated ? 'is-graduated' : 'is-pending'
          }`}
        >
          <div className="muscle-curriculum-graduation-banner__icon">
            {graduated ? '🎓' : '📝'}
          </div>
          <div>
            <strong>
              {graduated
                ? 'Graduated to 3D Anatomy!'
                : 'Foundation Phase: Language of Anatomy'}
            </strong>
            <p>
              {graduated
                ? 'Text terminology mastered. 3D spatial units are unlocked.'
                : 'Complete the 5 text terminology units to graduate to 3D model feature identification.'}
            </p>
          </div>
        </div>

        <div className="muscle-curriculum-modal__list">
          {MODULE_ORDER.map((moduleId) => {
            const meta = STUDY_MODULE_METADATA[moduleId];
            const units = STUDY_UNITS.filter((u) => u.moduleId === moduleId);

            return (
              <section key={moduleId} className="muscle-curriculum-module">
                <div className="muscle-curriculum-module__header">
                  <span className="muscle-curriculum-module__icon" aria-hidden="true">
                    {meta.icon}
                  </span>
                  <div>
                    <h3 className="muscle-curriculum-module__title">
                      {meta.order}. {meta.label}
                    </h3>
                    <p className="muscle-curriculum-module__desc">{meta.description}</p>
                  </div>
                </div>

                <div className="muscle-curriculum-module__units">
                  {units.map((unit) => {
                    const isUnlocked = isUnitUnlocked(unit.id, completedUnitIds);
                    const isCompleted = completedUnitIds.includes(unit.id);
                    const isActive = unit.id === activeUnitId;

                    return (
                      <button
                        key={unit.id}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => selectUnit(unit.id)}
                        className={`muscle-curriculum-unit-btn ${
                          isActive ? 'is-active' : ''
                        } ${isCompleted ? 'is-completed' : ''} ${
                          !isUnlocked ? 'is-locked' : ''
                        }`}
                      >
                        <div className="muscle-curriculum-unit-btn__status">
                          {isCompleted ? '✓' : !isUnlocked ? '🔒' : isActive ? '▶' : '○'}
                        </div>
                        <div className="muscle-curriculum-unit-btn__body">
                          <div className="muscle-curriculum-unit-btn__title">
                            {unit.title}
                            <span className="muscle-curriculum-unit-btn__type-tag">
                              {unit.type === 'text' ? 'Text' : '3D'}
                            </span>
                          </div>
                          <div className="muscle-curriculum-unit-btn__sub">
                            {unit.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
