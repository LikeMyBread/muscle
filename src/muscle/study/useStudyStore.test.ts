import { describe, expect, it, beforeEach } from 'vitest';
import { useStudyStore } from './useStudyStore';
import { getUnitById } from './studyCurriculum';
import { useMuscleStore } from '../store/useMuscleStore';

describe('useStudyStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useStudyStore.setState({
      completedUnitIds: [],
      globalQuestionCount: 0,
      itemLastSeenLog: {},
    });
    const store = useStudyStore.getState();
    store.selectUnit('unit_terms_planes');
  });

  it('initializes queue, current question, and starts in lesson phase on unit selection', () => {
    const store = useStudyStore.getState();
    expect(store.activeUnitId).toBe('unit_terms_planes');
    expect(store.unitPhase).toBe('lesson');
    expect(store.lessonIndex).toBe(0);
    expect(store.activeQueue.length).toBeGreaterThan(0);
    expect(store.currentQuestion).not.toBeNull();
    expect(store.feedback).toBeNull();
  });

  it('navigates lesson steps and starts quiz', () => {
    const store = useStudyStore.getState();
    expect(store.unitPhase).toBe('lesson');
    expect(store.lessonIndex).toBe(0);

    store.nextLessonStep();
    expect(useStudyStore.getState().lessonIndex).toBe(1);

    store.prevLessonStep();
    expect(useStudyStore.getState().lessonIndex).toBe(0);

    store.startUnitQuiz();
    expect(useStudyStore.getState().unitPhase).toBe('quiz');

    store.reviewLesson();
    expect(useStudyStore.getState().unitPhase).toBe('lesson');
    expect(useStudyStore.getState().lessonIndex).toBe(0);
  });

  it('correctly handles correct answer submission and updates staleness log', () => {
    const store = useStudyStore.getState();
    store.startUnitQuiz();
    const targetId = store.currentQuestion!.targetId;
    const initialCount = store.globalQuestionCount;

    store.submitAnswer(targetId);

    const updated = useStudyStore.getState();
    expect(updated.feedback).not.toBeNull();
    expect(updated.feedback?.isCorrect).toBe(true);
    expect(updated.feedback?.twoSidedReinforcement).toBeNull();
    expect(updated.globalQuestionCount).toBe(initialCount + 1);
    expect(updated.itemLastSeenLog[targetId]).toBe(initialCount + 1);
  });

  it('correctly handles incorrect answer submission with two-sided reinforcement', () => {
    const store = useStudyStore.getState();
    store.startUnitQuiz();
    const targetId = store.currentQuestion!.targetId;
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
    expect(useMuscleStore.getState().studyActive).toBe(false);
  });

  it('updates 3D visual target and mistake on correct/incorrect answers during quiz', () => {
    // Select a 3D unit
    useStudyStore.getState().selectUnit('unit_fund_head_torso');
    // Start quiz
    useStudyStore.getState().startUnitQuiz();

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

  it('automatically shuffles active queue on unit selection', () => {
    const store = useStudyStore.getState();
    store.selectUnit('unit_terms_planes');
    const unitQueue = useStudyStore.getState().activeQueue;
    expect(unitQueue).toHaveLength(5);
    const ids = unitQueue.map((q) => q.id).sort();
    expect(ids).toEqual([
      'term_anatomical_position',
      'term_plane_coronal',
      'term_plane_sagittal',
      'term_plane_transverse',
      'term_planes_overview',
    ]);
  });

  it('never pulls spaced review items from later units when revisiting an earlier lesson', () => {
    useStudyStore.setState({
      completedUnitIds: [
        'unit_terms_planes',
        'unit_terms_locations',
        'unit_terms_movement',
        'unit_terms_joints',
      ],
      globalQuestionCount: 50,
      itemLastSeenLog: {
        term_anterior: 5,
        term_flexion: 1,
        term_joint_hinge: 1,
        term_plane_sagittal: 10,
      },
    });

    // Unit 1 has no prior lessons, so no spaced review items can appear
    useStudyStore.getState().selectUnit('unit_terms_planes');
    const unit1Queue = useStudyStore.getState().activeQueue;
    expect(unit1Queue.every((q) => !q.isReview)).toBe(true);
    expect(unit1Queue).toHaveLength(5);

    // Unit 2 can only review Unit 1 items, never later units (movement / joints)
    useStudyStore.getState().selectUnit('unit_terms_locations');
    const unit2Queue = useStudyStore.getState().activeQueue;
    const reviewItems = unit2Queue.filter((q) => q.isReview);
    const unit1ItemIds = new Set(getUnitById('unit_terms_planes')!.itemIds);
    expect(reviewItems.length).toBeGreaterThan(0);
    for (const reviewItem of reviewItems) {
      expect(unit1ItemIds.has(reviewItem.id)).toBe(true);
    }
  });
});
