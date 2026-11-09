import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Neutral-studio image-based lighting built locally with PMREM (no CDN HDR — keeps Muscle Memory
 * offline-first). Gives the MeshStandardMaterial muscles/bones soft directional reflections so
 * form reads dimensionally instead of flat, closing most of the gap to reference Z-Anatomy renders.
 * Built once; disposed on unmount. frameloop="demand" so we invalidate once after it lands.
 */
export default function AnatomySceneEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    // If WebGL context is lost or unavailable, skip PMREM generation
    const rawGl = (gl.getContext ? gl.getContext() : gl) as WebGLRenderingContext | null;
    if (rawGl?.isContextLost?.()) return;

    let pmrem: THREE.PMREMGenerator | null = null;
    let envMap: THREE.Texture | null = null;
    let room: RoomEnvironment | null = null;
    const previous = scene.environment;

    try {
      pmrem = new THREE.PMREMGenerator(gl);
      room = new RoomEnvironment();
      envMap = pmrem.fromScene(room, 0.04).texture;
      scene.environment = envMap;
      invalidate();
    } catch (err) {
      console.warn('[AnatomySceneEnvironment] Failed to generate PMREM environment:', err);
    }

    return () => {
      scene.environment = previous;
      try {
        envMap?.dispose();
        pmrem?.dispose();
        (room as unknown as { dispose?: () => void })?.dispose?.();
      } catch {
        // Ignore disposal errors on lost context
      }
    };
  }, [gl, scene, invalidate]);

  return null;
}
