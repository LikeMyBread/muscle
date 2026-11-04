import type { QueueItem } from './types';

export const REQUIRED_REPS_ON_MISTAKE = 2;

/**
 * Standard in-place Fisher-Yates array shuffle returning a new copy.
 */
export function shuffleQueueItems<T>(items: T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Creates the initial active queue for a study unit with automatically shuffled questions.
 */
export function createInitialQueue(
  itemIds: string[],
  rng: () => number = Math.random,
): QueueItem[] {
  const shuffledIds = shuffleQueueItems(itemIds, rng);

  return shuffledIds.map((id) => ({
    id,
    requiredRemaining: 1,
    totalAttempts: 0,
    incorrectAttempts: 0,
    confusedWith: [],
  }));
}

/**
 * Selects the next item to present. Avoids repeating the last asked item immediately
 * if other active items are waiting in the queue, and randomly selects among the
 * eligible pending items.
 */
export function getNextQueueTarget(
  queue: QueueItem[],
  lastTargetId: string | null = null,
  rng: () => number = Math.random,
): QueueItem | null {
  const pending = queue.filter((item) => item.requiredRemaining > 0);
  if (pending.length === 0) return null;
  if (pending.length === 1) return pending[0];

  const differentPending = pending.filter((item) => item.id !== lastTargetId);
  const candidatePool = differentPending.length > 0 ? differentPending : pending;

  const index = Math.floor(rng() * candidatePool.length);
  return candidatePool[index];
}

/**
 * Decrements the required repetitions for the target on a correct answer.
 */
export function recordCorrectAnswer(
  queue: QueueItem[],
  targetId: string,
): { updatedQueue: QueueItem[]; itemMastered: boolean } {
  let itemMastered = false;

  const updatedQueue = queue.map((item) => {
    if (item.id !== targetId) return item;

    const remaining = Math.max(0, item.requiredRemaining - 1);
    if (remaining === 0 && item.requiredRemaining > 0) {
      itemMastered = true;
    }

    return {
      ...item,
      requiredRemaining: remaining,
      totalAttempts: item.totalAttempts + 1,
    };
  });

  return { updatedQueue, itemMastered };
}

/**
 * Two-Sided Reinforcement:
 * Adds/updates both the target question and the incorrectly selected distractor
 * so the user must correctly answer questions about BOTH multiple times before advancing.
 */
export function recordIncorrectAnswer(
  queue: QueueItem[],
  targetId: string,
  mistakeId: string,
): { updatedQueue: QueueItem[]; targetItem: QueueItem; mistakeItem: QueueItem } {
  let targetFound = false;
  let mistakeFound = false;

  let newQueue = queue.map((item) => {
    if (item.id === targetId) {
      targetFound = true;
      const confused = item.confusedWith.includes(mistakeId)
        ? item.confusedWith
        : [...item.confusedWith, mistakeId];
      return {
        ...item,
        requiredRemaining: Math.max(item.requiredRemaining + 1, REQUIRED_REPS_ON_MISTAKE),
        totalAttempts: item.totalAttempts + 1,
        incorrectAttempts: item.incorrectAttempts + 1,
        confusedWith: confused,
      };
    }

    if (item.id === mistakeId) {
      mistakeFound = true;
      const confused = item.confusedWith.includes(targetId)
        ? item.confusedWith
        : [...item.confusedWith, targetId];
      return {
        ...item,
        requiredRemaining: Math.max(item.requiredRemaining + 1, REQUIRED_REPS_ON_MISTAKE),
        confusedWith: confused,
      };
    }

    return item;
  });

  // If target wasn't found in queue, add it
  if (!targetFound) {
    newQueue.push({
      id: targetId,
      requiredRemaining: REQUIRED_REPS_ON_MISTAKE,
      totalAttempts: 1,
      incorrectAttempts: 1,
      confusedWith: [mistakeId],
    });
  }

  // If the chosen distractor wasn't already in the unit queue, insert it!
  // This challenges the user's understanding of what they mistakenly identified.
  if (!mistakeFound) {
    newQueue.push({
      id: mistakeId,
      requiredRemaining: REQUIRED_REPS_ON_MISTAKE,
      totalAttempts: 0,
      incorrectAttempts: 0,
      confusedWith: [targetId],
    });
  }

  const targetItem = newQueue.find((item) => item.id === targetId)!;
  const mistakeItem = newQueue.find((item) => item.id === mistakeId)!;

  return { updatedQueue: newQueue, targetItem, mistakeItem };
}

export function isQueueComplete(queue: QueueItem[]): boolean {
  if (queue.length === 0) return true;
  return queue.every((item) => item.requiredRemaining <= 0);
}

export function getQueueProgress(queue: QueueItem[]): {
  totalItems: number;
  masteredCount: number;
  pendingCount: number;
  inReviewCount: number;
  progressPercent: number;
} {
  const totalItems = queue.length;
  if (totalItems === 0) {
    return {
      totalItems: 0,
      masteredCount: 0,
      pendingCount: 0,
      inReviewCount: 0,
      progressPercent: 100,
    };
  }

  const masteredCount = queue.filter((i) => i.requiredRemaining <= 0).length;
  const pendingCount = queue.filter((i) => i.requiredRemaining > 0).length;
  const inReviewCount = queue.filter((i) => i.incorrectAttempts > 0 && i.requiredRemaining > 0).length;
  const progressPercent = Math.round((masteredCount / totalItems) * 100);

  return {
    totalItems,
    masteredCount,
    pendingCount,
    inReviewCount,
    progressPercent,
  };
}
