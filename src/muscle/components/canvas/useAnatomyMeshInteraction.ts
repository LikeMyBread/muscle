import { useCallback } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { useMuscleStore } from '../../store/useMuscleStore';
import {
  pickStructureDetailsFromIntersections,
  resolveSideFromObjectOrPoint,
} from './pickStructureFromIntersections';

export function useAnatomyMeshInteraction(nodeId: string) {
  const handleClick = useCallback(
    (event?: ThreeEvent<MouseEvent>) => {
      const state = useMuscleStore.getState();
      const details =
        event &&
        pickStructureDetailsFromIntersections(event.intersections, state.layerPeelDepth);
      const targetId = details?.nodeId ?? nodeId;
      const side =
        details?.side ?? (event ? resolveSideFromObjectOrPoint(event.object, event.point) : null);
      state.focusStructure(targetId, side);
    },
    [nodeId],
  );

  const handlePointerOver = useCallback(
    (event?: ThreeEvent<PointerEvent>) => {
      const state = useMuscleStore.getState();
      if (event) {
        const details = pickStructureDetailsFromIntersections(event.intersections, state.layerPeelDepth);
        if (details) {
          state.setHoveredNodeId(details.nodeId);
          return;
        }
      }
      state.setHoveredNodeId(nodeId);
    },
    [nodeId],
  );

  const handlePointerOut = useCallback(() => {
    const state = useMuscleStore.getState();
    if (state.hoveredNodeId === nodeId) {
      state.setHoveredNodeId(null);
    }
  }, [nodeId]);

  return { handleClick, handlePointerOver, handlePointerOut };
}
