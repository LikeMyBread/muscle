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
export function getKinematicSegmentForNodeId(
  nodeId: string,
  nodeRegion?: string,
  nodeName?: string,
): KinematicSegment {
  const text = (nodeId + ' ' + (nodeName || '')).toLowerCase();

  // 1. Pelvis (Root of hip assembly)
  if (
    nodeId === 'bone_pelvis' ||
    text.includes('pelvis') ||
    text.includes('sacrum') ||
    text.includes('coccyx') ||
    text.includes('ilium') ||
    text.includes('ischium') ||
    text.includes('pubis') ||
    text.includes('sacroiliac')
  ) {
    return 'pelvis';
  }

  // 2. Foot
  const isEyelidTarsus =
    text.includes('superior_tarsus') ||
    text.includes('inferior_tarsus') ||
    text.includes('superior tarsus') ||
    text.includes('inferior tarsus');

  if (
    !isEyelidTarsus &&
    (nodeId === 'bone_calcaneus' ||
      nodeId === 'bone_talus' ||
      nodeId === 'bone_tarsals' ||
      nodeId === 'bone_metatarsals' ||
      nodeId === 'bone_phalanges_foot' ||
      nodeId === 'joint_ankle' ||
      nodeId === 'joint_subtalar' ||
      nodeRegion === 'foot' ||
      text.includes('foot') ||
      text.includes('calcane') ||
      text.includes('talus') ||
      text.includes('tarsal') ||
      text.includes('metatarsal') ||
      text.includes('plantar') ||
      text.includes('sesamoid') ||
      text.includes('cuneiform') ||
      text.includes('cuboid') ||
      text.includes('navicular') ||
      text.includes('hallucis_brevis') ||
      text.includes('hallucis brevis') ||
      text.includes('abductor_hallucis') ||
      text.includes('abductor hallucis') ||
      text.includes('adductor_hallucis') ||
      text.includes('adductor hallucis') ||
      text.includes('digiti_minimi_of_foot') ||
      text.includes('digiti minimi of foot') ||
      text.includes('quadratus_plantae') ||
      text.includes('quadratus plantae') ||
      text.includes('extensor_digitorum_brevis') ||
      text.includes('extensor digitorum brevis') ||
      text.includes('flexor_digitorum_brevis') ||
      text.includes('flexor digitorum brevis'))
  ) {
    return 'foot';
  }

  // 3. Shin / Lower leg (Parented to knee pivot)
  if (
    nodeId === 'bone_tibia' ||
    nodeId === 'bone_fibula' ||
    nodeId === 'bone_patella' ||
    nodeId === 'joint_knee' ||
    text.includes('tibia') ||
    text.includes('fibula') ||
    text.includes('fibular') ||
    text.includes('patella') ||
    text.includes('interosseus_membrane_of_leg') ||
    text.includes('interosseus membrane of leg') ||
    text.includes('tibialis') ||
    text.includes('gastrocnemius') ||
    text.includes('soleus') ||
    text.includes('solear') ||
    text.includes('popliteus') ||
    text.includes('plantaris') ||
    text.includes('peroneus') ||
    text.includes('fibularis') ||
    text.includes('extensor_digitorum_longus') ||
    text.includes('extensor digitorum longus') ||
    text.includes('flexor_digitorum_longus') ||
    text.includes('flexor digitorum longus') ||
    text.includes('extensor_hallucis_longus') ||
    text.includes('extensor hallucis longus') ||
    text.includes('flexor_hallucis_longus') ||
    text.includes('flexor hallucis longus')
  ) {
    return 'shin';
  }

  // 4. Thigh / Hip (Parented to hip pivot)
  if (
    nodeId === 'bone_femur' ||
    nodeId === 'joint_hip' ||
    text.includes('femur') ||
    text.includes('femoris') ||
    text.includes('thigh') ||
    text.includes('quadriceps') ||
    text.includes('vastus') ||
    text.includes('gluteus') ||
    text.includes('glute') ||
    text.includes('adductor') ||
    text.includes('hamstring') ||
    text.includes('semitendinosus') ||
    text.includes('semimembranosus') ||
    text.includes('sartorius') ||
    text.includes('gracilis') ||
    text.includes('pectineus') ||
    text.includes('piriformis') ||
    text.includes('obturator') ||
    text.includes('gemellus') ||
    text.includes('tensor_fasciae_latae') ||
    text.includes('iliopsoas') ||
    text.includes('iliacus') ||
    text.includes('psoas')
  ) {
    return 'thigh';
  }

  // 5. Hand (Parented to wrist pivot)
  if (
    nodeId === 'bone_carpals' ||
    nodeId === 'bone_metacarpals' ||
    nodeId === 'bone_phalanges_hand' ||
    nodeId.startsWith('joint_wrist') ||
    nodeId === 'joint_thumb_cmc' ||
    nodeId === 'joint_intercarpal' ||
    nodeRegion === 'hand' ||
    text.includes('hand') ||
    text.includes('wrist') ||
    text.includes('carpal') ||
    text.includes('metacarpal') ||
    text.includes('thenar') ||
    text.includes('hypothenar') ||
    text.includes('palmaris_brevis') ||
    text.includes('palmaris brevis') ||
    text.includes('pollicis_brevis') ||
    text.includes('pollicis brevis') ||
    text.includes('abductor_pollicis_brevis') ||
    text.includes('abductor pollicis brevis') ||
    text.includes('opponens_pollicis') ||
    text.includes('opponens pollicis') ||
    text.includes('adductor_pollicis') ||
    text.includes('adductor pollicis') ||
    text.includes('interossei_of_hand') ||
    text.includes('interossei of hand') ||
    text.includes('lumbricals_of_hand') ||
    text.includes('lumbricals of hand') ||
    text.includes('digiti_minimi_of_hand') ||
    text.includes('digiti minimi of hand') ||
    text.includes('finger')
  ) {
    return 'hand';
  }

  // 6. Forearm (Parented to elbow pivot)
  if (
    nodeId === 'bone_radius' ||
    nodeId === 'bone_ulna' ||
    nodeId === 'joint_elbow' ||
    nodeId === 'joint_proximal_radioulnar' ||
    text.includes('radius') ||
    text.includes('radial') ||
    text.includes('ulna') ||
    text.includes('ulnar') ||
    text.includes('elbow') ||
    text.includes('forearm') ||
    text.includes('antebrach') ||
    text.includes('brachioradialis') ||
    text.includes('carpi') ||
    text.includes('pronator') ||
    text.includes('supinator') ||
    text.includes('anconeus') ||
    text.includes('palmaris_longus') ||
    text.includes('palmaris longus') ||
    text.includes('flexor_digitorum') ||
    text.includes('flexor digitorum') ||
    text.includes('extensor_digitorum') ||
    text.includes('extensor digitorum') ||
    text.includes('extensor_indicis') ||
    text.includes('extensor indicis') ||
    text.includes('extensor_pollicis') ||
    text.includes('extensor pollicis') ||
    text.includes('abductor_pollicis_longus') ||
    text.includes('abductor pollicis longus') ||
    text.includes('flexor_pollicis_longus') ||
    text.includes('flexor pollicis longus')
  ) {
    return 'forearm';
  }

  // 7. Arm (Parented to shoulder pivot)
  if (
    nodeId === 'bone_humerus' ||
    nodeId === 'joint_shoulder' ||
    nodeRegion === 'arm' ||
    text.includes('humerus') ||
    text.includes('deltoid') ||
    text.includes('biceps_brachii') ||
    text.includes('biceps brachii') ||
    (text.includes('biceps') && !text.includes('femoris')) ||
    (text.includes('brachialis') && !text.includes('brachioradialis')) ||
    (text.includes('triceps') && !text.includes('surae')) ||
    text.includes('coracobrachialis') ||
    text.includes('glenohumeral')
  ) {
    return 'arm';
  }

  // 8. Spine / Trunk / Head
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
