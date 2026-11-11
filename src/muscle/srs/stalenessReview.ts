import type { QueueItem, StudyUnit } from '../study/types';
import { shuffleQueueItems } from '../study/studyQueue';

export interface StalenessLog {
  globalQuestionCount: number;
  itemLastSeen: Record<string, number>;
}

/**
 * Calculates how many questions have passed since the user last encountered an item.
 * If never seen in logged questions, staleness equals the total questions answered (maximal staleness).
 */
export function calculateStaleness(
  itemId: string,
  globalQuestionCount: number,
  itemLastSeen: Record<string, number>,
): number {
  const lastSeen = itemLastSeen[itemId];
  if (lastSeen === undefined) {
    return globalQuestionCount;
  }
  return Math.max(0, globalQuestionCount - lastSeen);
}

/**
 * Gathers candidate item IDs strictly from units earlier in the curriculum than `currentUnit`
 * that match the current unit's presentation type (text vs 3D) and are not part of the current unit.
 * Never pulls candidates from units at or later than `currentUnit` in `allUnits`.
 */
export function getEligibleReviewCandidates(params: {
  currentUnit: StudyUnit;
  allUnits: StudyUnit[];
  completedUnitIds?: string[];
}): string[] {
  const { currentUnit, allUnits } = params;
  const currentItemSet = new Set(currentUnit.itemIds);

  const currentIndex = allUnits.findIndex((u) => u.id === currentUnit.id);
  if (currentIndex <= 0) {
    return [];
  }

  const eligibleUnits = allUnits.filter((u, index) => {
    if (index >= currentIndex) return false;
    if (u.id === currentUnit.id) return false;
    if (u.type !== currentUnit.type) return false;
    return true;
  });

  const candidates: string[] = [];
  const seenCandidateIds = new Set<string>();

  for (const unit of eligibleUnits) {
    for (const itemId of unit.itemIds) {
      if (!currentItemSet.has(itemId) && !seenCandidateIds.has(itemId)) {
        seenCandidateIds.add(itemId);
        candidates.push(itemId);
      }
    }
  }

  return candidates;
}

/**
 * Selects the stalest review items based on how many questions have elapsed since last seen.
 * Items with higher staleness are prioritized. Items seen very recently (staleness < minStaleness)
 * are excluded to prevent immediate re-asking.
 */
export function selectStalestReviewItems(params: {
  candidateIds: string[];
  globalQuestionCount: number;
  itemLastSeen: Record<string, number>;
  maxReviewCount?: number;
  minStaleness?: number;
}): string[] {
  const {
    candidateIds,
    globalQuestionCount,
    itemLastSeen,
    maxReviewCount = 2,
    minStaleness = 2,
  } = params;

  if (candidateIds.length === 0 || maxReviewCount <= 0) {
    return [];
  }

  // Calculate staleness for each candidate
  const withStaleness = candidateIds.map((id) => ({
    id,
    staleness: calculateStaleness(id, globalQuestionCount, itemLastSeen),
  }));

  // Only consider items that have aged at least minStaleness questions
  const qualified = withStaleness.filter((item) => item.staleness >= minStaleness);

  // Sort descending by staleness (stalest first). Tie-break deterministically by ID
  qualified.sort((a, b) => {
    if (b.staleness !== a.staleness) {
      return b.staleness - a.staleness;
    }
    return a.id.localeCompare(b.id);
  });

  return qualified.slice(0, maxReviewCount).map((item) => item.id);
}

/**
 * Builds the initial study queue for a unit, combining the unit's new items
 * with periodically selected stalest review items from previous lessons,
 * and shuffles the full set automatically.
 */
export function buildStudyQueueWithReview(params: {
  unit: StudyUnit;
  allUnits: StudyUnit[];
  completedUnitIds: string[];
  globalQuestionCount: number;
  itemLastSeen: Record<string, number>;
  maxReviewCount?: number;
  minStaleness?: number;
  rng?: () => number;
}): { queue: QueueItem[]; reviewItemIds: string[] } {
  const {
    unit,
    allUnits,
    completedUnitIds,
    globalQuestionCount,
    itemLastSeen,
    maxReviewCount,
    minStaleness = 2,
    rng = Math.random,
  } = params;

  // Compute how many review items to pull based on unit size
  // E.g., 1 review for 3 items, up to 2-3 for larger sets
  const computedMaxReview =
    maxReviewCount ?? Math.min(3, Math.max(1, Math.round(unit.itemIds.length * 0.35)));

  const candidates = getEligibleReviewCandidates({
    currentUnit: unit,
    allUnits,
    completedUnitIds,
  });

  const reviewItemIds = selectStalestReviewItems({
    candidateIds: candidates,
    globalQuestionCount,
    itemLastSeen,
    maxReviewCount: computedMaxReview,
    minStaleness,
  });

  // Create queue items for the new unit items
  const newQueueItems: QueueItem[] = unit.itemIds.map((id) => ({
    id,
    requiredRemaining: 1,
    totalAttempts: 0,
    incorrectAttempts: 0,
    confusedWith: [],
    isReview: false,
  }));

  // Create queue items for the periodic review items
  const reviewQueueItems: QueueItem[] = reviewItemIds.map((id) => ({
    id,
    requiredRemaining: 1,
    totalAttempts: 0,
    incorrectAttempts: 0,
    confusedWith: [],
    isReview: true,
  }));

  // Interleave and shuffle the combined set
  const combined = [...newQueueItems, ...reviewQueueItems];
  const queue = shuffleQueueItems(combined, rng);

  return { queue, reviewItemIds };
}
