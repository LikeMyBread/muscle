import { describe, expect, it } from 'vitest';
import {
  createInitialQueue,
  getNextQueueTarget,
  recordCorrectAnswer,
  recordIncorrectAnswer,
  isQueueComplete,
  getQueueProgress,
  REQUIRED_REPS_ON_MISTAKE,
} from './studyQueue';

describe('studyQueue two-sided reinforcement', () => {
  it('initializes each item with 1 required repetition', () => {
    const queue = createInitialQueue(['skull', 'femur']);
    expect(queue).toHaveLength(2);
    expect(queue[0].requiredRemaining).toBe(1);
    expect(queue[1].requiredRemaining).toBe(1);
    expect(isQueueComplete(queue)).toBe(false);
  });

  it('completes an item upon a single correct answer when no mistakes made', () => {
    let queue = createInitialQueue(['skull', 'femur']);
    const res1 = recordCorrectAnswer(queue, 'skull');
    queue = res1.updatedQueue;

    expect(res1.itemMastered).toBe(true);
    expect(queue.find((i) => i.id === 'skull')?.requiredRemaining).toBe(0);
    expect(isQueueComplete(queue)).toBe(false);

    const res2 = recordCorrectAnswer(queue, 'femur');
    queue = res2.updatedQueue;

    expect(res2.itemMastered).toBe(true);
    expect(isQueueComplete(queue)).toBe(true);
  });

  it('adds BOTH target and mistaken distractor to queue on incorrect answer (two-sided principle)', () => {
    let queue = createInitialQueue(['skull']);

    // User is shown 'skull' but incorrectly chooses 'femur'
    const result = recordIncorrectAnswer(queue, 'skull', 'femur');
    queue = result.updatedQueue;

    expect(queue).toHaveLength(2); // 'femur' was inserted!

    const skullItem = queue.find((i) => i.id === 'skull')!;
    const femurItem = queue.find((i) => i.id === 'femur')!;

    // Both must require multiple repetitions (at least 2)
    expect(skullItem.requiredRemaining).toBeGreaterThanOrEqual(REQUIRED_REPS_ON_MISTAKE);
    expect(femurItem.requiredRemaining).toBeGreaterThanOrEqual(REQUIRED_REPS_ON_MISTAKE);

    // Confusion cross-references are recorded
    expect(skullItem.confusedWith).toContain('femur');
    expect(femurItem.confusedWith).toContain('skull');

    // Neither is complete yet
    expect(isQueueComplete(queue)).toBe(false);

    // Answering skull once does NOT clear it
    queue = recordCorrectAnswer(queue, 'skull').updatedQueue;
    expect(queue.find((i) => i.id === 'skull')?.requiredRemaining).toBe(1);
    expect(isQueueComplete(queue)).toBe(false);

    // Answering femur once does NOT clear it
    queue = recordCorrectAnswer(queue, 'femur').updatedQueue;
    expect(queue.find((i) => i.id === 'femur')?.requiredRemaining).toBe(1);
    expect(isQueueComplete(queue)).toBe(false);

    // Answering both a second time clears the queue
    queue = recordCorrectAnswer(queue, 'skull').updatedQueue;
    queue = recordCorrectAnswer(queue, 'femur').updatedQueue;

    expect(isQueueComplete(queue)).toBe(true);
  });

  it('getNextQueueTarget avoids immediate repetition when other pending items exist', () => {
    const queue = createInitialQueue(['a', 'b', 'c']);
    const target1 = getNextQueueTarget(queue, null);
    expect(target1?.id).toBe('a');

    const target2 = getNextQueueTarget(queue, 'a');
    expect(target2?.id).toBe('b');
  });

  it('computes accurate progress metrics', () => {
    let queue = createInitialQueue(['a', 'b']);
    let progress = getQueueProgress(queue);
    expect(progress.progressPercent).toBe(0);
    expect(progress.masteredCount).toBe(0);
    expect(progress.inReviewCount).toBe(0);

    // Error on 'a'
    queue = recordIncorrectAnswer(queue, 'a', 'x').updatedQueue;
    progress = getQueueProgress(queue);
    expect(progress.inReviewCount).toBeGreaterThan(0);

    // Complete 'b'
    queue = recordCorrectAnswer(queue, 'b').updatedQueue;
    progress = getQueueProgress(queue);
    expect(progress.masteredCount).toBe(1);
  });
});
