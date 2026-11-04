import { create } from 'zustand';
import { useMuscleStore } from '../store/useMuscleStore';
import { getNodeById } from '../curriculum';
import { getAnatomyTermById } from '../curriculum/anatomyTerms';
import {
  STUDY_UNITS,
  getUnitById,
  isGraduatedTo3D,
  isUnitUnlocked,
} from './studyCurriculum';
import {
  createInitialQueue,
  getNextQueueTarget,
  recordCorrectAnswer,
  recordIncorrectAnswer,
  isQueueComplete,
  getQueueProgress,
} from './studyQueue';
import { generateQuestionForTarget } from './questionGenerator';
import type { AppMode, QueueItem, StudyAnswerFeedback, StudyQuestion, StudyUnit } from './types';

const STORAGE_KEY_COMPLETED_UNITS = 'muscle_study_completed_units_v1';
const STORAGE_KEY_ACTIVE_UNIT = 'muscle_study_active_unit_v1';
const STORAGE_KEY_APP_MODE = 'muscle_app_mode_v1';
const STORAGE_KEY_DEBUG_UNLOCK = 'muscle_debug_unlock_curriculum_v1';

export function isDebugUnlockRequested(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (
      params.has('unlock') ||
      params.has('unlockAll') ||
      params.has('debugUnlock') ||
      params.get('debug') === '1' ||
      params.get('debug') === 'true'
    ) {
      return true;
    }
    return localStorage.getItem(STORAGE_KEY_DEBUG_UNLOCK) === 'true';
  } catch {
    return false;
  }
}

export function saveStoredDebugUnlock(unlocked: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_DEBUG_UNLOCK, unlocked ? 'true' : 'false');
  } catch {
    // Ignore storage quota
  }
}

function loadStoredCompletedUnits(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLETED_UNITS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredCompletedUnits(completed: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_COMPLETED_UNITS, JSON.stringify(completed));
  } catch {
    // Ignore storage quota
  }
}

function loadStoredAppMode(): AppMode {
  if (typeof window === 'undefined') return 'selection';
  try {
    const val = localStorage.getItem(STORAGE_KEY_APP_MODE);
    if (val === 'study' || val === 'reference' || val === 'selection') {
      return val;
    }
    return 'selection';
  } catch {
    return 'selection';
  }
}

function saveStoredAppMode(mode: AppMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_APP_MODE, mode);
  } catch {
    // Ignore storage quota
  }
}

function loadStoredActiveUnit(): string {
  if (typeof window === 'undefined') return STUDY_UNITS[0].id;
  try {
    const val = localStorage.getItem(STORAGE_KEY_ACTIVE_UNIT);
    if (val && getUnitById(val)) return val;
    return STUDY_UNITS[0].id;
  } catch {
    return STUDY_UNITS[0].id;
  }
}

function saveStoredActiveUnit(unitId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_UNIT, unitId);
  } catch {
    // Ignore storage quota
  }
}

export interface StudyStoreState {
  appMode: AppMode;
  activeUnitId: string;
  completedUnitIds: string[];
  debugUnlocked: boolean;
  activeQueue: QueueItem[];
  currentQuestion: StudyQuestion | null;
  lastTargetId: string | null;
  feedback: StudyAnswerFeedback | null;
  unitCompleted: boolean;
  navOpen: boolean;

  setAppMode: (mode: AppMode) => void;
  setNavOpen: (open: boolean) => void;
  setDebugUnlock: (unlocked: boolean) => void;
  toggleDebugUnlock: () => void;
  selectUnit: (unitId: string) => void;
  submitAnswer: (choiceId: string) => void;
  nextQuestion: () => void;
  restartCurrentUnit: () => void;
  syncCanvasForQuestion: (question: StudyQuestion | null) => void;
}

export const useStudyStore = create<StudyStoreState>((set, get) => {
  const initialCompleted = loadStoredCompletedUnits();
  const initialAppMode = loadStoredAppMode();
  const initialActiveUnitId = loadStoredActiveUnit();
  const initialDebugUnlocked = isDebugUnlockRequested();
  if (initialDebugUnlocked) {
    useMuscleStore.getState().setDebugCurriculumUnlocked(true);
  }

  return {
    appMode: initialAppMode,
    activeUnitId: initialActiveUnitId,
    completedUnitIds: initialCompleted,
    debugUnlocked: initialDebugUnlocked,
    activeQueue: [],
    currentQuestion: null,
    lastTargetId: null,
    feedback: null,
    unitCompleted: false,
    navOpen: false,

    setDebugUnlock: (unlocked: boolean) => {
      saveStoredDebugUnlock(unlocked);
      set({ debugUnlocked: unlocked });
      useMuscleStore.getState().setDebugCurriculumUnlocked(unlocked);
    },

    toggleDebugUnlock: () => {
      const next = !get().debugUnlocked;
      get().setDebugUnlock(next);
    },

    setAppMode: (mode: AppMode) => {
      saveStoredAppMode(mode);
      set({ appMode: mode });

      const muscleStore = useMuscleStore.getState();
      if (mode === 'study') {
        muscleStore.setStudyActive(true);
        // Ensure initial unit is initialized
        const state = get();
        if (!state.currentQuestion) {
          state.selectUnit(state.activeUnitId);
        }
      } else {
        muscleStore.setStudyActive(false);
      }
    },

    setNavOpen: (open: boolean) => {
      set({ navOpen: open });
    },

    syncCanvasForQuestion: (question: StudyQuestion | null) => {
      const muscleStore = useMuscleStore.getState();
      if (!question || question.type !== '3d') {
        muscleStore.setStudyTarget(null, null, 'idle');
        return;
      }

      // Switch module if needed
      if (muscleStore.activeModuleId !== question.moduleId || muscleStore.bodyView !== 'region') {
        muscleStore.setBodyView('region');
        muscleStore.setActiveModule(question.moduleId);
      }

      // Set optimal layer peel depth (e.g., bones hide muscles)
      muscleStore.setLayerPeelDepth(question.bestPeelDepth);

      // Focus camera on the target structure
      muscleStore.setStudyTarget(question.targetId, null, 'idle');
      muscleStore.focusStructure(question.targetId);
    },

    selectUnit: (unitId: string) => {
      const unit = getUnitById(unitId);
      if (!unit) return;

      saveStoredActiveUnit(unitId);
      const queue = createInitialQueue(unit.itemIds);
      const nextTarget = getNextQueueTarget(queue);
      const firstQuestion = nextTarget ? generateQuestionForTarget(nextTarget.id, unit) : null;

      set({
        activeUnitId: unitId,
        activeQueue: queue,
        currentQuestion: firstQuestion,
        lastTargetId: nextTarget ? nextTarget.id : null,
        feedback: null,
        unitCompleted: false,
        navOpen: false,
      });

      get().syncCanvasForQuestion(firstQuestion);
    },

    submitAnswer: (choiceId: string) => {
      const { currentQuestion, activeQueue, activeUnitId } = get();
      if (!currentQuestion) return;

      const unit = getUnitById(activeUnitId);
      if (!unit) return;

      const targetId = currentQuestion.targetId;
      const isCorrect = choiceId === targetId;

      let updatedQueue: QueueItem[];
      let twoSidedReinforcement: StudyAnswerFeedback['twoSidedReinforcement'] = null;
      let message = '';

      const muscleStore = useMuscleStore.getState();

      if (isCorrect) {
        const result = recordCorrectAnswer(activeQueue, targetId);
        updatedQueue = result.updatedQueue;
        message = `Correct! That's the ${currentQuestion.targetName}.`;

        if (currentQuestion.type === '3d') {
          muscleStore.setStudyTarget(targetId, null, 'correct');
        }
      } else {
        const result = recordIncorrectAnswer(activeQueue, targetId, choiceId);
        updatedQueue = result.updatedQueue;

        // Find display names for target and chosen mistake
        let mistakeName = choiceId;
        if (currentQuestion.type === 'text') {
          mistakeName = getAnatomyTermById(choiceId)?.label ?? choiceId;
        } else {
          mistakeName = getNodeById(choiceId)?.name ?? choiceId;
        }

        message = `Incorrect. You chose "${mistakeName}", but the correct answer is "${currentQuestion.targetName}".`;

        twoSidedReinforcement = {
          targetId,
          targetName: currentQuestion.targetName,
          mistakeId: choiceId,
          mistakeName,
          explanation: `Both "${currentQuestion.targetName}" and "${mistakeName}" have been added to your queue to reinforce the difference.`,
        };

        if (currentQuestion.type === '3d') {
          // Highlight target in blue and mistake in red side-by-side
          muscleStore.setStudyTarget(targetId, choiceId, 'incorrect');

          // If the mistake node is visible at a different peel depth, adjust peel depth to show both
          const targetNode = getNodeById(targetId);
          const mistakeNode = getNodeById(choiceId);
          if (targetNode && mistakeNode) {
            const minPeel = Math.min(targetNode.layerDepth, mistakeNode.layerDepth) as 0 | 1 | 2 | 3;
            muscleStore.setLayerPeelDepth(minPeel);
          }
        }
      }

      set({
        activeQueue: updatedQueue,
        feedback: {
          answered: true,
          isCorrect,
          selectedId: choiceId,
          targetId,
          message,
          twoSidedReinforcement,
        },
      });
    },

    nextQuestion: () => {
      const { activeQueue, activeUnitId, completedUnitIds, lastTargetId } = get();
      const unit = getUnitById(activeUnitId);
      if (!unit) return;

      if (isQueueComplete(activeQueue)) {
        // Unit completed!
        const nextCompleted = completedUnitIds.includes(activeUnitId)
          ? completedUnitIds
          : [...completedUnitIds, activeUnitId];
        saveStoredCompletedUnits(nextCompleted);

        set({
          completedUnitIds: nextCompleted,
          unitCompleted: true,
          feedback: null,
          currentQuestion: null,
        });

        useMuscleStore.getState().setStudyTarget(null, null, 'idle');
        return;
      }

      // Next question from queue
      const nextTarget = getNextQueueTarget(activeQueue, lastTargetId);
      if (!nextTarget) {
        set({ unitCompleted: true });
        return;
      }

      const question = generateQuestionForTarget(nextTarget.id, unit);
      set({
        currentQuestion: question,
        lastTargetId: nextTarget.id,
        feedback: null,
      });

      get().syncCanvasForQuestion(question);
    },

    restartCurrentUnit: () => {
      get().selectUnit(get().activeUnitId);
    },
  };
});
