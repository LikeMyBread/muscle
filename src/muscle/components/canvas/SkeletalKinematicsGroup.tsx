import { memo, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getNodeById } from '../../curriculum';
import {
  computeProceduralJointAngles,
  getKinematicSegmentForNodeId,
  KINEMATIC_PIVOTS,
  type KinematicSegment,
} from './skeletalKinematics';

export type SkeletalKinematicsGroupProps = {
  meshes: readonly THREE.Mesh[];
  renderMesh: (mesh: THREE.Mesh) => React.ReactNode;
  isAnimating: boolean;
};

function SkeletalKinematicsGroupComponent({
  meshes,
  renderMesh,
  isAnimating,
}: SkeletalKinematicsGroupProps) {
  const { invalidate } = useThree();

  const spinePivotRef = useRef<THREE.Group>(null);
  const armPivotRef = useRef<THREE.Group>(null);
  const forearmPivotRef = useRef<THREE.Group>(null);
  const handPivotRef = useRef<THREE.Group>(null);
  const thighPivotRef = useRef<THREE.Group>(null);
  const shinPivotRef = useRef<THREE.Group>(null);
  const footPivotRef = useRef<THREE.Group>(null);

  const animTimeRef = useRef(0);
  const settlingRef = useRef(false);

  const categorizedMeshes = useMemo(() => {
    const buckets: Record<KinematicSegment, THREE.Mesh[]> = {
      pelvis: [],
      spine: [],
      arm: [],
      forearm: [],
      hand: [],
      thigh: [],
      shin: [],
      foot: [],
    };
    for (const mesh of meshes) {
      const node = getNodeById(mesh.name);
      const segment = getKinematicSegmentForNodeId(mesh.name, node?.region);
      buckets[segment].push(mesh);
    }
    return buckets;
  }, [meshes]);

  useFrame((_, delta) => {
    if (!isAnimating && !settlingRef.current) return;

    if (isAnimating) {
      animTimeRef.current += delta;
      settlingRef.current = true;
    }

    const currentAngles = isAnimating
      ? computeProceduralJointAngles(animTimeRef.current)
      : {
          elbowFlexion: 0,
          shoulderAbduction: 0,
          kneeFlexion: 0,
          hipFlexion: 0,
          spineFlexion: 0,
          activeMotionLabel: 'Resting pose',
        };

    const lerpRate = isAnimating ? 0.35 : 0.15;

    if (forearmPivotRef.current) {
      forearmPivotRef.current.rotation.x = THREE.MathUtils.lerp(
        forearmPivotRef.current.rotation.x,
        currentAngles.elbowFlexion,
        lerpRate,
      );
    }

    if (armPivotRef.current) {
      armPivotRef.current.rotation.z = THREE.MathUtils.lerp(
        armPivotRef.current.rotation.z,
        currentAngles.shoulderAbduction,
        lerpRate,
      );
    }

    if (shinPivotRef.current) {
      shinPivotRef.current.rotation.x = THREE.MathUtils.lerp(
        shinPivotRef.current.rotation.x,
        -currentAngles.kneeFlexion,
        lerpRate,
      );
    }

    if (thighPivotRef.current) {
      thighPivotRef.current.rotation.x = THREE.MathUtils.lerp(
        thighPivotRef.current.rotation.x,
        currentAngles.hipFlexion,
        lerpRate,
      );
    }

    if (spinePivotRef.current) {
      spinePivotRef.current.rotation.x = THREE.MathUtils.lerp(
        spinePivotRef.current.rotation.x,
        currentAngles.spineFlexion,
        lerpRate,
      );
    }

    if (!isAnimating) {
      const maxRemaining = Math.max(
        Math.abs(forearmPivotRef.current?.rotation.x ?? 0),
        Math.abs(armPivotRef.current?.rotation.z ?? 0),
        Math.abs(shinPivotRef.current?.rotation.x ?? 0),
        Math.abs(thighPivotRef.current?.rotation.x ?? 0),
        Math.abs(spinePivotRef.current?.rotation.x ?? 0),
      );
      if (maxRemaining < 0.001) {
        if (forearmPivotRef.current) forearmPivotRef.current.rotation.x = 0;
        if (armPivotRef.current) armPivotRef.current.rotation.z = 0;
        if (shinPivotRef.current) shinPivotRef.current.rotation.x = 0;
        if (thighPivotRef.current) thighPivotRef.current.rotation.x = 0;
        if (spinePivotRef.current) spinePivotRef.current.rotation.x = 0;
        settlingRef.current = false;
        animTimeRef.current = 0;
      }
    }

    invalidate();
  });

  const { spine, shoulder, elbow, wrist, hip, knee, ankle } = KINEMATIC_PIVOTS;

  return (
    <group name="skeletal-kinematics-root">
      {/* Pelvis (Root body part) */}
      <group name="segment-pelvis">
        {categorizedMeshes.pelvis.map(renderMesh)}
      </group>

      {/* Leg kinematic chain: Hip -> Thigh -> Knee -> Shin -> Ankle -> Foot */}
      <group ref={thighPivotRef} position={hip} name="pivot-hip">
        <group position={hip.clone().negate()} name="content-thigh">
          {categorizedMeshes.thigh.map(renderMesh)}

          <group ref={shinPivotRef} position={knee} name="pivot-knee">
            <group position={knee.clone().negate()} name="content-shin">
              {categorizedMeshes.shin.map(renderMesh)}

              <group ref={footPivotRef} position={ankle} name="pivot-ankle">
                <group position={ankle.clone().negate()} name="content-foot">
                  {categorizedMeshes.foot.map(renderMesh)}
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Spine / Upper body kinematic chain: Spine -> Arm -> Forearm -> Hand */}
      <group ref={spinePivotRef} position={spine} name="pivot-spine">
        <group position={spine.clone().negate()} name="content-spine">
          {categorizedMeshes.spine.map(renderMesh)}

          <group ref={armPivotRef} position={shoulder} name="pivot-shoulder">
            <group position={shoulder.clone().negate()} name="content-arm">
              {categorizedMeshes.arm.map(renderMesh)}

              <group ref={forearmPivotRef} position={elbow} name="pivot-elbow">
                <group position={elbow.clone().negate()} name="content-forearm">
                  {categorizedMeshes.forearm.map(renderMesh)}

                  <group ref={handPivotRef} position={wrist} name="pivot-wrist">
                    <group position={wrist.clone().negate()} name="content-hand">
                      {categorizedMeshes.hand.map(renderMesh)}
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

const SkeletalKinematicsGroup = memo(SkeletalKinematicsGroupComponent);
export default SkeletalKinematicsGroup;
