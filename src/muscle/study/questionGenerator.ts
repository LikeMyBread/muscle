import { ANATOMY_TERM_BY_ID, ANATOMY_TERMS } from '../curriculum/anatomyTerms';
import { getNodeById, getNodesForRegion } from '../curriculum';
import { collectStudyGroupIdsForNode } from '../curriculum/resolveStudyGroupForNode';
import { findUnitByItemId } from './studyCurriculum';
import type { LayerPeelDepth } from '../layerDepthView';
import type { MuscleMemoryNode, MuscleRegion } from '../types/node';
import type { StudyChoice, StudyQuestion, StudyUnit } from './types';

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Computes the optimal layer peel depth for viewing a node.
 * Bony landmarks hide muscles (peel 3 = Skeleton); deep muscles peel superficial ones.
 */
export function computeBestPeelDepthForNode(node: MuscleMemoryNode): LayerPeelDepth {
  if (node.type === 'bone' || node.type === 'joint') {
    return 3; // Skeleton view
  }
  if (node.layerDepth >= 3) return 3;
  if (node.layerDepth === 2) return 2; // Deep
  if (node.layerDepth === 1) return 1; // Intermediate
  return 0; // Superficial / full muscle
}

/**
 * Generates a multiple-choice text question for an anatomy term.
 */
export function generateTextQuestion(termId: string, unit: StudyUnit): StudyQuestion | null {
  const term = ANATOMY_TERM_BY_ID.get(termId);
  if (!term) return null;

  // Decide question variant: definition, opposite, or example
  let prompt = term.definition;
  let category = term.category.replace('_', ' ').toUpperCase();

  if (term.oppositeTermId && Math.random() > 0.6) {
    const opp = ANATOMY_TERM_BY_ID.get(term.oppositeTermId);
    if (opp) {
      prompt = `What is the anatomical opposite or counterpart of "${opp.label}"?`;
      category = 'ANATOMICAL PAIR';
    }
  }

  // Gather distractors from the same unit, category, or general terms
  const unitTermIds = unit.itemIds.filter((id) => id !== termId);
  const sameCategory = ANATOMY_TERMS.filter(
    (t) => t.category === term.category && t.id !== termId,
  ).map((t) => t.id);

  const candidatePool = Array.from(new Set([...unitTermIds, ...sameCategory]));
  const shuffledCandidates = shuffle(candidatePool);
  const chosenDistractorIds = shuffledCandidates.slice(0, 3);

  // If fewer than 3, grab from any anatomy term
  if (chosenDistractorIds.length < 3) {
    const others = ANATOMY_TERMS.filter(
      (t) => t.id !== termId && !chosenDistractorIds.includes(t.id),
    ).map((t) => t.id);
    for (const otherId of shuffle(others)) {
      if (chosenDistractorIds.length >= 3) break;
      chosenDistractorIds.push(otherId);
    }
  }

  const choices: StudyChoice[] = shuffle([
    {
      id: term.id,
      text: term.label,
    },
    ...chosenDistractorIds.map((id) => {
      const dist = ANATOMY_TERM_BY_ID.get(id);
      return {
        id,
        text: dist?.label ?? id,
      };
    }),
  ]);

  return {
    id: `q_text_${term.id}_${Date.now()}`,
    unitId: unit.id,
    type: 'text',
    targetId: term.id,
    targetName: term.label,
    prompt,
    category,
    choices,
    bestPeelDepth: 0,
    moduleId: unit.moduleId,
    explanation: `${term.label}: ${term.definition}${term.example ? ` (Example: ${term.example})` : ''}`,
  };
}

/**
 * Generates a multiple-choice question for a 3D anatomical feature.
 * The 3 distractors are pulled from the SAME anatomical group (e.g. deltoids, rotator cuff, quadriceps),
 * challenging the learner to distinguish between closely related neighboring structures.
 */
export function generate3DQuestion(nodeId: string, unit: StudyUnit): StudyQuestion | null {
  const targetNode = getNodeById(nodeId);
  if (!targetNode) return null;

  const bestPeelDepth = computeBestPeelDepthForNode(targetNode);

  // Look up same-group candidates
  const groupNodeIds = collectStudyGroupIdsForNode(nodeId, { moduleId: unit.moduleId });
  const otherGroupNodes = (groupNodeIds ?? []).filter((id) => id !== nodeId);

  // Unit nodes from same unit
  const otherUnitNodes = unit.itemIds.filter(
    (id) => id !== nodeId && !otherGroupNodes.includes(id),
  );

  // Module nodes from same region
  const regionNodes = getNodesForRegion(unit.moduleId)
    .map((n) => n.id)
    .filter((id) => id !== nodeId && !otherGroupNodes.includes(id) && !otherUnitNodes.includes(id));

  const distractorCandidates = [
    ...shuffle(otherGroupNodes),
    ...shuffle(otherUnitNodes),
    ...shuffle(regionNodes),
  ];

  const chosenDistractorIds = distractorCandidates.slice(0, 3);

  // If still fewer than 3, fallback to fundamentals / landmarks
  if (chosenDistractorIds.length < 3) {
    const fundamentals = getNodesForRegion('fundamentals')
      .map((n) => n.id)
      .filter((id) => id !== nodeId && !chosenDistractorIds.includes(id));
    for (const fId of shuffle(fundamentals)) {
      if (chosenDistractorIds.length >= 3) break;
      chosenDistractorIds.push(fId);
    }
  }

  const choices: StudyChoice[] = shuffle([
    {
      id: targetNode.id,
      text: targetNode.name,
    },
    ...chosenDistractorIds.map((id) => {
      const node = getNodeById(id);
      return {
        id,
        text: node?.name ?? id,
      };
    }),
  ]);

  return {
    id: `q_3d_${targetNode.id}_${Date.now()}`,
    unitId: unit.id,
    type: '3d',
    targetId: targetNode.id,
    targetName: targetNode.name,
    prompt: 'Identify the highlighted anatomical structure:',
    category: `${unit.groupName.toUpperCase()} • ${targetNode.type.toUpperCase()}`,
    choices,
    bestPeelDepth,
    cameraPresetKey: targetNode.cameraPresetKey,
    moduleId: unit.moduleId,
    explanation: `${targetNode.name}: ${targetNode.details.definition}`,
  };
}

/**
 * Universal question generator dispatcher.
 */
export function generateQuestionForTarget(
  targetId: string,
  unit: StudyUnit,
  isReview = false,
): StudyQuestion | null {
  // If target belongs to another unit (periodic review), use its origin unit for contextual distractors
  const effectiveUnit = findUnitByItemId(targetId) ?? unit;

  let question: StudyQuestion | null = null;
  if (effectiveUnit.type === 'text') {
    question = generateTextQuestion(targetId, effectiveUnit);
  } else {
    question = generate3DQuestion(targetId, effectiveUnit);
  }

  if (question && isReview) {
    question.isReview = true;
  }

  return question;
}
