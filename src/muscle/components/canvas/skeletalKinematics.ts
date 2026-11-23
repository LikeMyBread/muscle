import * as THREE from 'three';

export type KinematicSegment =
  | 'pelvis'
  | 'spine'
  | 'arm'
  | 'forearm'
  | 'hand'
  | 'thigh'
  | 'shin'
  | 'foot'
  | 'bridging';

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

  // 0. Bridging dual-anchored muscles (e.g. Psoas major spanning lumbar spine and femur, Plantaris spanning femur and shin)
  if (
    nodeId === 'atlas_psoas_muscle_r_08af9941' ||
    text === 'psoas muscle.r' ||
    text.includes('psoas_muscle') ||
    text.includes('psoas muscle')
  ) {
    return 'bridging';
  }

  if (
    nodeId === 'atlas_plantaris_muscle_r_5a2fd02c' ||
    text === 'plantaris muscle.r' ||
    text.includes('plantaris_muscle_r') ||
    (text.includes('plantaris') && !text.includes('origin') && !text.includes('orig'))
  ) {
    return 'bridging';
  }

  if (
    nodeId === 'atlas_transversus_abdominis_muscle_r_c20d1664' ||
    text === 'transversus abdominis muscle.r' ||
    text.includes('transversus_abdominis') ||
    text.includes('transversus abdominis')
  ) {
    return 'bridging';
  }

  if (
    nodeId === 'atlas_fascia_lata_r_d92bb3d0' ||
    text === 'fascia lata.r' ||
    text.includes('fascia_lata') ||
    text.includes('fascia lata')
  ) {
    return 'bridging';
  }

  // 1. Pelvis (Root of hip assembly)
  if (
    nodeId === 'bone_pelvis' ||
    text.includes('pelvis') ||
    text.includes('sacrum') ||
    text.includes('coccyx') ||
    text.includes('ilium') ||
    text.includes('ischium') ||
    text.includes('pubis') ||
    text.includes('sacroiliac') ||
    text.includes('iliac') ||
    text.includes('iliac_fossa') ||
    text.includes('iliac fossa')
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
      (text.includes('plantar') && !text.includes('plantaris')) ||
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
    (text.includes('gastrocnemius') && !text.includes('plantaris')) ||
    text.includes('soleus') ||
    text.includes('solear') ||
    text.includes('popliteus') ||
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

  // 4. Hand (Parented to wrist pivot)
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
    text.includes('policis_brevis') ||
    text.includes('policis brevis') ||
    text.includes('abductor_pollicis_brevis') ||
    text.includes('abductor pollicis brevis') ||
    text.includes('opponens_pollicis') ||
    text.includes('opponens pollicis') ||
    text.includes('adductor_pollicis') ||
    text.includes('adductor pollicis') ||
    text.includes('adductor_policis') ||
    text.includes('adductor policis') ||
    text.includes('interossei_of_hand') ||
    text.includes('interossei of hand') ||
    text.includes('lumbricals_of_hand') ||
    text.includes('lumbricals of hand') ||
    nodeId === 'atlas_abductor_digiti_minimi_r_84af0e15' ||
    text === 'abductor digiti minimi.r' ||
    text.includes('abductor_digiti_minimi_r') ||
    (text.includes('abductor') &&
      text.includes('digiti') &&
      text.includes('minimi') &&
      !text.includes('foot')) ||
    text.includes('digiti_minimi_of_hand') ||
    text.includes('digiti minimi of hand') ||
    text.includes('finger')
  ) {
    return 'hand';
  }

  // Humeral bone insertions/origins always attach to the humerus (arm), not the forearm
  if (
    nodeId === 'atlas_bracioradialis_muscle_humeral_insert_03bc4dad' ||
    text.includes('humeral_insert') ||
    text.includes('humeral insertion') ||
    text.includes('humeral_insertion')
  ) {
    return 'arm';
  }

  // 5. Forearm (Parented to elbow pivot)
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
    text.includes('pronat') ||
    text.includes('pronta') ||
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
    text.includes('flexor pollicis longus') ||
    nodeId === 'atlas_extensor_digiti_minimi_r_a77e7b69' ||
    text === 'extensor digiti minimi.r' ||
    text.includes('extensor_digiti_minimi') ||
    text.includes('extensor digiti minimi')
  ) {
    return 'forearm';
  }

  // 6. Thigh / Hip (Parented to hip pivot)
  if (
    nodeId === 'bone_femur' ||
    nodeId === 'joint_hip' ||
    nodeId === 'atlas_origin_of_articularis_genus_r_85ebc333' ||
    text === 'origin of articularis genus.r' ||
    text.includes('articularis_genus') ||
    text.includes('articularis genus') ||
    text.includes('femur') ||
    text.includes('femoris') ||
    text.includes('thigh') ||
    text.includes('quadriceps') ||
    text.includes('vastus') ||
    text.includes('gluteus') ||
    text.includes('glute') ||
    (text.includes('adductor') &&
      !text.includes('pollicis') &&
      !text.includes('polic') &&
      !text.includes('hallucis')) ||
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
    text.includes('iliopsoas_ending') ||
    text.includes('iliopsoas ending') ||
    (text.includes('plantaris') && (text.includes('origin') || text.includes('orig')))
  ) {
    return 'thigh';
  }

  // 7. Arm (Parented to shoulder pivot)
  if (
    nodeId === 'bone_humerus' ||
    nodeId === 'joint_shoulder' ||
    nodeRegion === 'arm' ||
    text.includes('humerus') ||
    text.includes('humeral') ||
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
  activeMotionLabel?: string;
}

export interface ProceduralJointAngles extends JointAngleState {
  leftShoulderAbduction: number;
  rightShoulderAbduction: number;
  leftElbowFlexion: number;
  rightElbowFlexion: number;
  leftHipFlexion: number;
  rightHipFlexion: number;
  leftKneeFlexion: number;
  rightKneeFlexion: number;
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
export function computeProceduralJointAngles(elapsedSeconds: number): ProceduralJointAngles {
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
      leftElbowFlexion: angle,
      rightElbowFlexion: angle,
      leftShoulderAbduction: 0,
      rightShoulderAbduction: 0,
      leftKneeFlexion: 0,
      rightKneeFlexion: 0,
      leftHipFlexion: 0,
      rightHipFlexion: 0,
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
      leftElbowFlexion: 0,
      rightElbowFlexion: 0,
      leftShoulderAbduction: angle,
      rightShoulderAbduction: angle,
      leftKneeFlexion: 0,
      rightKneeFlexion: 0,
      leftHipFlexion: 0,
      rightHipFlexion: 0,
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
      leftElbowFlexion: 0,
      rightElbowFlexion: 0,
      leftShoulderAbduction: 0,
      rightShoulderAbduction: 0,
      leftKneeFlexion: angle,
      rightKneeFlexion: angle,
      leftHipFlexion: 0,
      rightHipFlexion: 0,
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
    leftElbowFlexion: 0,
    rightElbowFlexion: 0,
    leftShoulderAbduction: 0,
    rightShoulderAbduction: 0,
    leftKneeFlexion: 0,
    rightKneeFlexion: 0,
    leftHipFlexion: hipAngle,
    rightHipFlexion: hipAngle,
    activeMotionLabel: 'Hip & trunk motion',
  };
}

/**
 * Deforms a dual-anchored bridging muscle mesh (like Psoas major) between the torso/spine and thigh.
 * Top vertices (Y >= 1.05) stay rigidly anchored to the lumbar spine / torso.
 * Bottom vertices (Y <= 0.82) follow the lesser trochanter on the femur.
 * Intermediate vertices smoothly blend, preventing the muscle from protruding through the back.
 */
export function deformBridgingPsoasMesh(
  mesh: THREE.Mesh,
  thetaHip: number,
  thetaSpine: number,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const cosH = Math.cos(thetaHip);
  const sinH = Math.sin(thetaHip);
  const cosS = Math.cos(thetaSpine);
  const sinS = Math.sin(thetaSpine);

  const hip = KINEMATIC_PIVOTS.hip;
  const spine = KINEMATIC_PIVOTS.spine;

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // Thigh transform around hip pivot
    const dyH = y0 - hip.y;
    const dzH = z0 - hip.z;
    const yThigh = hip.y + (dyH * cosH - dzH * sinH);
    const zThigh = hip.z + (dyH * sinH + dzH * cosH);

    // Spine transform around spine pivot
    const dyS = y0 - spine.y;
    const dzS = z0 - spine.z;
    const ySpine = spine.y + (dyS * cosS - dzS * sinS);
    const zSpine = spine.z + (dyS * sinS + dzS * cosS);

    // Smooth weight between spine (w = 0) and thigh (w = 1)
    let t = (1.05 - y0) / (1.05 - 0.82);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const w = t * t * (3 - 2 * t);

    arr[idx] = x0;
    arr[idx + 1] = (1 - w) * ySpine + w * yThigh;
    arr[idx + 2] = (1 - w) * zSpine + w * zThigh;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isPsoasMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  return text.includes('psoas');
}

export function isPlantarisMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  return (
    mesh.name === 'atlas_plantaris_muscle_r_5a2fd02c' ||
    (text.includes('plantaris') && !text.includes('origin') && !text.includes('orig'))
  );
}

/**
 * Deforms a dual-anchored bridging muscle mesh (Plantaris) across the knee joint between the femur (thigh) and shin/foot.
 * Top vertices (Y >= 0.485) stay rigidly anchored to the distal posterior femur (thigh).
 * Lower vertices (Y <= 0.410) follow the shin/calcaneus (knee flexion).
 * Intermediate vertices smoothly blend across the posterior knee joint, preventing the upper end
 * from detaching or protruding forward through the femur and knee.
 */
export function deformBridgingPlantarisMesh(
  mesh: THREE.Mesh,
  thetaThigh: number,
  thetaShin: number,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const cosK = Math.cos(thetaShin);
  const sinK = Math.sin(thetaShin);
  const cosH = Math.cos(thetaThigh);
  const sinH = Math.sin(thetaThigh);

  const knee = KINEMATIC_PIVOTS.knee;
  const hip = KINEMATIC_PIVOTS.hip;

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // Shin transform: rotate around knee pivot
    const dyK = y0 - knee.y;
    const dzK = z0 - knee.z;
    const yK = knee.y + (dyK * cosK - dzK * sinK);
    const zK = knee.z + (dyK * sinK + dzK * cosK);

    // Shin vertex in root space: compound rotation with hip
    const dyH_K = yK - hip.y;
    const dzH_K = zK - hip.z;
    const yShin = hip.y + (dyH_K * cosH - dzH_K * sinH);
    const zShin = hip.z + (dyH_K * sinH + dzH_K * cosH);

    // Thigh vertex in root space: rotation with hip only (stays fixed to femur)
    const dyH = y0 - hip.y;
    const dzH = z0 - hip.z;
    const yThigh = hip.y + (dyH * cosH - dzH * sinH);
    const zThigh = hip.z + (dyH * sinH + dzH * cosH);

    // Smooth weight between shin (w = 1 at y0 <= 0.410) and femur (w = 0 at y0 >= 0.485)
    let t = (0.485 - y0) / (0.485 - 0.410);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const wShin = t * t * (3 - 2 * t);
    const wThigh = 1 - wShin;

    arr[idx] = x0;
    arr[idx + 1] = wThigh * yThigh + wShin * yShin;
    arr[idx + 2] = wThigh * zThigh + wShin * zShin;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isTransversusAbdominisMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  return (
    text.includes('transversus_abdominis') ||
    text.includes('transversus abdominis') ||
    (text.includes('transverse') && text.includes('abdomin') && !text.includes('insertion'))
  );
}

/**
 * Deforms a dual-anchored bridging muscle mesh (Transversus abdominis) between the pelvis and ribcage/thorax.
 * Lower vertices (along the iliac crest, inguinal ligament, and pubic crest) stay rigidly anchored to the pelvis.
 * Upper vertices (Y >= 1.12) follow the costal margin on the ribcage.
 * Intermediate vertices smoothly blend and squash/stretch when the torso flexes or extends,
 * preventing the lower abdominal wall from detaching or cutting into the pelvic cavity while
 * preserving abdominal volume.
 */
export function deformBridgingTransversusAbdominisMesh(
  mesh: THREE.Mesh,
  thetaSpine: number,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const cosS = Math.cos(thetaSpine);
  const sinS = Math.sin(thetaSpine);

  const spine = KINEMATIC_PIVOTS.spine;
  const arr = posAttr.array as Float32Array;

  const C_squash = 0.045;
  const C_lat = 0.08;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // Spine/ribcage transform around spine pivot
    const dyS = y0 - spine.y;
    const dzS = z0 - spine.z;
    const ySpine = spine.y + (dyS * cosS - dzS * sinS);
    const zSpine = spine.z + (dyS * sinS + dzS * cosS);

    // Pelvic attachment contour rises from Y ≈ 0.94 anteriorly (inguinal/pubis)
    // to Y ≈ 0.98 laterally/posteriorly along the iliac crest
    const yBot = 0.98 - 0.6 * Math.max(0, z0 - 0.01);
    const yTop = 1.12;

    let t = (y0 - yBot) / (yTop - yBot);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const w = t * t * (3 - 2 * t);

    let x = x0;
    let y = (1 - w) * y0 + w * ySpine;
    let z = (1 - w) * z0 + w * zSpine;

    // Squash & stretch: volume preservation of the abdominal cavity
    if (thetaSpine !== 0 && t > 0 && t < 1) {
      const bulgeProfile = Math.sin(Math.PI * t);
      const zFactor = Math.max(0, (z0 - (-0.01)) / 0.11);
      z += C_squash * sinS * bulgeProfile * zFactor;
      x += C_lat * sinS * bulgeProfile * zFactor * x0;
    }

    arr[idx] = x;
    arr[idx + 1] = y;
    arr[idx + 2] = z;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isFasciaLataMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  return (
    mesh.name === 'atlas_fascia_lata_r_d92bb3d0' ||
    text.includes('fascia_lata') ||
    text.includes('fascia lata')
  );
}

/**
 * Deforms the multi-joint bridging Fascia lata mesh across leg animations.
 *
 * Lower vertices (along Gerdy's tubercle on the lateral tibial condyle, head of the fibula,
 * and patellar retinaculum at Y <= 0.410) follow the shin as the knee flexes and stretches.
 * Across the knee joint line (Y in [0.410, 0.470]), vertices smoothly blend along the arc of the
 * lateral femoral condyle, preventing volume collapse or bone interpenetration.
 *
 * Thigh body vertices (Y in [0.470, 0.850]) swing with the femur around the hip pivot.
 *
 * Upper vertices (along the iliac crest of the pelvis at Y >= 0.960) remain anchored to the
 * pelvis, smoothly stretching and adapting as the hip flexes and extends.
 */
export function deformBridgingFasciaLataMesh(
  mesh: THREE.Mesh,
  thetaHip: number,
  thetaKnee: number,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const knee = KINEMATIC_PIVOTS.knee;
  const hip = KINEMATIC_PIVOTS.hip;
  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // 1. Distal / Knee transition:
    // Below 0.410: fully follows shin (wK = 1)
    // Above 0.470: fully follows thigh (wK = 0)
    let tK = (0.470 - y0) / (0.470 - 0.410);
    if (tK < 0) tK = 0;
    if (tK > 1) tK = 1;
    const wK = tK * tK * (3 - 2 * tK);
    const thetaK_eff = wK * thetaKnee;

    const cosK_eff = Math.cos(thetaK_eff);
    const sinK_eff = Math.sin(thetaK_eff);

    const dyK = y0 - knee.y;
    const dzK = z0 - knee.z;
    const yK_prime = knee.y + (dyK * cosK_eff - dzK * sinK_eff);
    const zK_prime = knee.z + (dyK * sinK_eff + dzK * cosK_eff);

    // 2. Proximal / Hip transition:
    // Above 0.960: anchored to pelvis / iliac crest (wH = 1 -> thetaH_eff = 0)
    // Below 0.850: moves with thigh (wH = 0 -> thetaH_eff = thetaHip)
    let tH = (y0 - 0.850) / (0.960 - 0.850);
    if (tH < 0) tH = 0;
    if (tH > 1) tH = 1;
    const wH = tH * tH * (3 - 2 * tH);
    const thetaH_eff = (1 - wH) * thetaHip;

    const cosH_eff = Math.cos(thetaH_eff);
    const sinH_eff = Math.sin(thetaH_eff);

    const dyH = yK_prime - hip.y;
    const dzH = zK_prime - hip.z;
    const yFinal = hip.y + (dyH * cosH_eff - dzH * sinH_eff);
    const zFinal = hip.z + (dyH * sinH_eff + dzH * cosH_eff);

    arr[idx] = x0;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

/**
 * Universal dispatcher to deform any bridging mesh across its anchored kinematic joints.
 */
export function deformBridgingMesh(
  mesh: THREE.Mesh,
  rotations: KinematicPivotRotations,
): void {
  if (isPsoasMesh(mesh)) {
    deformBridgingPsoasMesh(mesh, rotations.thighRotationX, rotations.spineRotationX);
  } else if (isPlantarisMesh(mesh)) {
    deformBridgingPlantarisMesh(mesh, rotations.thighRotationX, rotations.shinRotationX);
  } else if (isTransversusAbdominisMesh(mesh)) {
    deformBridgingTransversusAbdominisMesh(mesh, rotations.spineRotationX);
  } else if (isFasciaLataMesh(mesh)) {
    deformBridgingFasciaLataMesh(mesh, rotations.thighRotationX, rotations.shinRotationX);
  }
}

export function restoreOriginalMeshPositions(mesh: THREE.Mesh): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr || !geom.userData.origPositions) return;

  const orig = geom.userData.origPositions as Float32Array;
  const arr = posAttr.array as Float32Array;
  arr.set(orig);
  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export const restoreOriginalPsoasPositions = restoreOriginalMeshPositions;
