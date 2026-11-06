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
import { generateQuestionForTarget, computeBestPeelDepthForNode } from './questionGenerator';
import { buildStudyQueueWithReview } from '../srs/stalenessReview';
import { saveStudyItemSeen, loadStudyStalenessLog } from '../db/muscleDb';
import type { AppMode, QueueItem, StudyAnswerFeedback, StudyPhase, StudyQuestion, StudyUnit } from './types';

const STORAGE_KEY_COMPLETED_UNITS = 'muscle_study_completed_units_v1';
const STORAGE_KEY_ACTIVE_UNIT = 'muscle_study_active_unit_v1';
const STORAGE_KEY_APP_MODE = 'muscle_app_mode_v1';
const STORAGE_KEY_DEBUG_UNLOCK = 'muscle_debug_unlock_curriculum_v1';
const STORAGE_KEY_GLOBAL_QUESTION_COUNT = 'muscle_study_global_question_count_v1';
const STORAGE_KEY_ITEM_LAST_SEEN = 'muscle_study_item_last_seen_v1';

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
  if (typeof window === 'undefined') return 'study';
  try {
    const val = localStorage.getItem(STORAGE_KEY_APP_MODE);
    if (val === 'study' || val === 'reference') {
      return val;
    }
    return 'study';
  } catch {
    return 'study';
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

function loadStoredGlobalQuestionCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GLOBAL_QUESTION_COUNT);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function saveStoredGlobalQuestionCount(count: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_GLOBAL_QUESTION_COUNT, String(count));
  } catch {
    // Ignore storage quota
  }
}

function loadStoredItemLastSeenLog(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEM_LAST_SEEN);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveStoredItemLastSeenLog(log: Record<string, number>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ITEM_LAST_SEEN, JSON.stringify(log));
  } catch {
    // Ignore storage quota
  }
}

export interface StudyStoreState {
  appMode: AppMode;
  activeUnitId: string;
  completedUnitIds: string[];
  debugUnlocked: boolean;
  unitPhase: StudyPhase;
  lessonIndex: number;
  globalQuestionCount: number;
  itemLastSeenLog: Record<string, number>;
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
  startUnitQuiz: () => void;
  nextLessonStep: () => void;
  prevLessonStep: () => void;
  setLessonStep: (index: number) => void;
  reviewLesson: () => void;
  submitAnswer: (choiceId: string) => void;
  nextQuestion: () => void;
  restartCurrentUnit: () => void;
  syncCanvasForQuestion: (question: StudyQuestion | null) => void;
  syncCanvasForLessonItem: (itemId: string, unit: StudyUnit) => void;
}

export const useStudyStore = create<StudyStoreState>((set, get) => {
  const initialCompleted = loadStoredCompletedUnits();
  const initialAppMode = loadStoredAppMode();
  const initialActiveUnitId = loadStoredActiveUnit();
  const initialDebugUnlocked = isDebugUnlockRequested();
  const initialGlobalCount = loadStoredGlobalQuestionCount();
  const initialItemLastSeen = loadStoredItemLastSeenLog();

  if (initialDebugUnlocked) {
    useMuscleStore.getState().setDebugCurriculumUnlocked(true);
  }
  if (initialAppMode === 'study') {
    useMuscleStore.getState().setStudyActive(true);
  }

  const initialUnit = getUnitById(initialActiveUnitId);
  const initialDeck = initialUnit
    ? buildStudyQueueWithReview({
        unit: initialUnit,
        allUnits: STUDY_UNITS,
        completedUnitIds: initialCompleted,
        globalQuestionCount: initialGlobalCount,
        itemLastSeen: initialItemLastSeen,
      })
    : { queue: [], reviewItemIds: [] };

  const initialQueue = initialDeck.queue;
  const initialTarget = initialQueue.length ? getNextQueueTarget(initialQueue) : null;
  const initialQuestion =
    initialTarget && initialUnit
      ? generateQuestionForTarget(initialTarget.id, initialUnit, initialTarget.isReview)
      : null;

  // Asynchronously hydrate IndexedDB Dexie stats if available
  if (typeof window !== 'undefined') {
    loadStudyStalenessLog()
      .then((dexieMap) => {
        if (dexieMap && dexieMap.size > 0) {
          const currentLog = get().itemLastSeenLog;
          const merged: Record<string, number> = { ...currentLog };
          let changed = false;
          for (const [id, count] of dexieMap.entries()) {
            if (merged[id] === undefined || merged[id] < count) {
              merged[id] = count;
              changed = true;
            }
          }
          if (changed) {
            saveStoredItemLastSeenLog(merged);
            set({ itemLastSeenLog: merged });
          }
        }
      })
      .catch(() => {});
  }

  return {
    appMode: initialAppMode,
    activeUnitId: initialActiveUnitId,
    completedUnitIds: initialCompleted,
    debugUnlocked: initialDebugUnlocked,
    unitPhase: 'lesson',
    lessonIndex: 0,
    globalQuestionCount: initialGlobalCount,
    itemLastSeenLog: initialItemLastSeen,
    activeQueue: initialQueue,
    currentQuestion: initialQuestion,
    lastTargetId: initialTarget ? initialTarget.id : null,
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
        const state = get();
        if (state.unitPhase === 'quiz' && state.currentQuestion) {
          state.syncCanvasForQuestion(state.currentQuestion);
        } else {
          const unit = getUnitById(state.activeUnitId);
          if (unit && unit.itemIds.length > 0) {
            state.syncCanvasForLessonItem(unit.itemIds[state.lessonIndex] ?? unit.itemIds[0], unit);
          }
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

      muscleStore.setStudyActive(true);

      // Switch module if needed
      if (muscleStore.activeModuleId !== question.moduleId || muscleStore.bodyView !== 'region') {
        muscleStore.setBodyView('region');
        muscleStore.setActiveModule(question.moduleId);
      }

      // Set optimal layer peel depth
      muscleStore.setLayerPeelDepth(question.bestPeelDepth);

      // Focus camera on the target structure
      muscleStore.setStudyTarget(question.targetId, null, 'idle');
      muscleStore.focusStructure(question.targetId);
    },

    syncCanvasForLessonItem: (itemId: string, unit: StudyUnit) => {
      const muscleStore = useMuscleStore.getState();
      if (unit.type !== '3d') {
        muscleStore.setStudyTarget(null, null, 'idle');
        return;
      }

      const node = getNodeById(itemId);
      if (!node) return;

      muscleStore.setStudyActive(true);

      if (muscleStore.activeModuleId !== unit.moduleId || muscleStore.bodyView !== 'region') {
        muscleStore.setBodyView('region');
        muscleStore.setActiveModule(unit.moduleId);
      }

      const peel = computeBestPeelDepthForNode(node);
      muscleStore.setLayerPeelDepth(peel);
      muscleStore.setStudyTarget(itemId, null, 'idle');
      muscleStore.focusStructure(itemId);
    },

    selectUnit: (unitId: string) => {
      const unit = getUnitById(unitId);
      if (!unit) return;

      saveStoredActiveUnit(unitId);

      const { queue } = buildStudyQueueWithReview({
        unit,
        allUnits: STUDY_UNITS,
        completedUnitIds: get().completedUnitIds,
        globalQuestionCount: get().globalQuestionCount,
        itemLastSeen: get().itemLastSeenLog,
      });

      const nextTarget = getNextQueueTarget(queue);
      const firstQuestion = nextTarget
        ? generateQuestionForTarget(nextTarget.id, unit, nextTarget.isReview)
        : null;

      set({
        activeUnitId: unitId,
        unitPhase: 'lesson',
        lessonIndex: 0,
        activeQueue: queue,
        currentQuestion: firstQuestion,
        lastTargetId: nextTarget ? nextTarget.id : null,
        feedback: null,
        unitCompleted: false,
        navOpen: false,
      });

      if (unit.type === '3d' && unit.itemIds.length > 0) {
        get().syncCanvasForLessonItem(unit.itemIds[0], unit);
      }
    },

    startUnitQuiz: () => {
      const { currentQuestion, activeQueue, lastTargetId, activeUnitId } = get();
      const unit = getUnitById(activeUnitId);
      if (!unit) return;

      let question = currentQuestion;
      if (!question) {
        const nextTarget = getNextQueueTarget(activeQueue, lastTargetId);
        if (nextTarget) {
          question = generateQuestionForTarget(nextTarget.id, unit, nextTarget.isReview);
        }
      }

      set({
        unitPhase: 'quiz',
        currentQuestion: question,
      });

      get().syncCanvasForQuestion(question);
    },

    nextLessonStep: () => {
      const { activeUnitId, lessonIndex } = get();
      const unit = getUnitById(activeUnitId);
      if (!unit) return;

      const nextIndex = Math.min(lessonIndex + 1, unit.itemIds.length - 1);
      set({ lessonIndex: nextIndex });

      const nextItemId = unit.itemIds[nextIndex];
      if (nextItemId) {
        get().syncCanvasForLessonItem(nextItemId, unit);
      }
    },

    prevLessonStep: () => {
      const { activeUnitId, lessonIndex } = get();
      const unit = getUnitById(activeUnitId);
      if (!unit) return;

      const prevIndex = Math.max(0, lessonIndex - 1);
      set({ lessonIndex: prevIndex });

      const prevItemId = unit.itemIds[prevIndex];
      if (prevItemId) {
        get().syncCanvasForLessonItem(prevItemId, unit);
      }
    },

    setLessonStep: (index: number) => {
      const { activeUnitId } = get();
      const unit = getUnitById(activeUnitId);
      if (!unit) return;

      const safeIndex = Math.max(0, Math.min(index, unit.itemIds.length - 1));
      set({ lessonIndex: safeIndex });

      const itemId = unit.itemIds[safeIndex];
      if (itemId) {
        get().syncCanvasForLessonItem(itemId, unit);
      }
    },

    reviewLesson: () => {
      const { activeUnitId } = get();
      const unit = getUnitById(activeUnitId);
      set({
        unitPhase: 'lesson',
        lessonIndex: 0,
      });

      if (unit && unit.type === '3d' && unit.itemIds.length > 0) {
        get().syncCanvasForLessonItem(unit.itemIds[0], unit);
      }
    },

    submitAnswer: (choiceId: string) => {
      const { currentQuestion, activeQueue, activeUnitId, globalQuestionCount, itemLastSeenLog } =
        get();
      if (!currentQuestion) return;

      const unit = getUnitById(activeUnitId);
      if (!unit) return;

      const targetId = currentQuestion.targetId;
      const isCorrect = choiceId === targetId;

      // Update question log and staleness metrics
      const nextGlobalCount = globalQuestionCount + 1;
      const nextItemLastSeen = {
        ...itemLastSeenLog,
        [targetId]: nextGlobalCount,
      };

      saveStoredGlobalQuestionCount(nextGlobalCount);
      saveStoredItemLastSeenLog(nextItemLastSeen);
      saveStudyItemSeen(targetId, nextGlobalCount);

      let updatedQueue: QueueItem[];
      let twoSidedReinforcement: StudyAnswerFeedback['twoSidedReinforcement'] = null;
      let message = '';

      const muscleStore = useMuscleStore.getState();

      if (isCorrect) {
        const result = recordCorrectAnswer(activeQueue, targetId);
        updatedQueue = result.updatedQueue;

        const reviewPrefix = currentQuestion.isReview ? '🔄 Review Mastered! ' : '';
        message = `${reviewPrefix}Correct! That's the ${currentQuestion.targetName}.`;

        if (currentQuestion.type === '3d') {
          muscleStore.setStudyTarget(targetId, null, 'correct');
        } else {
          muscleStore.setStudyTarget(null, null, 'correct');
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

        const reviewPrefix = currentQuestion.isReview ? '🔄 Review Check: ' : '';
        message = `${reviewPrefix}Incorrect. You chose "${mistakeName}", but the correct answer is "${currentQuestion.targetName}".`;

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

          const targetNode = getNodeById(targetId);
          const mistakeNode = getNodeById(choiceId);
          if (targetNode && mistakeNode) {
            const minPeel = Math.min(targetNode.layerDepth, mistakeNode.layerDepth) as 0 | 1 | 2 | 3;
            muscleStore.setLayerPeelDepth(minPeel);
          }
        } else {
          muscleStore.setStudyTarget(null, null, 'incorrect');
        }
      }

      set({
        globalQuestionCount: nextGlobalCount,
        itemLastSeenLog: nextItemLastSeen,
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

      const question = generateQuestionForTarget(nextTarget.id, unit, nextTarget.isReview);
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
