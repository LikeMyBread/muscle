/**
 * Live mesh inventory for ?debug — updated by FullBodyRegionModel.
 */
import {
  REQUIRED_FULL_BODY_BONE_IDS,
  REQUIRED_FULL_BODY_MUSCLE_IDS,
} from '../anatomy/requiredMeshIds';
import { useStudyStore } from '../study/useStudyStore';
import { useMuscleStore } from '../store/useMuscleStore';

export type MuscleAnatomyDebugSnapshot = {
  anatomyNodeIds: string[];
  updatedAt: number;
};

let snapshot: MuscleAnatomyDebugSnapshot = {
  anatomyNodeIds: [],
  updatedAt: 0,
};

const listeners = new Set<() => void>();

export function getMuscleAnatomyDebugSnapshot(): MuscleAnatomyDebugSnapshot {
  return snapshot;
}

export function setMuscleAnatomyDebugAnatomy(nodeIds: readonly string[]): void {
  snapshot = {
    ...snapshot,
    anatomyNodeIds: [...new Set(nodeIds)].sort(),
    updatedAt: Date.now(),
  };
  for (const listener of listeners) listener();
}

export function subscribeMuscleAnatomyDebug(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

declare global {
  interface Window {
    __MUSCLE_ANATOMY_DEBUG__?: MuscleAnatomyDebugSnapshot & {
      unlockAllCurriculum?: () => void;
      lockCurriculum?: () => void;
      isCurriculumUnlocked?: () => boolean;
    };
    __ANATOMY_DEBUG__?: {
      unlockAllCurriculum: () => void;
      lockCurriculum: () => void;
      isCurriculumUnlocked: () => boolean;
      snapshot: MuscleAnatomyDebugSnapshot;
    };
  }
}

export function publishMuscleAnatomyDebugWindow(): void {
  if (typeof window === 'undefined') return;
  const snapshot = getMuscleAnatomyDebugSnapshot();

  const debugUnlockActions = {
    unlockAllCurriculum: () => {
      useStudyStore.getState().setDebugUnlock(true);
      useMuscleStore.getState().setDebugCurriculumUnlocked(true);
      console.log('🔓 [Anatomy Debug] All curriculum units unlocked.');
    },
    lockCurriculum: () => {
      useStudyStore.getState().setDebugUnlock(false);
      useMuscleStore.getState().setDebugCurriculumUnlocked(false);
      console.log('🔒 [Anatomy Debug] Curriculum locks restored.');
    },
    isCurriculumUnlocked: () => useStudyStore.getState().debugUnlocked,
  };

  window.__MUSCLE_ANATOMY_DEBUG__ = {
    ...snapshot,
    ...debugUnlockActions,
  };

  window.__ANATOMY_DEBUG__ = {
    ...debugUnlockActions,
    snapshot,
  };

  const existingLabsDebug =
    typeof window.__LABS_DEBUG__ === 'object' && window.__LABS_DEBUG__ !== null
      ? (window.__LABS_DEBUG__ as Record<string, unknown>)
      : {};

  window.__LABS_DEBUG__ = {
    ...existingLabsDebug,
    ...debugUnlockActions,
    muscleAnatomy: snapshot,
    missingRequiredBones: REQUIRED_FULL_BODY_BONE_IDS.filter(
      (id) => !snapshot.anatomyNodeIds.includes(id),
    ),
    missingRequiredMuscles: REQUIRED_FULL_BODY_MUSCLE_IDS.filter(
      (id) => !snapshot.anatomyNodeIds.includes(id),
    ),
  };
}
