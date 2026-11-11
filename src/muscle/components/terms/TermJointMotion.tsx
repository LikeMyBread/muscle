import { Line } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import * as THREE from 'three';
import type { AnatomyTerm } from '../../types/anatomyTerm';
import type { AnatomyStageFrame } from '../../types/anatomyStageFrame';
import { useMuscleStore } from '../../store/useMuscleStore';
import { findSceneObjectForNodeId } from '../canvas/computeAnatomyFocusCamera';

export type MotionKind =
  | 'flexion'
  | 'extension'
  | 'abduction'
  | 'adduction'
  | 'pronation'
  | 'supination';

export interface JointMotionSpec {
  motion: MotionKind;
  pivot: THREE.Vector3;
  anchor: THREE.Vector3;
  restDistal: THREE.Vector3;
  uAnchor: THREE.Vector3;
  uDistal0: THREE.Vector3;
  distalLength: number;
  rotationAxis: THREE.Vector3;
  maxAngle: number;
  trajectoryArcPoints: [number, number, number][];
  arrowPos: THREE.Vector3;
  arrowQuat: THREE.Quaternion;
  hingePinQuat: THREE.Quaternion;
  angleArcRadius: number;
  reverseCycle: boolean;
  jumpBack: boolean;
}

const EXTENSION_START_ANGLE_RAD = (70 * Math.PI) / 180;
// Stop at 179° instead of 180° so the interior angle always stays unambiguously on the posterior flexion side.
const EXTENSION_END_ANGLE_RAD = (179 * Math.PI) / 180;

function buildRotationTrajectory(
  pivot: THREE.Vector3,
  uStartDir: THREE.Vector3,
  rotationAxis: THREE.Vector3,
  maxAngle: number,
  radius: number,
  steps = 24,
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * maxAngle;
    const pt = pivot
      .clone()
      .addScaledVector(uStartDir.clone().applyAxisAngle(rotationAxis, a), radius);
    pts.push([pt.x, pt.y, pt.z]);
  }
  return pts;
}

/**
 * Builds the interior joint angle arc between `currentDir` and `uAnchor`,
 * choosing a single consistent rotation direction across the entire arc.
 */
export function buildAngleArcPoints(
  pivot: THREE.Vector3,
  currentDir: THREE.Vector3,
  uAnchor: THREE.Vector3,
  rotationAxis: THREE.Vector3,
  angleArcRadius: number,
): [number, number, number][] {
  if (angleArcRadius <= 0) return [];
  const remainingAngle = currentDir.angleTo(uAnchor);
  const endPos = currentDir.clone().applyAxisAngle(rotationAxis, remainingAngle);
  const endNeg = currentDir.clone().applyAxisAngle(rotationAxis, -remainingAngle);
  const sweepAxis =
    endPos.angleTo(uAnchor) <= endNeg.angleTo(uAnchor)
      ? rotationAxis
      : rotationAxis.clone().negate();

  const steps = 16;
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * remainingAngle;
    const dir = currentDir.clone().applyAxisAngle(sweepAxis, a);
    const pt = pivot.clone().addScaledVector(dir, angleArcRadius);
    pts.push([pt.x, pt.y, pt.z]);
  }
  return pts;
}

/**
 * Computes motion progress from elapsed time.
 * For jumpBack motions (flexion, extension/straightening, abduction, adduction):
 * - starts at initial pose (0.25s pause)
 * - smoothly animates to final pose (1.40s duration with ease-in-out)
 * - holds at final pose (0.55s pause)
 * - jumps instantaneously back to the initial pose
 * For non-jumpBack motions:
 * - oscillates smoothly back and forth via sine wave
 */
export function computeMotionProgress(
  elapsedSeconds: number,
  jumpBack: boolean,
  reverseCycle = false,
): number {
  if (jumpBack) {
    const cycleDuration = 2.2;
    const holdStart = 0.25;
    const moveDuration = 1.4;
    const phase = ((elapsedSeconds % cycleDuration) + cycleDuration) % cycleDuration;

    if (phase < holdStart) {
      return reverseCycle ? 1 : 0;
    }
    if (phase < holdStart + moveDuration) {
      const u = (phase - holdStart) / moveDuration;
      // Smooth quadratic ease-in-out
      const ease = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      return reverseCycle ? 1 - ease : ease;
    }
    return reverseCycle ? 0 : 1;
  }

  const t = elapsedSeconds * 1.5;
  const rawWave = (Math.sin(t - Math.PI / 2) + 1) / 2; // 0 to 1
  const easeWave = rawWave < 0.5 ? 2 * rawWave * rawWave : 1 - Math.pow(-2 * rawWave + 2, 2) / 2;
  return reverseCycle ? 1 - easeWave : easeWave;
}

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
 * ensuring all parent group transforms (e.g. sagittal split offset) are applied,
 * and falling back to calibrated layout-transformed stage coordinates.
 */
export function resolveWorldLandmark(
  scene: THREE.Object3D,
  nodeId: string,
  fallbackLocal: [number, number, number],
  frame: AnatomyStageFrame,
): THREE.Vector3 {
  const obj = findSceneObjectForNodeId(scene, nodeId);
  if (obj) {
    // Force ancestor matrix updates so parent AnatomyHalfGroup translations are accounted for
    obj.updateWorldMatrix(true, false);
    const box = new THREE.Box3().setFromObject(obj);
    if (!box.isEmpty()) {
      return box.getCenter(new THREE.Vector3());
    }
  }
  const scale = frame.layout.scale || 0.9877;
  // In the split-plane full-body atlas, study half sits at sagittal offset posX ≈ 0.1824
  const posX = frame.layout.position[0] !== 0 ? frame.layout.position[0] : 0.1824;
  const posY = frame.layout.position[1] !== 0 ? frame.layout.position[1] : 0.0656;
  const posZ = frame.layout.position[2] || -0.0035;
  return new THREE.Vector3(
    fallbackLocal[0] * scale + posX,
    fallbackLocal[1] * scale + posY,
    fallbackLocal[2] * scale + posZ,
  );
}

/**
 * Builds the 3D kinematic specification (pivot, axes, trajectory arc, arrowhead, angle arc radius)
 * for a study term's joint motion demonstration.
 */
export function buildJointMotionSpec(
  motion: MotionKind,
  scene: THREE.Object3D,
  frame: AnatomyStageFrame,
): JointMotionSpec {
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

    const trajectoryArcPoints = buildRotationTrajectory(
      pivot,
      uForearm0,
      rotationAxis,
      maxAngle,
      forearmLength,
    );

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
      jumpBack: true,
    };
  }

  if (motion === 'extension') {
    // Knee Extension / Straightening: Straightens from bent knee (70°) to near-full extension (179°),
    // stopping 1° shy of 180° so the interior angle always stays unambiguously on the posterior side.
    const pivot = resolveWorldLandmark(scene, 'joint_knee', [0.095, 0.435, -0.026], frame);
    const anchor = resolveWorldLandmark(scene, 'joint_hip', [0.09, 0.885, -0.007], frame);
    const straightAnkle = resolveWorldLandmark(scene, 'joint_ankle', [0.08, 0.075, -0.029], frame);

    const uThigh = new THREE.Vector3().subVectors(anchor, pivot).normalize();
    const shinLength = pivot.distanceTo(straightAnkle);

    // Knee hinge axis orthogonal to uThigh so extension stays strictly within the posterior sagittal plane
    const lateralAxis = new THREE.Vector3(-1, 0, 0);
    const rotationAxis = lateralAxis
      .clone()
      .sub(uThigh.clone().multiplyScalar(lateralAxis.dot(uThigh)));
    if (rotationAxis.lengthSq() < 1e-6) {
      rotationAxis.set(-1, 0, 0);
    } else {
      rotationAxis.normalize();
    }

    const maxAngle = EXTENSION_END_ANGLE_RAD - EXTENSION_START_ANGLE_RAD;
    const uShinBent = uThigh.clone().applyAxisAngle(rotationAxis, EXTENSION_START_ANGLE_RAD);
    const uShinEnd = uThigh.clone().applyAxisAngle(rotationAxis, EXTENSION_END_ANGLE_RAD);
    const restDistal = pivot.clone().addScaledVector(uShinBent, shinLength);
    const endDistal = pivot.clone().addScaledVector(uShinEnd, shinLength);

    const trajectoryArcPoints = buildRotationTrajectory(
      pivot,
      uShinBent,
      rotationAxis,
      maxAngle,
      shinLength,
    );

    const arrowPos = endDistal;
    const arrowTangent = new THREE.Vector3().crossVectors(rotationAxis, uShinEnd).normalize();
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
      maxAngle,
      trajectoryArcPoints,
      arrowPos,
      arrowQuat,
      hingePinQuat,
      angleArcRadius: 0.06,
      reverseCycle: false,
      jumpBack: true,
    };
  }

  if (motion === 'abduction') {
    // Shoulder Abduction: Arm raises away from midline in coronal plane, then jumps back down to side
    const pivot = resolveWorldLandmark(scene, 'joint_shoulder', [0.163, 1.378, -0.028], frame);
    const anchor = resolveWorldLandmark(scene, 'bone_spine', [0.0, 1.35, 0.0], frame);
    const restDistal = resolveWorldLandmark(scene, 'joint_wrist', [0.265, 0.852, 0.022], frame);

    const uTrunk = new THREE.Vector3().subVectors(anchor, pivot).normalize();
    const uArmRest = new THREE.Vector3().subVectors(restDistal, pivot).normalize();
    const armLength = pivot.distanceTo(restDistal);

    // Normal to coronal plane (+Z anterior)
    const rotationAxis = new THREE.Vector3(0, 0, 1);
    const maxAngle = (85 * Math.PI) / 180; // ~85° abduction

    const trajectoryArcPoints = buildRotationTrajectory(
      pivot,
      uArmRest,
      rotationAxis,
      maxAngle,
      armLength,
    );

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
      reverseCycle: false,
      jumpBack: true,
    };
  }

  if (motion === 'adduction') {
    // Shoulder Adduction: Arm lowers from raised abducted position toward midline, then jumps back up
    const pivot = resolveWorldLandmark(scene, 'joint_shoulder', [0.163, 1.378, -0.028], frame);
    const anchor = resolveWorldLandmark(scene, 'bone_spine', [0.0, 1.35, 0.0], frame);
    const wristAtSide = resolveWorldLandmark(scene, 'joint_wrist', [0.265, 0.852, 0.022], frame);

    const uTrunk = new THREE.Vector3().subVectors(anchor, pivot).normalize();
    const uArmRest = new THREE.Vector3().subVectors(wristAtSide, pivot).normalize();
    const armLength = pivot.distanceTo(wristAtSide);

    // Abducted starting direction (raised ~85° laterally away from midline)
    const abdAxis = new THREE.Vector3(0, 0, 1);
    const maxAngle = (85 * Math.PI) / 180;
    const uArmRaised = uArmRest.clone().applyAxisAngle(abdAxis, maxAngle);
    const raisedDistal = pivot.clone().addScaledVector(uArmRaised, armLength);

    // Adduction rotates arm back down toward midline around -Z axis
    const rotationAxis = new THREE.Vector3(0, 0, -1);

    const trajectoryArcPoints = buildRotationTrajectory(
      pivot,
      uArmRaised,
      rotationAxis,
      maxAngle,
      armLength,
    );

    // Arrowhead at the lowered position at side, pointing down/medially in direction of adduction
    const arrowPos = wristAtSide.clone();
    const arrowTangent = new THREE.Vector3().crossVectors(rotationAxis, uArmRest).normalize();
    const arrowQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      arrowTangent,
    );
    const hingePinQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      abdAxis,
    );

    return {
      motion,
      pivot,
      anchor,
      restDistal: raisedDistal, // Ghosted reference line marks the starting raised position
      uAnchor: uTrunk,
      uDistal0: uArmRaised,
      distalLength: armLength,
      rotationAxis,
      maxAngle,
      trajectoryArcPoints,
      arrowPos,
      arrowQuat,
      hingePinQuat,
      angleArcRadius: 0.07,
      reverseCycle: false,
      jumpBack: true,
    };
  }

  // Forearm Pronation & Supination: 180° axial rotation centered around wrist
  const isPronation = motion === 'pronation';
  const pivot = resolveWorldLandmark(scene, 'joint_wrist', [0.265, 0.852, 0.022], frame);
  const anchor = resolveWorldLandmark(scene, 'joint_elbow', [0.22, 1.107, -0.037], frame);

  // Forearm long axis pointing down from elbow to wrist
  const uForearm = new THREE.Vector3().subVectors(pivot, anchor).normalize();

  // Orthogonal basis vectors in the wrist transverse plane
  const zAnt = new THREE.Vector3(0, 0, 1);
  const uAnterior = zAnt.clone().sub(uForearm.clone().multiplyScalar(zAnt.dot(uForearm))).normalize();
  const uLateral = new THREE.Vector3().crossVectors(uAnterior, uForearm).normalize();
  const uMedial = uLateral.clone().negate();

  const rotationAxis = isPronation ? uForearm.clone() : uForearm.clone().negate();
  const startDir = isPronation ? uLateral : uMedial;
  const endDir = isPronation ? uMedial : uLateral;
  const maxAngle = Math.PI;
  const arcRadius = 0.055;
  const pointerLength = 0.075;

  const trajectoryArcPoints = buildRotationTrajectory(
    pivot,
    startDir,
    rotationAxis,
    maxAngle,
    arcRadius,
  );

  // Arrowhead at the 180° end of the curve, pointing in the direction of rotation
  const arrowPos = pivot.clone().addScaledVector(endDir, arcRadius);
  const arrowTangent = new THREE.Vector3().crossVectors(rotationAxis, endDir).normalize();
  const arrowQuat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    arrowTangent,
  );
  const hingePinQuat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    uForearm,
  );

  const restDistal = pivot.clone().addScaledVector(startDir, pointerLength);

  return {
    motion,
    pivot,
    anchor,
    restDistal,
    uAnchor: uAnterior,
    uDistal0: startDir,
    distalLength: pointerLength,
    rotationAxis,
    maxAngle,
    trajectoryArcPoints,
    arrowPos,
    arrowQuat,
    hingePinQuat,
    angleArcRadius: 0,
    reverseCycle: false,
    jumpBack: true,
  };
}

export default function TermJointMotion({ term }: { term: AnatomyTerm }): React.ReactElement | null {
  const frame = useMuscleStore((s) => s.anatomyStageFrame);
  const { scene, invalidate } = useThree();
  const motion = motionForTerm(term.id);
  const [sceneReadyNonce, setSceneReadyNonce] = useState(0);

  const spec = useMemo(
    () => (motion ? buildJointMotionSpec(motion, scene, frame) : null),
    [frame, motion, scene, sceneReadyNonce],
  );

  const [currentDistal, setCurrentDistal] = useState<[number, number, number]>(() => {
    if (!spec) return [0, 0, 0];
    return [spec.restDistal.x, spec.restDistal.y, spec.restDistal.z];
  });

  const [angleArcPoints, setAngleArcPoints] = useState<[number, number, number][]>(() => {
    if (!spec) return [];
    return buildAngleArcPoints(
      spec.pivot,
      spec.uDistal0,
      spec.uAnchor,
      spec.rotationAxis,
      spec.angleArcRadius,
    );
  });

  useFrame(({ clock }) => {
    if (!spec) return;

    // Advance render in frameloop="demand" while animation is playing
    invalidate();

    // If scene meshes were still loading on initial mount, re-resolve once elbow is attached
    if (sceneReadyNonce === 0) {
      const elbowObj = findSceneObjectForNodeId(scene, 'joint_elbow');
      if (elbowObj) {
        setSceneReadyNonce(1);
      }
    }

    const progress = computeMotionProgress(
      clock.getElapsedTime(),
      spec.jumpBack,
      spec.reverseCycle,
    );
    const currentAngle = progress * spec.maxAngle;

    const currentDir = spec.uDistal0.clone().applyAxisAngle(spec.rotationAxis, currentAngle);
    const movingDistal = spec.pivot.clone().addScaledVector(currentDir, spec.distalLength);
    setCurrentDistal([movingDistal.x, movingDistal.y, movingDistal.z]);

    // Compute joint angle arc points showing the changing angle
    setAngleArcPoints(
      buildAngleArcPoints(
        spec.pivot,
        currentDir,
        spec.uAnchor,
        spec.rotationAxis,
        spec.angleArcRadius,
      ),
    );
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
