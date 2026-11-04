import Dexie, { type Table } from 'dexie';
import type { ModuleGuideProgress, WorkoutProgress } from '../types/node';

export class MuscleDB extends Dexie {
  workoutProgress!: Table<WorkoutProgress, string>;
  moduleGuideProgress!: Table<ModuleGuideProgress, string>;
  quizPreferences!: Table<{ moduleId: string; quizMode: string }, string>;

  constructor() {
    super('muscle-memory');
    this.version(1).stores({
      workoutProgress: 'nodeId, state, nextReviewDate',
    });
    this.version(2).stores({
      workoutProgress: 'nodeId, state, nextReviewDate',
      moduleGuideProgress: 'moduleId, phase',
      quizPreferences: 'moduleId',
    });
  }
}

export const muscleDb = new MuscleDB();

export async function loadAllProgress(): Promise<Map<string, WorkoutProgress>> {
  try {
    const rows = await muscleDb.workoutProgress.toArray();
    return new Map(rows.map((row) => [row.nodeId, row]));
  } catch {
    return new Map();
  }
}

export async function saveProgress(progress: WorkoutProgress): Promise<void> {
  try {
    await muscleDb.workoutProgress.put(progress);
  } catch {
    // Ignore storage write error in headless/unsupported environments
  }
}

export async function loadModuleGuideProgress(): Promise<Map<string, ModuleGuideProgress>> {
  try {
    const rows = await muscleDb.moduleGuideProgress.toArray();
    return new Map(rows.map((row) => [row.moduleId, row]));
  } catch {
    return new Map();
  }
}

export async function saveModuleGuideProgress(progress: ModuleGuideProgress): Promise<void> {
  try {
    await muscleDb.moduleGuideProgress.put(progress);
  } catch {
    // Ignore storage write error in headless/unsupported environments
  }
}

export async function loadQuizModePreference(moduleId: string): Promise<string | null> {
  try {
    const row = await muscleDb.quizPreferences.get(moduleId);
    return row?.quizMode ?? null;
  } catch {
    return null;
  }
}

export async function saveQuizModePreference(moduleId: string, quizMode: string): Promise<void> {
  try {
    await muscleDb.quizPreferences.put({ moduleId, quizMode });
  } catch {
    // Ignore storage write error in headless/unsupported environments
  }
}
