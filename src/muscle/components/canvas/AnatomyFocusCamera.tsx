import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { getNodeById } from '../../curriculum';
import { useMuscleStore } from '../../store/useMuscleStore';
import {
  computeFramingPresetFromLayout,
  computeFramingPresetFromObject,
  findSceneObjectForNodeId,
} from './computeAnatomyFocusCamera';

/** Computes a camera preset when the user focuses a structure in warmup mode or study mode. */
export default function AnatomyFocusCamera() {
  const { scene, camera, invalidate } = useThree();
  const focusedNodeId = useMuscleStore((s) => s.focusedNodeId);
  const focusedSide = useMuscleStore((s) => s.focusedSide);
  const focusCameraNonce = useMuscleStore((s) => s.focusCameraNonce);
  const setCameraFocusPreset = useMuscleStore((s) => s.setCameraFocusPreset);

  useEffect(() => {
    if (!focusedNodeId) {
      setCameraFocusPreset(null);
      return;
    }

    let object = findSceneObjectForNodeId(scene, focusedNodeId, focusedSide);
    if (!object && focusedNodeId === 'joint_knee') {
      object = findSceneObjectForNodeId(scene, 'bone_patella', focusedSide);
    }
    if (object) {
      object.updateWorldMatrix(true, false);
      setCameraFocusPreset(computeFramingPresetFromObject(object, camera.position.clone()));
      invalidate();
      return;
    }

    const node = getNodeById(focusedNodeId);
    if (node?.layout) {
      const layoutPos: [number, number, number] = [
        focusedSide === 'right' ? -Math.abs(node.layout.position[0]) : Math.abs(node.layout.position[0]),
        node.layout.position[1],
        node.layout.position[2],
      ];
      setCameraFocusPreset(
        computeFramingPresetFromLayout(layoutPos, node.layout.scale, camera.position),
      );
      invalidate();
      return;
    }

    setCameraFocusPreset(null);
  // Snap from current orbit bearing when focus changes — not on every camera tick.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- camera.position intentionally omitted
  }, [
    camera,
    focusCameraNonce,
    focusedNodeId,
    focusedSide,
    invalidate,
    scene,
    setCameraFocusPreset,
  ]);

  return null;
}
