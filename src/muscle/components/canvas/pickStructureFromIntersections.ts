import { Vector3, type Intersection, type Object3D } from 'three';
import { getNodeById, resolveCurriculumNodeId } from '../../curriculum';
import { isNodeVisibleAtPeelDepth, type LayerPeelDepth } from '../../layerDepthView';
import type { MuscleMemoryNode } from '../../types/node';

const TYPE_PRIORITY: Record<MuscleMemoryNode['type'], number> = {
  muscle: 0,
  joint: 1,
  bone: 2,
};

export type PickedStructureDetails = {
  nodeId: string;
  object: Object3D;
  point: Vector3;
  side: 'left' | 'right';
};

export function resolveSideFromObjectOrPoint(object: Object3D, point?: Vector3): 'left' | 'right' {
  if (object.userData?.side === 'left' || object.userData?.side === 'right') {
    return object.userData.side;
  }
  let cur: Object3D | null = object;
  while (cur) {
    if (cur.userData?.side === 'left' || cur.name === 'anatomy-half-study' || cur.name === 'skeletal-kinematics-left') {
      return 'left';
    }
    if (cur.userData?.side === 'right' || cur.name === 'anatomy-half-reference' || cur.name === 'skeletal-kinematics-right') {
      return 'right';
    }
    cur = cur.parent;
  }
  if (point) {
    return point.x >= 0 ? 'left' : 'right';
  }
  const pos = new Vector3();
  object.getWorldPosition(pos);
  return pos.x >= 0 ? 'left' : 'right';
}

export function nodeIdFromRaycastObject(object: Object3D): string | undefined {
  if (object.name.endsWith('__atlas_mirror')) return undefined;
  return resolveCurriculumNodeId(object.name);
}

/** Prefer superficial (low layerDepth) structures when a ray hits stacked anatomy, returning full hit details. */
export function pickStructureDetailsFromIntersections(
  intersections: readonly Intersection[],
  peelDepth: LayerPeelDepth,
): PickedStructureDetails | undefined {
  const candidates: Array<{
    nodeId: string;
    layerDepth: number;
    typeRank: number;
    distance: number;
    object: Object3D;
    point: Vector3;
  }> = [];

  for (const hit of intersections) {
    const nodeId = nodeIdFromRaycastObject(hit.object);
    if (!nodeId) continue;
    const node = getNodeById(nodeId);
    if (!node || !isNodeVisibleAtPeelDepth(node, peelDepth)) continue;
    candidates.push({
      nodeId,
      layerDepth: node.layerDepth,
      typeRank: TYPE_PRIORITY[node.type],
      distance: hit.distance,
      object: hit.object,
      point: hit.point,
    });
  }

  if (candidates.length === 0) return undefined;

  candidates.sort((a, b) => {
    if (a.layerDepth !== b.layerDepth) return a.layerDepth - b.layerDepth;
    if (a.typeRank !== b.typeRank) return a.typeRank - b.typeRank;
    return a.distance - b.distance;
  });

  const best = candidates[0]!;
  return {
    nodeId: best.nodeId,
    object: best.object,
    point: best.point,
    side: resolveSideFromObjectOrPoint(best.object, best.point),
  };
}

/** Prefer superficial (low layerDepth) structures when a ray hits stacked anatomy. */
export function pickStructureFromIntersections(
  intersections: readonly Intersection[],
  peelDepth: LayerPeelDepth,
): string | undefined {
  return pickStructureDetailsFromIntersections(intersections, peelDepth)?.nodeId;
}
