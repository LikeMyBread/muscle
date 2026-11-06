import { describe, it, expect } from 'vitest';
import {
  calculateStaleness,
  getEligibleReviewCandidates,
  selectStalestReviewItems,
  buildStudyQueueWithReview,
} from './stalenessReview';
import type { StudyUnit } from '../study/types';

describe('stalenessReview pure SRS algorithms', () => {
  describe('calculateStaleness', () => {
    it('returns full globalQuestionCount when item was never seen', () => {
      expect(calculateStaleness('item_a', 25, {})).toBe(25);
    });

    it('returns difference between global count and lastSeen', () => {
      expect(calculateStaleness('item_a', 30, { item_a: 10 })).toBe(20);
    });

    it('clamps negative differences to 0', () => {
      expect(calculateStaleness('item_a', 10, { item_a: 15 })).toBe(0);
    });
  });

  describe('getEligibleReviewCandidates', () => {
    const unit1: StudyUnit = {
      id: 'unit_1',
      moduleId: 'anatomy_terms',
      title: 'Planes',
      subtitle: 'Planes',
      type: 'text',
      groupName: 'Planes',
      itemIds: ['term_sagittal', 'term_coronal', 'term_transverse'],
    };

    const unit2: StudyUnit = {
      id: 'unit_2',
      moduleId: 'anatomy_terms',
      title: 'Directions',
      subtitle: 'Directions',
      type: 'text',
      groupName: 'Directions',
      itemIds: ['term_anterior', 'term_posterior', 'term_medial'],
    };

    const unit3D: StudyUnit = {
      id: 'unit_3d_bones',
      moduleId: 'fundamentals',
      title: 'Skull',
      subtitle: 'Skull',
      type: '3d',
      groupName: 'Bones',
      itemIds: ['bone_frontal', 'bone_mandible'],
    };

    const allUnits = [unit1, unit2, unit3D];

    it('returns items from prior units matching current unit type', () => {
      const candidates = getEligibleReviewCandidates({
        currentUnit: unit2,
        allUnits,
        completedUnitIds: [],
      });

      expect(candidates).toEqual(['term_sagittal', 'term_coronal', 'term_transverse']);
    });

    it('excludes items that belong to the current unit', () => {
      const candidates = getEligibleReviewCandidates({
        currentUnit: unit1,
        allUnits,
        completedUnitIds: ['unit_1'],
      });

      expect(candidates).toEqual([]);
    });

    it('does not mix text and 3D units', () => {
      const candidates = getEligibleReviewCandidates({
        currentUnit: unit3D,
        allUnits,
        completedUnitIds: ['unit_1', 'unit_2'],
      });

      // unit1 and unit2 are text, unit3D is 3d, so no text candidates in 3D unit
      expect(candidates).toEqual([]);
    });

    it('includes completed units even if after current in order', () => {
      const candidates = getEligibleReviewCandidates({
        currentUnit: unit1,
        allUnits,
        completedUnitIds: ['unit_2'],
      });

      expect(candidates).toEqual(['term_anterior', 'term_posterior', 'term_medial']);
    });
  });

  describe('selectStalestReviewItems', () => {
    it('returns empty when candidate pool is empty', () => {
      const res = selectStalestReviewItems({
        candidateIds: [],
        globalQuestionCount: 50,
        itemLastSeen: {},
      });
      expect(res).toEqual([]);
    });

    it('sorts candidates descending by staleness', () => {
      const candidates = ['item_a', 'item_b', 'item_c'];
      // Global count: 100
      // item_a seen at 90 (staleness 10)
      // item_b seen at 20 (staleness 80 - stalest)
      // item_c seen at 60 (staleness 40)
      const res = selectStalestReviewItems({
        candidateIds: candidates,
        globalQuestionCount: 100,
        itemLastSeen: {
          item_a: 90,
          item_b: 20,
          item_c: 60,
        },
        maxReviewCount: 2,
        minStaleness: 5,
      });

      expect(res).toEqual(['item_b', 'item_c']);
    });

    it('filters out items with staleness below minStaleness', () => {
      const candidates = ['item_fresh', 'item_stale'];
      // Global count: 10
      // item_fresh seen at 9 (staleness 1 < minStaleness 3)
      // item_stale seen at 2 (staleness 8 >= minStaleness 3)
      const res = selectStalestReviewItems({
        candidateIds: candidates,
        globalQuestionCount: 10,
        itemLastSeen: {
          item_fresh: 9,
          item_stale: 2,
        },
        maxReviewCount: 2,
        minStaleness: 3,
      });

      expect(res).toEqual(['item_stale']);
    });
  });

  describe('buildStudyQueueWithReview', () => {
    const unit1: StudyUnit = {
      id: 'unit_1',
      moduleId: 'anatomy_terms',
      title: 'Planes',
      subtitle: 'Planes',
      type: 'text',
      groupName: 'Planes',
      itemIds: ['term_sagittal', 'term_coronal'],
    };

    const unit2: StudyUnit = {
      id: 'unit_2',
      moduleId: 'anatomy_terms',
      title: 'Directions',
      subtitle: 'Directions',
      type: 'text',
      groupName: 'Directions',
      itemIds: ['term_anterior', 'term_posterior', 'term_superior'],
    };

    it('builds queue with both new items and stalest review items', () => {
      const deterministicRng = () => 0.5; // deterministic shuffle
      const { queue, reviewItemIds } = buildStudyQueueWithReview({
        unit: unit2,
        allUnits: [unit1, unit2],
        completedUnitIds: ['unit_1'],
        globalQuestionCount: 30,
        itemLastSeen: {
          term_sagittal: 5, // staleness 25
          term_coronal: 15, // staleness 15
        },
        maxReviewCount: 1,
        minStaleness: 2,
        rng: deterministicRng,
      });

      expect(reviewItemIds).toEqual(['term_sagittal']);
      expect(queue.length).toBe(4); // 3 new + 1 review
      const reviewItem = queue.find((q) => q.id === 'term_sagittal');
      expect(reviewItem?.isReview).toBe(true);

      const newItem = queue.find((q) => q.id === 'term_anterior');
      expect(newItem?.isReview).toBe(false);
    });

    it('builds queue with 0 review items if no prior units exist', () => {
      const { queue, reviewItemIds } = buildStudyQueueWithReview({
        unit: unit1,
        allUnits: [unit1, unit2],
        completedUnitIds: [],
        globalQuestionCount: 0,
        itemLastSeen: {},
      });

      expect(reviewItemIds).toEqual([]);
      expect(queue.length).toBe(2);
      expect(queue.every((q) => q.isReview === false)).toBe(true);
    });
  });
});
