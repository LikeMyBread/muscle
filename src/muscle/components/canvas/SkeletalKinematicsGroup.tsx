import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getNodeById } from '../../curriculum';
import { useMuscleStore, type SkeletonJointAngles } from '../../store/useMuscleStore';
import {
  computeKinematicRotations,
  computeProceduralJointAngles,
  deformBridgingMesh,
  getKinematicSegmentForNodeId,
  KINEMATIC_PIVOTS,
  restoreOriginalMeshPositions,
  type JointAngleState,
  type KinematicPivotRotations,
  type KinematicSegment,
} from './skeletalKinematics';

export type KinematicSide = 'left' | 'right';

export type SkeletalKinematicsGroupProps = {
  meshes: readonly THREE.Mesh[];
  renderMesh: (mesh: THREE.Mesh) => React.ReactNode;
  isAnimating: boolean;
  resetKey?: number;
  syncToStore?: boolean;
  side?: KinematicSide;
};

function extractJointAnglesForSide(
  angles: SkeletonJointAngles | { [k in keyof SkeletonJointAngles]?: number },
  side: KinematicSide,
): JointAngleState {
  return {
    spineFlexion: angles.spineFlexion ?? 0,
    shoulderAbduction: (side === 'left' ? angles.leftShoulderAbduction : angles.rightShoulderAbduction) ?? 0,
    elbowFlexion: (side === 'left' ? angles.leftElbowFlexion : angles.rightElbowFlexion) ?? 0,
    hipFlexion: (side === 'left' ? angles.leftHipFlexion : angles.rightHipFlexion) ?? 0,
    kneeFlexion: (side === 'left' ? angles.leftKneeFlexion : angles.rightKneeFlexion) ?? 0,
  };
}

function SkeletalKinematicsGroupComponent({
  meshes,
  renderMesh,
  isAnimating,
  resetKey,
  syncToStore,
  side = 'right',
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
  const resettingRef = useRef(false);
  const lastResetKeyRef = useRef(resetKey ?? 0);

  useEffect(() => {
    if (resetKey !== undefined && resetKey !== lastResetKeyRef.current) {
      lastResetKeyRef.current = resetKey;
      animTimeRef.current = 0;
      resettingRef.current = true;
      invalidate();
    }
  }, [resetKey, invalidate]);

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
      bridging: [],
    };
    for (const mesh of meshes) {
      const node = getNodeById(mesh.name);
      const segment = getKinematicSegmentForNodeId(mesh.name, node?.region, node?.name);
      buckets[segment].push(mesh);
    }
    return buckets;
  }, [meshes]);

  const applyJointAngles = (angles: SkeletonJointAngles) => {
    const sideAngles = extractJointAnglesForSide(angles, side);
    const rotations = computeKinematicRotations(sideAngles);

    if (forearmPivotRef.current) {
      forearmPivotRef.current.rotation.x = rotations.forearmRotationX;
    }
    if (armPivotRef.current) {
      armPivotRef.current.rotation.z = rotations.armRotationZ;
    }
    if (shinPivotRef.current) {
      shinPivotRef.current.rotation.x = rotations.shinRotationX;
    }
    if (thighPivotRef.current) {
      thighPivotRef.current.rotation.x = rotations.thighRotationX;
    }
    if (spinePivotRef.current) {
      spinePivotRef.current.rotation.x = rotations.spineRotationX;
    }

    for (const mesh of categorizedMeshes.bridging) {
      deformBridgingMesh(mesh, rotations);
    }
  };

  useEffect(() => {
    // Apply current angles on mount or when categorized meshes change (if not animating)
    if (!isAnimating && !resettingRef.current) {
      applyJointAngles(useMuscleStore.getState().skeletonJointAngles);
      invalidate();
    }

    let prevAngles = useMuscleStore.getState().skeletonJointAngles;
    const unsubscribe = useMuscleStore.subscribe((state) => {
      if (state.skeletonJointAngles !== prevAngles) {
        prevAngles = state.skeletonJointAngles;
        if (state.isSkeletonAnimating || resettingRef.current) {
          return;
        }
        applyJointAngles(state.skeletonJointAngles);
        invalidate();
      }
    });

    return unsubscribe;
  }, [categorizedMeshes, invalidate, isAnimating, side]);

  useFrame((_, delta) => {
    // If a reset was requested, smoothly lerp all joints back to the 0 rest pose
    if (resettingRef.current) {
      const lerpRate = 0.25;
      if (forearmPivotRef.current) {
        forearmPivotRef.current.rotation.x = THREE.MathUtils.lerp(forearmPivotRef.current.rotation.x, 0, lerpRate);
      }
      if (armPivotRef.current) {
        armPivotRef.current.rotation.z = THREE.MathUtils.lerp(armPivotRef.current.rotation.z, 0, lerpRate);
      }
      if (shinPivotRef.current) {
        shinPivotRef.current.rotation.x = THREE.MathUtils.lerp(shinPivotRef.current.rotation.x, 0, lerpRate);
      }
      if (thighPivotRef.current) {
        thighPivotRef.current.rotation.x = THREE.MathUtils.lerp(thighPivotRef.current.rotation.x, 0, lerpRate);
      }
      if (spinePivotRef.current) {
        spinePivotRef.current.rotation.x = THREE.MathUtils.lerp(spinePivotRef.current.rotation.x, 0, lerpRate);
      }

      const currentRotations: KinematicPivotRotations = {
        forearmRotationX: forearmPivotRef.current?.rotation.x ?? 0,
        armRotationZ: armPivotRef.current?.rotation.z ?? 0,
        shinRotationX: shinPivotRef.current?.rotation.x ?? 0,
        thighRotationX: thighPivotRef.current?.rotation.x ?? 0,
        spineRotationX: spinePivotRef.current?.rotation.x ?? 0,
      };

      for (const mesh of categorizedMeshes.bridging) {
        deformBridgingMesh(mesh, currentRotations);
      }

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
        for (const mesh of categorizedMeshes.bridging) {
          restoreOriginalMeshPositions(mesh);
        }
        resettingRef.current = false;
      }
      invalidate();
      return;
    }

    // When paused, maintain the exact current joint angles without advancing or resetting
    if (!isAnimating) return;

    animTimeRef.current += delta;
    const currentAngles = computeProceduralJointAngles(animTimeRef.current);
    const sideAngles = extractJointAnglesForSide(currentAngles, side);
    const rotations = computeKinematicRotations(sideAngles);

    if (forearmPivotRef.current) {
      forearmPivotRef.current.rotation.x = rotations.forearmRotationX;
    }

    if (armPivotRef.current) {
      armPivotRef.current.rotation.z = rotations.armRotationZ;
    }

    if (shinPivotRef.current) {
      shinPivotRef.current.rotation.x = rotations.shinRotationX;
    }

    if (thighPivotRef.current) {
      thighPivotRef.current.rotation.x = rotations.thighRotationX;
    }

    if (spinePivotRef.current) {
      spinePivotRef.current.rotation.x = rotations.spineRotationX;
    }

    for (const mesh of categorizedMeshes.bridging) {
      deformBridgingMesh(mesh, rotations);
    }

    if (syncToStore) {
      useMuscleStore.getState().setSkeletonJointAngles({
        spineFlexion: currentAngles.spineFlexion,
        leftShoulderAbduction: currentAngles.leftShoulderAbduction,
        rightShoulderAbduction: currentAngles.rightShoulderAbduction,
        leftElbowFlexion: currentAngles.leftElbowFlexion,
        rightElbowFlexion: currentAngles.rightElbowFlexion,
        leftHipFlexion: currentAngles.leftHipFlexion,
        rightHipFlexion: currentAngles.rightHipFlexion,
        leftKneeFlexion: currentAngles.leftKneeFlexion,
        rightKneeFlexion: currentAngles.rightKneeFlexion,
      });
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

      {/* Bridging dual-anchored muscles (e.g. Psoas major spanning lumbar spine and femur) */}
      <group name="segment-bridging">
        {categorizedMeshes.bridging.map(renderMesh)}
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
