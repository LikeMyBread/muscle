import * as THREE from 'three';

export type KinematicSegment =
  | 'pelvis'
  | 'spine'
  | 'arm'
  | 'forearm'
  | 'hand'
  | 'thigh'
  | 'shin'
  | 'foot';

/**
 * Calibrated anatomical joint pivot coordinates in local rest space (before layout transform).
 * Calibrated against Z-Anatomy bone endpoints and joint capsule centers.
 */
export const KINEMATIC_PIVOTS = {
  spine: new THREE.Vector3(0.0, 1.05, -0.05),
  shoulder: new THREE.Vector3(0.163, 1.378, -0.028),
  elbow: new THREE.Vector3(0.22, 1.107, -0.037),
  wrist: new THREE.Vector3(0.265, 0.852, 0.022),
  hip: new THREE.Vector3(0.09, 0.885, -0.007),
  knee: new THREE.Vector3(0.095, 0.435, -0.026),
  ankle: new THREE.Vector3(0.08, 0.075, -0.029),
} as const;

/**
 * Assigns an anatomy node to its corresponding rigid skeletal kinematic segment.
 */
export function getKinematicSegmentForNodeId(nodeId: string, nodeRegion?: string): KinematicSegment {
  if (nodeId === 'bone_pelvis') return 'pelvis';

  if (
    nodeId === 'bone_carpals' ||
    nodeId === 'bone_metacarpals' ||
    nodeId === 'bone_phalanges_hand' ||
    nodeId.startsWith('joint_wrist') ||
    nodeId === 'joint_thumb_cmc' ||
    nodeId === 'joint_intercarpal' ||
    nodeId.includes('hand') ||
    nodeId.includes('thenar') ||
    nodeId.includes('digitorum')
  ) {
    return 'hand';
  }

  if (
    nodeId === 'bone_radius' ||
    nodeId === 'bone_ulna' ||
    nodeId === 'joint_elbow' ||
    nodeId === 'joint_proximal_radioulnar' ||
    nodeId.includes('brachioradialis') ||
    nodeId.includes('carpi')
  ) {
    return 'forearm';
  }

  if (
    nodeId === 'bone_humerus' ||
    nodeId === 'joint_shoulder' ||
    nodeId.includes('deltoid') ||
    nodeId.includes('biceps_brachii') ||
    nodeId.includes('brachialis') ||
    nodeId.includes('triceps')
  ) {
    return 'arm';
  }

  if (
    nodeId === 'bone_calcaneus' ||
    nodeId === 'bone_talus' ||
    nodeId === 'bone_tarsals' ||
    nodeId === 'bone_metatarsals' ||
    nodeId === 'bone_phalanges_foot' ||
    nodeId === 'joint_ankle' ||
    nodeId === 'joint_subtalar' ||
    nodeRegion === 'foot'
  ) {
    return 'foot';
  }

  if (
    nodeId === 'bone_tibia' ||
    nodeId === 'bone_patella' ||
    nodeId === 'joint_knee' ||
    nodeId.includes('tibialis') ||
    nodeId.includes('gastrocnemius') ||
    nodeId.includes('soleus')
  ) {
    return 'shin';
  }

  if (
    nodeId === 'bone_femur' ||
    nodeId === 'joint_hip' ||
    nodeId.includes('quadriceps') ||
    nodeId.includes('gluteus') ||
    nodeId.includes('femoris') ||
    nodeId.includes('adductor') ||
    nodeId.includes('hamstring')
  ) {
    return 'thigh';
  }

  return 'spine';
}

export interface JointAngleState {
  elbowFlexion: number;
  shoulderAbduction: number;
  kneeFlexion: number;
  hipFlexion: number;
  spineFlexion: number;
  activeMotionLabel: string;
}

export interface KinematicPivotRotations {
  forearmRotationX: number;
  armRotationZ: number;
  shinRotationX: number;
  thighRotationX: number;
  spineRotationX: number;
}

/**
 * Computes exact Euler rotations (in radians) for each joint pivot group in Three.js coordinates.
 *
 * In Three.js right-handed coordinate space (where anterior/front is +Z and superior/up is +Y):
 * - Forearm hangs down (-Y): a negative rotation around X swings it forward (+Z, anterior) -> Elbow flexion.
 * - Shin hangs down (-Y): a positive rotation around X swings it backward (-Z, posterior) -> Knee flexion.
 * - Thigh hangs down (-Y): a negative rotation around X swings it forward (+Z, anterior) -> Hip flexion.
 * - Spine extends up (+Y): a positive rotation around X bends it forward (+Z, anterior) -> Trunk flexion.
 * - Arm hangs down: a positive rotation around Z swings it laterally (+X) -> Shoulder abduction.
 */
export function computeKinematicRotations(angles: JointAngleState): KinematicPivotRotations {
  return {
    forearmRotationX: -angles.elbowFlexion,
    armRotationZ: angles.shoulderAbduction,
    shinRotationX: angles.kneeFlexion,
    thighRotationX: -angles.hipFlexion,
    spineRotationX: angles.spineFlexion,
  };
}

export const ANIMATION_CYCLE_DURATION = 16.0;

/**
 * Computes procedural joint angles across a 16-second demonstration cycle.
 */
export function computeProceduralJointAngles(elapsedSeconds: number): JointAngleState {
  const phase = ((elapsedSeconds % ANIMATION_CYCLE_DURATION) + ANIMATION_CYCLE_DURATION) % ANIMATION_CYCLE_DURATION;

  // 0 - 4s: Elbow flexion / extension (0° to 125°)
  if (phase < 4.0) {
    const s = phase / 4.0;
    const angle = Math.pow(Math.sin(Math.PI * s), 2) * ((125 * Math.PI) / 180);
    return {
      elbowFlexion: angle,
      shoulderAbduction: 0,
      kneeFlexion: 0,
      hipFlexion: 0,
      spineFlexion: 0,
      activeMotionLabel: 'Elbow flexion & extension',
    };
  }

  // 4 - 8s: Shoulder abduction / adduction (0° to 80°)
  if (phase < 8.0) {
    const s = (phase - 4.0) / 4.0;
    const angle = Math.pow(Math.sin(Math.PI * s), 2) * ((80 * Math.PI) / 180);
    return {
      elbowFlexion: 0,
      shoulderAbduction: angle,
      kneeFlexion: 0,
      hipFlexion: 0,
      spineFlexion: 0,
      activeMotionLabel: 'Shoulder abduction & adduction',
    };
  }

  // 8 - 12s: Knee flexion / extension (0° to 90°)
  if (phase < 12.0) {
    const s = (phase - 8.0) / 4.0;
    const angle = Math.pow(Math.sin(Math.PI * s), 2) * ((90 * Math.PI) / 180);
    return {
      elbowFlexion: 0,
      shoulderAbduction: 0,
      kneeFlexion: angle,
      hipFlexion: 0,
      spineFlexion: 0,
      activeMotionLabel: 'Knee flexion & extension',
    };
  }

  // 12 - 16s: Hip flexion (0° to 45°) & Spine bend (0° to 15°)
  const s = (phase - 12.0) / 4.0;
  const hipAngle = Math.pow(Math.sin(Math.PI * s), 2) * ((45 * Math.PI) / 180);
  const spineAngle = Math.pow(Math.sin(Math.PI * s), 2) * ((15 * Math.PI) / 180);
  return {
    elbowFlexion: 0,
    shoulderAbduction: 0,
    kneeFlexion: 0,
    hipFlexion: hipAngle,
    spineFlexion: spineAngle,
    activeMotionLabel: 'Hip & trunk motion',
  };
}
