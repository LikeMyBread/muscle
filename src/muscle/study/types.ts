import type { LayerPeelDepth } from '../layerDepthView';
import type { MuscleRegion } from '../types/node';

export type AppMode = 'study' | 'reference';

export type StudyPhase = 'lesson' | 'quiz';

export type StudyUnitType = 'text' | '3d';

export interface StudyUnit {
  id: string;
  moduleId: MuscleRegion;
  title: string;
  subtitle: string;
  type: StudyUnitType;
  groupName: string;
  itemIds: string[];
  prerequisiteUnitId?: string;
}

export interface QueueItem {
  id: string;
  requiredRemaining: number;
  totalAttempts: number;
  incorrectAttempts: number;
  confusedWith: string[];
  isReview?: boolean;
}

export interface StudyChoice {
  id: string;
  text: string;
}

export interface StudyQuestion {
  id: string;
  unitId: string;
  type: StudyUnitType;
  targetId: string;
  targetName: string;
  prompt: string;
  category?: string;
  choices: StudyChoice[];
  bestPeelDepth: LayerPeelDepth;
  cameraPresetKey?: string;
  moduleId: MuscleRegion;
  explanation?: string;
  isReview?: boolean;
}

export interface TwoSidedReinforcement {
  targetId: string;
  targetName: string;
  mistakeId: string;
  mistakeName: string;
  explanation: string;
}

export interface StudyAnswerFeedback {
  answered: boolean;
  isCorrect: boolean;
  selectedId: string;
  targetId: string;
  message: string;
  twoSidedReinforcement: TwoSidedReinforcement | null;
}
