import { Line } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import * as THREE from 'three';
import type { AnatomyTerm } from '../../types/anatomyTerm';
import type { AnatomyStageFrame } from '../../types/anatomyStageFrame';
import { useMuscleStore } from '../../store/useMuscleStore';
import { findSceneObjectForNodeId } from '../canvas/computeAnatomyFocusCamera';

type MotionKind = 'flexion' | 'extension' | 'abduction' | 'adduction' | 'pronation' | 'supination';

function motionForTerm(termId: string): MotionKind | null {
  if (termId === 'term_flexion') return 'flexion';
  if (termId === 'term_extension') return 'extension';
  if (termId === 'term_abduction') return 'abduction';
  if (termId === 'term_adduction') return 'adduction';
  if (termId === 'term_pronation') return 'pronation';
  if (termId === 'term_supination') return 'supination';
  return null;
}

/**
 * Resolves a 3D anatomical position from a mesh in the scene if available,
 * falling back to calibrated layout-transformed stage coordinates.
 */
function resolveWorldLandmark(
  scene: THREE.Object3D,
  nodeId: string,
  fallbackLocal: [number, number, number],
  frame: AnatomyStageFrame,
): THREE.Vector3 {
  const obj = findSceneObjectForNodeId(scene, nodeId);
  if (obj) {
    const box = new THREE.Box3().setFromObject(obj);
    if (!box.isEmpty()) {
      return box.getCenter(new THREE.Vector3());
    }
  }
  const { scale, position } = frame.layout;
  return new THREE.Vector3(
    fallbackLocal[0] * scale + position[0],
    fallbackLocal[1] * scale + position[1],
    fallbackLocal[2] * scale + position[2],
  );
}

export default function TermJointMotion({ term }: { term: AnatomyTerm }): React.ReactElement | null {
  const frame = useMuscleStore((s) => s.anatomyStageFrame);
  const { scene, invalidate } = useThree();
  const motion = motionForTerm(term.id);

  const spec = useMemo(() => {
    if (!motion) return null;

    if (motion === 'flexion') {
      // Elbow Flexion: Forearm hinges at the elbow joint, swinging anteriorly and upward toward the humerus
      const pivot = resolveWorldLandmark(scene, 'joint_elbow', [0.22, 1.107, -0.037], frame);
      const anchor = resolveWorldLandmark(scene, 'joint_shoulder', [0.163, 1.378, -0.028], frame);
      const restDistal = resolveWorldLandmark(scene, 'joint_wrist', [0.265, 0.852, 0.022], frame);

      const uUpper = new THREE.Vector3().subVectors(anchor, pivot).normalize();
      const uForearm0 = new THREE.Vector3().subVectors(restDistal, pivot).normalize();
      const forearmLength = pivot.distanceTo(restDistal);

      // Transverse hinge axis passing through the epicondyles
      const rotationAxis = new THREE.Vector3().crossVectors(uForearm0, uUpper).normalize();
      const maxAngle = (135 * Math.PI) / 180; // ~135° flexion (closes angle down to ~30°)

      const trajectoryArcPoints: [number, number, number][] = [];
      const steps = 24;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * maxAngle;
        const pt = pivot.clone().addScaledVector(
          uForearm0.clone().applyAxisAngle(rotationAxis, a),
          forearmLength,
        );
        trajectoryArcPoints.push([pt.x, pt.y, pt.z]);
      }

      // Arrowhead at the flexed end of the trajectory
      const flexedDir = uForearm0.clone().applyAxisAngle(rotationAxis, maxAngle);
      const arrowPos = pivot.clone().addScaledVector(flexedDir, forearmLength);
      const arrowTangent = new THREE.Vector3().crossVectors(rotationAxis, flexedDir).normalize();
      const arrowQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        arrowTangent,
      );

      // Transverse hinge pin cylinder along rotation axis
      const hingePinQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        rotationAxis,
      );

      return {
        motion,
        pivot,
        anchor,
        restDistal,
        uAnchor: uUpper,
        uDistal0: uForearm0,
        distalLength: forearmLength,
        rotationAxis,
        maxAngle,
        trajectoryArcPoints,
        arrowPos,
        arrowQuat,
        hingePinQuat,
        angleArcRadius: 0.055,
        reverseCycle: false,
      };
    }

    if (motion === 'extension') {
      // Knee Extension: Straightening the leg from bent knee (90° flexed) to full extension
      const pivot = resolveWorldLandmark(scene, 'joint_knee', [0.095, 0.435, -0.026], frame);
      const anchor = resolveWorldLandmark(scene, 'joint_hip', [0.09, 0.885, -0.007], frame);
      const straightAnkle = resolveWorldLandmark(scene, 'joint_ankle', [0.08, 0.075, -0.029], frame);

      const uThigh = new THREE.Vector3().subVectors(anchor, pivot).normalize();
      const uShinStraight = new THREE.Vector3().subVectors(straightAnkle, pivot).normalize();
      const shinLength = pivot.distanceTo(straightAnkle);

      // Knee flexion swings shin posteriorly (-Z) around transverse knee axis
      const rotationAxis = new THREE.Vector3(-1, 0, 0);
      const maxFlexion = (85 * Math.PI) / 180;
      // Bent starting position (posterior)
      const uShinBent = uShinStraight.clone().applyAxisAngle(rotationAxis, -maxFlexion);
      const restDistal = pivot.clone().addScaledVector(uShinBent, shinLength);

      const trajectoryArcPoints: [number, number, number][] = [];
      const steps = 24;
      for (let i = 0; i <= steps; i++) {
        const a = -maxFlexion + (i / steps) * maxFlexion;
        const pt = pivot.clone().addScaledVector(
          uShinStraight.clone().applyAxisAngle(rotationAxis, a),
          shinLength,
        );
        trajectoryArcPoints.push([pt.x, pt.y, pt.z]);
      }

      const arrowPos = straightAnkle.clone();
      const arrowTangent = new THREE.Vector3(0, -0.2, 0.98).normalize();
      const arrowQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        arrowTangent,
      );
      const hingePinQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        rotationAxis,
      );

      return {
        motion,
        pivot,
        anchor,
        restDistal,
        uAnchor: uThigh,
        uDistal0: uShinBent,
        distalLength: shinLength,
        rotationAxis,
        maxAngle: maxFlexion,
        trajectoryArcPoints,
        arrowPos,
        arrowQuat,
        hingePinQuat,
        angleArcRadius: 0.06,
        reverseCycle: false,
      };
    }

    if (motion === 'abduction' || motion === 'adduction') {
      // Shoulder Abduction / Adduction: Arm raises away from / lowers toward midline in coronal plane
      const pivot = resolveWorldLandmark(scene, 'joint_shoulder', [0.163, 1.378, -0.028], frame);
      const anchor = resolveWorldLandmark(scene, 'bone_spine', [0.0, 1.35, 0.0], frame);
      const restDistal = resolveWorldLandmark(scene, 'joint_wrist', [0.265, 0.852, 0.022], frame);

      const uTrunk = new THREE.Vector3().subVectors(anchor, pivot).normalize();
      const uArmRest = new THREE.Vector3().subVectors(restDistal, pivot).normalize();
      const armLength = pivot.distanceTo(restDistal);

      // Normal to coronal plane (+Z anterior)
      const rotationAxis = new THREE.Vector3(0, 0, 1);
      const maxAngle = (85 * Math.PI) / 180; // ~85° abduction

      const trajectoryArcPoints: [number, number, number][] = [];
      const steps = 24;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * maxAngle;
        const pt = pivot.clone().addScaledVector(
          uArmRest.clone().applyAxisAngle(rotationAxis, a),
          armLength,
        );
        trajectoryArcPoints.push([pt.x, pt.y, pt.z]);
      }

      const endDir = uArmRest.clone().applyAxisAngle(rotationAxis, maxAngle);
      const arrowPos = pivot.clone().addScaledVector(endDir, armLength);
      const arrowTangent = new THREE.Vector3().crossVectors(rotationAxis, endDir).normalize();
      const arrowQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        arrowTangent,
      );
      const hingePinQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        rotationAxis,
      );

      return {
        motion,
        pivot,
        anchor,
        restDistal,
        uAnchor: uTrunk,
        uDistal0: uArmRest,
        distalLength: armLength,
        rotationAxis,
        maxAngle,
        trajectoryArcPoints,
        arrowPos,
        arrowQuat,
        hingePinQuat,
        angleArcRadius: 0.07,
        reverseCycle: motion === 'adduction',
      };
    }

    return null;
  }, [frame, motion, scene]);

  const [currentDistal, setCurrentDistal] = useState<[number, number, number]>(() => {
    if (!spec) return [0, 0, 0];
    return [spec.restDistal.x, spec.restDistal.y, spec.restDistal.z];
  });

  const [angleArcPoints, setAngleArcPoints] = useState<[number, number, number][]>(() => {
    if (!spec) return [];
    const pts: [number, number, number][] = [];
    const steps = 8;
    const remaining = spec.uDistal0.angleTo(spec.uAnchor);
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * remaining;
      const test = spec.uDistal0.clone().applyAxisAngle(spec.rotationAxis, a);
      const testNeg = spec.uDistal0.clone().applyAxisAngle(spec.rotationAxis.clone().negate(), a);
      const dir = test.angleTo(spec.uAnchor) < testNeg.angleTo(spec.uAnchor) ? test : testNeg;
      const pt = spec.pivot.clone().addScaledVector(dir, spec.angleArcRadius);
      pts.push([pt.x, pt.y, pt.z]);
    }
    return pts;
  });

  useFrame(({ clock }) => {
    if (!spec) return;

    // Advance render in frameloop="demand" while animation is playing
    invalidate();

    const t = clock.getElapsedTime() * 1.5;
    const rawWave = (Math.sin(t - Math.PI / 2) + 1) / 2; // 0 to 1
    const easeWave = rawWave < 0.5 ? 2 * rawWave * rawWave : 1 - Math.pow(-2 * rawWave + 2, 2) / 2;
    const progress = spec.reverseCycle ? 1 - easeWave : easeWave;
    const currentAngle = progress * spec.maxAngle;

    const currentDir = spec.uDistal0.clone().applyAxisAngle(spec.rotationAxis, currentAngle);
    const movingDistal = spec.pivot.clone().addScaledVector(currentDir, spec.distalLength);
    setCurrentDistal([movingDistal.x, movingDistal.y, movingDistal.z]);

    // Compute joint angle arc points showing the changing angle
    const remainingAngle = currentDir.angleTo(spec.uAnchor);
    const pts: [number, number, number][] = [];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * remainingAngle;
      const test = currentDir.clone().applyAxisAngle(spec.rotationAxis, a);
      const testNeg = currentDir.clone().applyAxisAngle(spec.rotationAxis.clone().negate(), a);
      const dir = test.angleTo(spec.uAnchor) < testNeg.angleTo(spec.uAnchor) ? test : testNeg;
      const pt = spec.pivot.clone().addScaledVector(dir, spec.angleArcRadius);
      pts.push([pt.x, pt.y, pt.z]);
    }
    setAngleArcPoints(pts);
  });

  if (!spec) return null;

  const pivotPoint: [number, number, number] = [spec.pivot.x, spec.pivot.y, spec.pivot.z];
  const anchorPoint: [number, number, number] = [spec.anchor.x, spec.anchor.y, spec.anchor.z];
  const restDistalPoint: [number, number, number] = [
    spec.restDistal.x,
    spec.restDistal.y,
    spec.restDistal.z,
  ];
  const arrowPositionPoint: [number, number, number] = [
    spec.arrowPos.x,
    spec.arrowPos.y,
    spec.arrowPos.z,
  ];

  return (
    <group>
      {/* Stationary Segment (Upper Arm / Thigh / Trunk) */}
      <Line
        points={[anchorPoint, pivotPoint]}
        color="#cbd5e1"
        lineWidth={3}
        renderOrder={20}
      />

      {/* Ghosted Extension / Rest Reference (Original Position) */}
      <Line
        points={[pivotPoint, restDistalPoint]}
        color="#64748b"
        dashed
        dashSize={0.02}
        gapSize={0.015}
        lineWidth={2}
        opacity={0.65}
        transparent
        renderOrder={21}
      />

      {/* Trajectory Arc (Motion Path) */}
      {spec.trajectoryArcPoints.length >= 2 ? (
        <Line
          points={spec.trajectoryArcPoints}
          color="#3b82f6"
          dashed
          dashSize={0.03}
          gapSize={0.015}
          lineWidth={2.5}
          renderOrder={22}
        />
      ) : null}

      {/* Active Moving Segment (Forearm / Lower Leg) */}
      <Line
        points={[pivotPoint, currentDistal]}
        color="#38bdf8"
        lineWidth={3.5}
        renderOrder={24}
      />

      {/* Joint Angle Arc at Pivot (Shows Angle Closing in Flexion / Opening in Extension) */}
      {angleArcPoints.length >= 2 ? (
        <Line
          points={angleArcPoints}
          color="#f59e0b"
          lineWidth={3}
          renderOrder={23}
        />
      ) : null}

      {/* Transverse Hinge Axis Cylinder */}
      <mesh position={pivotPoint} quaternion={spec.hingePinQuat} renderOrder={25}>
        <cylinderGeometry args={[0.005, 0.005, 0.065, 12]} />
        <meshStandardMaterial color="#60a5fa" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Joint Hinge Pivot Sphere */}
      <mesh position={pivotPoint} renderOrder={25}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshStandardMaterial
          color="#2563eb"
          roughness={0.25}
          metalness={0.3}
          emissive="#1d4ed8"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Center Highlight Core */}
      <mesh position={pivotPoint} renderOrder={26}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Moving Distal Marker (Wrist / Hand / Ankle) */}
      <mesh position={currentDistal} renderOrder={25}>
        <sphereGeometry args={[0.016, 14, 14]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Arrowhead at Trajectory Arc End */}
      <mesh position={arrowPositionPoint} quaternion={spec.arrowQuat} renderOrder={25}>
        <coneGeometry args={[0.013, 0.032, 12]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
    </group>
  );
}
