import { describe, expect, it, beforeEach } from 'vitest';
import { useStudyStore } from './useStudyStore';
import { useMuscleStore } from '../store/useMuscleStore';

describe('useStudyStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useStudyStore.getState();
    store.selectUnit('unit_terms_planes');
  });

  it('initializes queue and current question when unit is selected', () => {
    const store = useStudyStore.getState();
    expect(store.activeUnitId).toBe('unit_terms_planes');
    expect(store.activeQueue.length).toBeGreaterThan(0);
    expect(store.currentQuestion).not.toBeNull();
    expect(store.feedback).toBeNull();
  });

  it('correctly handles correct answer submission', () => {
    const store = useStudyStore.getState();
    const targetId = store.currentQuestion!.targetId;

    store.submitAnswer(targetId);

    const updated = useStudyStore.getState();
    expect(updated.feedback).not.toBeNull();
    expect(updated.feedback?.isCorrect).toBe(true);
    expect(updated.feedback?.twoSidedReinforcement).toBeNull();
  });

  it('correctly handles incorrect answer submission with two-sided reinforcement', () => {
    const store = useStudyStore.getState();
    const targetId = store.currentQuestion!.targetId;
    // Find an incorrect choice
    const wrongChoice = store.currentQuestion!.choices.find((c) => c.id !== targetId)!.id;

    store.submitAnswer(wrongChoice);

    const updated = useStudyStore.getState();
    expect(updated.feedback).not.toBeNull();
    expect(updated.feedback?.isCorrect).toBe(false);
    expect(updated.feedback?.twoSidedReinforcement).not.toBeNull();
    expect(updated.feedback?.twoSidedReinforcement?.targetId).toBe(targetId);
    expect(updated.feedback?.twoSidedReinforcement?.mistakeId).toBe(wrongChoice);

    // Both target and mistake must now be in activeQueue with requiredRemaining >= 2
    const targetItem = updated.activeQueue.find((i) => i.id === targetId);
    const mistakeItem = updated.activeQueue.find((i) => i.id === wrongChoice);

    expect(targetItem).toBeDefined();
    expect(targetItem!.requiredRemaining).toBeGreaterThanOrEqual(2);
    expect(mistakeItem).toBeDefined();
    expect(mistakeItem!.requiredRemaining).toBeGreaterThanOrEqual(2);
  });

  it('switches app mode and updates muscleStore studyActive flag', () => {
    const store = useStudyStore.getState();
    store.setAppMode('study');

    expect(useStudyStore.getState().appMode).toBe('study');
    expect(useMuscleStore.getState().studyActive).toBe(true);

    store.setAppMode('reference');
    expect(useStudyStore.getState().appMode).toBe('reference');
    expect(useMuscleStore.getState().studyActive).toBe(false);
  });
});
