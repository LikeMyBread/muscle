import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { Mesh, Plane } from 'three';
import type { MuscleMemoryNode } from '../../types/node';
import { referenceColorForNode } from './referenceHalfVisuals';
import { acquireAnatomyMaterial } from './anatomyMaterialPool';
import { useMuscleStore } from '../../store/useMuscleStore';
import { ANATOMY_COLORS } from './anatomyVisuals';
import { isNodeVisibleAtPeelDepth } from '../../layerDepthView';
import { useAnatomyMeshInteraction } from './useAnatomyMeshInteraction';

export type GlbPoseMeshProps = {
  mesh: Mesh;
  node: MuscleMemoryNode;
  /** Sagittal clip plane — keeps symmetrical halves from bleeding across the cut. */
  clippingPlane?: Plane | null;
  /** Mirrored across the sagittal plane onto −X. */
  isMirrored?: boolean;
};

function renderOrderForNode(node: MuscleMemoryNode): number {
  if (node.type === 'bone') return 10;
  if (node.type === 'joint') return 12;
  return 20;
}

/**
 * Pose view mesh — renders anatomy symmetrically and opaquely like the reference half,
 * while hiding layers as depth is adjusted.
 */
function GlbPoseMeshComponent({
  mesh,
  node,
  clippingPlane = null,
  isMirrored = false,
}: GlbPoseMeshProps) {
  const isVisible = useMuscleStore((s) => isNodeVisibleAtPeelDepth(node, s.layerPeelDepth));
  const isFocused = useMuscleStore(
    (s) => s.focusedNodeId === node.id || Boolean(s.focusedGroupNodeIds?.includes(node.id)),
  );
  const { invalidate } = useThree();
  const meshRef = useRef<Mesh>(null);
  const { handleClick } = useAnatomyMeshInteraction(node.id);

  const material = useMemo(() => acquireAnatomyMaterial('default', false), []);

  useLayoutEffect(() => {
    if (!isVisible) return;
    const m = meshRef.current;
    if (m && isMirrored) {
      // Parent −X mirror breaks frustum culling — mirrored limbs vanish when orbited off-axis.
      m.frustumCulled = false;
    }
    material.color.set(referenceColorForNode(node));
    material.opacity = 1;
    material.transparent = false;
    if (isFocused) {
      material.emissive.set(ANATOMY_COLORS.highlight);
      material.emissiveIntensity = 0.45;
    } else {
      material.emissive.set('#000000');
      material.emissiveIntensity = 0;
    }
    material.depthTest = true;
    material.depthWrite = true;
    if (node.type === 'bone') {
      material.polygonOffset = true;
      material.polygonOffsetFactor = 1;
      material.polygonOffsetUnits = 1;
    } else {
      material.polygonOffset = false;
    }
    material.clippingPlanes = clippingPlane ? [clippingPlane] : null;
    material.clipShadows = clippingPlane != null;
    material.needsUpdate = true;
    invalidate();
  }, [clippingPlane, invalidate, isFocused, isMirrored, isVisible, material, node]);

  if (!isVisible) return null;

  return (
    <mesh
      ref={meshRef}
      name={mesh.name}
      geometry={mesh.geometry}
      material={material}
      castShadow
      receiveShadow
      renderOrder={renderOrderForNode(node)}
      position={mesh.position}
      rotation={mesh.rotation}
      scale={mesh.scale}
      onClick={(e) => {
        e.stopPropagation();
        handleClick(e);
      }}
    />
  );
}

const GlbPoseMesh = memo(GlbPoseMeshComponent);
export default GlbPoseMesh;
