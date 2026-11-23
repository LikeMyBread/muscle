import type { Object3D } from 'three';
import { Box3, Vector3 } from 'three';
import { resolveCurriculumNodeId } from '../../curriculum';
import type { CameraPreset } from '../../types/node';

const box = new Box3();
const center = new Vector3();
const size = new Vector3();
const fallbackViewDir = new Vector3(0.35, 0.12, 1).normalize();
const offset = new Vector3();
const position = new Vector3();

export function findSceneObjectForNodeId(
  scene: Object3D,
  nodeId: string,
  preferredSide?: 'left' | 'right' | null,
): Object3D | null {
  const candidates: Object3D[] = [];
  scene.traverse((child) => {
    const resolved = resolveCurriculumNodeId(child.name);
    if (resolved === nodeId || child.name === nodeId) {
      candidates.push(child);
    }
  });

  if (candidates.length === 0) return null;
  if (!preferredSide || candidates.length === 1) return candidates[0]!;

  // 1. Check direct userData.side
  for (const obj of candidates) {
    if (obj.userData?.side === preferredSide) {
      return obj;
    }
  }

  // 2. Check ancestor hierarchy for 'anatomy-half-study' / 'skeletal-kinematics-left' (left)
  // vs 'anatomy-half-reference' / 'skeletal-kinematics-right' (right)
  for (const obj of candidates) {
    let cur: Object3D | null = obj;
    while (cur) {
      if (cur.userData?.side === preferredSide) return obj;
      if (
        preferredSide === 'left' &&
        (cur.name === 'anatomy-half-study' || cur.name === 'skeletal-kinematics-left')
      ) {
        return obj;
      }
      if (
        preferredSide === 'right' &&
        (cur.name === 'anatomy-half-reference' || cur.name === 'skeletal-kinematics-right')
      ) {
        return obj;
      }
      cur = cur.parent;
    }
  }

  // 3. Check world position: study side is +X (anatomical left), reference side is -X (anatomical right)
  const pos = new Vector3();
  for (const obj of candidates) {
    obj.getWorldPosition(pos);
    if (preferredSide === 'left' && pos.x >= -0.01) return obj;
    if (preferredSide === 'right' && pos.x < 0.01) return obj;
  }

  return candidates[0]!;
}

export function computeFramingPresetFromObject(
  object: Object3D,
  viewFrom?: Vector3,
  distanceScale = 2.6,
): CameraPreset {
  object.updateWorldMatrix(true, false);
  box.setFromObject(object);
  if (box.isEmpty()) {
    return { position: [0, 0.95, 2.85], target: [0, 0.875, 0] };
  }
  box.getCenter(center);
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z, 0.04);
  const distance = Math.max(0.85, maxDim * distanceScale);

  if (viewFrom) {
    offset.subVectors(viewFrom, center);
  } else {
    offset.copy(fallbackViewDir);
  }
  if (offset.lengthSq() < 1e-4) {
    offset.copy(fallbackViewDir);
  }
  offset.normalize().multiplyScalar(distance);
  position.copy(center).add(offset);

  return {
    position: [position.x, position.y, position.z],
    target: [center.x, center.y, center.z],
  };
}

export function computeFramingPresetFromLayout(
  layoutPosition: [number, number, number],
  layoutScale: [number, number, number] | number,
  viewFrom?: Vector3,
): CameraPreset {
  const maxDim =
    typeof layoutScale === 'number'
      ? layoutScale
      : Math.max(layoutScale[0], layoutScale[1], layoutScale[2], 0.04);
  const distance = Math.max(0.85, maxDim * 3.2);
  center.set(layoutPosition[0], layoutPosition[1], layoutPosition[2]);

  if (viewFrom) {
    offset.subVectors(viewFrom, center);
  } else {
    offset.copy(fallbackViewDir);
  }
  if (offset.lengthSq() < 1e-4) {
    offset.copy(fallbackViewDir);
  }
  offset.normalize().multiplyScalar(distance);
  position.copy(center).add(offset);

  return {
    position: [position.x, position.y, position.z],
    target: layoutPosition,
  };
}
