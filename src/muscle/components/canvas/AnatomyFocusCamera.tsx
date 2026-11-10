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
  const mode = useMuscleStore((s) => s.mode);
  const studyActive = useMuscleStore((s) => s.studyActive);
  const studyTargetNodeId = useMuscleStore((s) => s.studyTargetNodeId);
  const focusedNodeId = useMuscleStore((s) => s.focusedNodeId);
  const focusCameraNonce = useMuscleStore((s) => s.focusCameraNonce);
  const layerPeelDepth = useMuscleStore((s) => s.layerPeelDepth);
  const setCameraFocusPreset = useMuscleStore((s) => s.setCameraFocusPreset);

  useEffect(() => {
    const targetId = studyActive
      ? (studyTargetNodeId ?? focusedNodeId)
      : (mode === 'warmup' ? focusedNodeId : null);
    if (!targetId) {
      setCameraFocusPreset(null);
      return;
    }

    let object = findSceneObjectForNodeId(scene, targetId);
    if (!object && targetId === 'joint_knee') {
      object = findSceneObjectForNodeId(scene, 'bone_patella');
    }
    if (object) {
      object.updateWorldMatrix(true, false);
      setCameraFocusPreset(computeFramingPresetFromObject(object, camera.position.clone()));
      invalidate();
      return;
    }

    const node = getNodeById(targetId);
    if (node?.layout) {
      setCameraFocusPreset(
        computeFramingPresetFromLayout(node.layout.position, node.layout.scale, camera.position),
      );
      invalidate();
      return;
    }

    setCameraFocusPreset(null);
  // Snap from current orbit bearing when focus changes — not on every camera tick.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- camera.position intentionally omitted
  }, [
    focusCameraNonce,
    focusedNodeId,
    studyActive,
    studyTargetNodeId,
    invalidate,
    layerPeelDepth,
    mode,
    scene,
    setCameraFocusPreset,
  ]);

  return null;
}
