import { memo } from 'react';
import { getNodesForRegion } from '../../curriculum';
import type { MuscleMemoryNode, MuscleRegion } from '../../types/node';
import AnatomyMesh from './AnatomyMesh';
import { useAnatomyMeshFlags } from './useAnatomyMeshFlags';
import { useAnatomyMeshInteraction } from './useAnatomyMeshInteraction';
import { useMuscleStore } from '../../store/useMuscleStore';

function ProceduralAnatomyMesh({ node }: { node: MuscleMemoryNode }) {
  const flags = useAnatomyMeshFlags(node.id, node);
  const studyActive = useMuscleStore((s) => s.studyActive);
  const { handleClick, handlePointerOver, handlePointerOut } = useAnatomyMeshInteraction(node.id);

  return (
    <AnatomyMesh
      node={node}
      flags={flags}
      onPointerOver={studyActive ? undefined : handlePointerOver}
      onPointerOut={studyActive ? undefined : handlePointerOut}
      onClick={studyActive ? undefined : handleClick}
    />
  );
}

const MemoProceduralAnatomyMesh = memo(ProceduralAnatomyMesh);

interface ProceduralRegionModelProps {
  region: MuscleRegion;
  /** When set, skip nodes already rendered from a region GLB. */
  excludeNodeIds?: ReadonlySet<string>;
  /** When set, only render these curriculum nodes (e.g. GLB gaps). */
  includeNodeIds?: ReadonlySet<string>;
}

export default function ProceduralRegionModel({
  region,
  excludeNodeIds,
  includeNodeIds,
}: ProceduralRegionModelProps) {
  const nodes = getNodesForRegion(region).filter((node) => {
    if (excludeNodeIds?.has(node.id)) return false;
    if (includeNodeIds && !includeNodeIds.has(node.id)) return false;
    return true;
  });

  return (
    <group>
      {nodes.map((node) => (
        <MemoProceduralAnatomyMesh key={node.id} node={node} />
      ))}
    </group>
  );
}
