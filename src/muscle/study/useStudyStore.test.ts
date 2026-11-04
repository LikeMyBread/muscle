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

  it('toggles debug curriculum unlock and synchronizes with muscleStore', () => {
    const store = useStudyStore.getState();
    store.setDebugUnlock(false);
    expect(useStudyStore.getState().debugUnlocked).toBe(false);
    expect(useMuscleStore.getState().debugCurriculumUnlocked).toBe(false);

    store.toggleDebugUnlock();
    expect(useStudyStore.getState().debugUnlocked).toBe(true);
    expect(useMuscleStore.getState().debugCurriculumUnlocked).toBe(true);

    store.toggleDebugUnlock();
    expect(useStudyStore.getState().debugUnlocked).toBe(false);
    expect(useMuscleStore.getState().debugCurriculumUnlocked).toBe(false);
  });

  it('suppresses hoveredNodeId when studyActive is true', () => {
    const muscleStore = useMuscleStore.getState();
    muscleStore.setStudyActive(true);

    muscleStore.setHoveredNodeId('bone_sternum');
    expect(useMuscleStore.getState().hoveredNodeId).toBeNull();

    muscleStore.setStudyActive(false);
    muscleStore.setHoveredNodeId('bone_sternum');
    // flush hover raf
    expect(useMuscleStore.getState().studyActive).toBe(false);
  });

  it('updates 3D visual target and mistake on correct/incorrect answers', () => {
    // Select a 3D unit
    useStudyStore.getState().selectUnit('unit_fund_head_torso');
    const question1 = useStudyStore.getState().currentQuestion;
    expect(question1).not.toBeNull();
    expect(question1?.type).toBe('3d');

    const targetId = question1!.targetId;
    const wrongChoice = question1!.choices.find((c) => c.id !== targetId)!.id;

    // Initial 3D state
    expect(useMuscleStore.getState().studyActive).toBe(true);
    expect(useMuscleStore.getState().studyTargetNodeId).toBe(targetId);
    expect(useMuscleStore.getState().studyAnswerState).toBe('idle');

    // Incorrect answer
    useStudyStore.getState().submitAnswer(wrongChoice);
    expect(useMuscleStore.getState().studyTargetNodeId).toBe(targetId);
    expect(useMuscleStore.getState().studyMistakeNodeId).toBe(wrongChoice);
    expect(useMuscleStore.getState().studyAnswerState).toBe('incorrect');

    // Advance to next question
    useStudyStore.getState().nextQuestion();
    const question2 = useStudyStore.getState().currentQuestion;
    const nextTargetId = question2!.targetId;
    expect(useMuscleStore.getState().studyTargetNodeId).toBe(nextTargetId);
    expect(useMuscleStore.getState().studyMistakeNodeId).toBeNull();
    expect(useMuscleStore.getState().studyAnswerState).toBe('idle');

    // Correct answer
    useStudyStore.getState().submitAnswer(nextTargetId);
    expect(useMuscleStore.getState().studyTargetNodeId).toBe(nextTargetId);
    expect(useMuscleStore.getState().studyAnswerState).toBe('correct');
  });

  it('manages question order randomization mode and toggling', () => {
    const store = useStudyStore.getState();
    store.setRandomizeOrder(false);
    expect(useStudyStore.getState().randomizeOrder).toBe(false);

    store.toggleRandomizeOrder();
    expect(useStudyStore.getState().randomizeOrder).toBe(true);

    store.toggleRandomizeOrder();
    expect(useStudyStore.getState().randomizeOrder).toBe(false);

    // Initializing a unit when randomizeOrder is false preserves unit itemIds order
    store.selectUnit('unit_terms_planes');
    const unitQueue = useStudyStore.getState().activeQueue;
    expect(unitQueue[0].id).toBe('term_anatomical_position');

    // When toggled to randomized, queue is reordered
    store.setRandomizeOrder(true);
    expect(useStudyStore.getState().randomizeOrder).toBe(true);
    expect(useStudyStore.getState().activeQueue).toHaveLength(unitQueue.length);
  });
});
