import { describe, expect, it } from 'vitest';
import { isNodeVisibleAtPeelDepth } from '../../layerDepthView';
import { referenceColorForNode } from './referenceHalfVisuals';
import type { MuscleMemoryNode } from '../../types/node';
import { getNodeById } from '../../curriculum';

describe('GlbPoseMesh layer visibility and styling invariants', () => {
  const superficialMuscle: MuscleMemoryNode = {
    id: 'test_superficial',
    name: 'Test Superficial',
    type: 'muscle',
    region: 'torso',
    layerDepth: 0,
    isSurfaceForm: true,
    primitiveShape: 'cylinder',
    details: { definition: 'Test definition' },
  };

  const intermediateMuscle: MuscleMemoryNode = {
    id: 'test_intermediate',
    name: 'Test Intermediate',
    type: 'muscle',
    region: 'torso',
    layerDepth: 1,
    isSurfaceForm: false,
    primitiveShape: 'cylinder',
    details: { definition: 'Test definition' },
  };

  const deepMuscle: MuscleMemoryNode = {
    id: 'test_deep',
    name: 'Test Deep',
    type: 'muscle',
    region: 'torso',
    layerDepth: 2,
    isSurfaceForm: false,
    primitiveShape: 'cylinder',
    details: { definition: 'Test definition' },
  };

  const boneNode: MuscleMemoryNode = {
    id: 'test_bone',
    name: 'Test Bone',
    type: 'bone',
    region: 'torso',
    layerDepth: 3,
    isSurfaceForm: true,
    primitiveShape: 'cylinder',
    details: { definition: 'Test definition' },
  };

  it('hides layers progressively as layerPeelDepth is adjusted', () => {
    // Depth 0: Full muscle — all layers visible
    expect(isNodeVisibleAtPeelDepth(superficialMuscle, 0)).toBe(true);
    expect(isNodeVisibleAtPeelDepth(intermediateMuscle, 0)).toBe(true);
    expect(isNodeVisibleAtPeelDepth(deepMuscle, 0)).toBe(true);
    expect(isNodeVisibleAtPeelDepth(boneNode, 0)).toBe(true);

    // Depth 1: Below surface — superficial muscles hidden
    expect(isNodeVisibleAtPeelDepth(superficialMuscle, 1)).toBe(false);
    expect(isNodeVisibleAtPeelDepth(intermediateMuscle, 1)).toBe(true);
    expect(isNodeVisibleAtPeelDepth(deepMuscle, 1)).toBe(true);
    expect(isNodeVisibleAtPeelDepth(boneNode, 1)).toBe(true);

    // Depth 2: Deep muscles — superficial and intermediate hidden
    expect(isNodeVisibleAtPeelDepth(superficialMuscle, 2)).toBe(false);
    expect(isNodeVisibleAtPeelDepth(intermediateMuscle, 2)).toBe(false);
    expect(isNodeVisibleAtPeelDepth(deepMuscle, 2)).toBe(true);
    expect(isNodeVisibleAtPeelDepth(boneNode, 2)).toBe(true);

    // Depth 3: Skeleton — all muscles hidden, only bones/joints visible
    expect(isNodeVisibleAtPeelDepth(superficialMuscle, 3)).toBe(false);
    expect(isNodeVisibleAtPeelDepth(intermediateMuscle, 3)).toBe(false);
    expect(isNodeVisibleAtPeelDepth(deepMuscle, 3)).toBe(false);
    expect(isNodeVisibleAtPeelDepth(boneNode, 3)).toBe(true);
  });

  it('uses opaque reference half color palette for pose meshes', () => {
    expect(referenceColorForNode(superficialMuscle)).toBe('#8f7a7e');
    expect(referenceColorForNode(boneNode)).toBe('#b8aea0');

    const jointNode = getNodeById('joint_knee');
    if (jointNode) {
      expect(referenceColorForNode(jointNode)).toBe('#9aa8b8');
    }
  });
});
