import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  ANIMATION_CYCLE_DURATION,
  computeKinematicRotations,
  computeProceduralJointAngles,
  deformBridgingFasciaLataMesh,
  deformBridgingMesh,
  deformBridgingPlantarisMesh,
  deformBridgingPsoasMesh,
  deformBridgingTransversusAbdominisMesh,
  getKinematicSegmentForNodeId,
  isFasciaLataMesh,
  KINEMATIC_PIVOTS,
  restoreOriginalMeshPositions,
  restoreOriginalPsoasPositions,
} from './skeletalKinematics';

describe('skeletalKinematics', () => {
  it('maps curriculum bones and joints to correct kinematic segments', () => {
    // Pelvis
    expect(getKinematicSegmentForNodeId('bone_pelvis')).toBe('pelvis');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_origin_of_psoas_minor_on_iliac_fossa_d611611c',
        undefined,
        'Origin of psoas minor on Iliac fossa.r',
      ),
    ).toBe('pelvis');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_transverse_abdominal_muscle_iliac_in_601d27d4',
        undefined,
        'Transverse abdominal muscle-Iliac insertion.r',
      ),
    ).toBe('pelvis');

    // Bridging dual-anchored muscles (Psoas, Plantaris, Transversus abdominis)
    expect(
      getKinematicSegmentForNodeId(
        'atlas_psoas_muscle_r_08af9941',
        undefined,
        'Psoas muscle.r',
      ),
    ).toBe('bridging');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_plantaris_muscle_r_5a2fd02c',
        undefined,
        'Plantaris muscle.r',
      ),
    ).toBe('bridging');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_transversus_abdominis_muscle_r_c20d1664',
        undefined,
        'Transversus abdominis muscle.r',
      ),
    ).toBe('bridging');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_fascia_lata_r_d92bb3d0',
        undefined,
        'Fascia lata.r',
      ),
    ).toBe('bridging');

    // Spine & upper trunk
    expect(getKinematicSegmentForNodeId('bone_spine')).toBe('spine');
    expect(getKinematicSegmentForNodeId('bone_ribcage')).toBe('spine');
    expect(getKinematicSegmentForNodeId('bone_sternum')).toBe('spine');
    expect(getKinematicSegmentForNodeId('bone_skull')).toBe('spine');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_transversus_thoracis_muscle_r_d3eeb8fd',
        undefined,
        'Transversus thoracis muscle.r',
      ),
    ).toBe('spine');

    // Upper arm
    expect(getKinematicSegmentForNodeId('bone_humerus')).toBe('arm');
    expect(getKinematicSegmentForNodeId('joint_shoulder')).toBe('arm');
    expect(getKinematicSegmentForNodeId('muscle_biceps_brachii')).toBe('arm');

    // Forearm
    expect(getKinematicSegmentForNodeId('bone_radius')).toBe('forearm');
    expect(getKinematicSegmentForNodeId('bone_ulna')).toBe('forearm');
    expect(getKinematicSegmentForNodeId('joint_elbow')).toBe('forearm');
    expect(getKinematicSegmentForNodeId('muscle_brachioradialis')).toBe('forearm');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_deep_head_of_prontaor_teres_muscle_r_5384bfe5',
        undefined,
        'Deep head of prontaor teres muscle.r',
      ),
    ).toBe('forearm');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_extensor_digiti_minimi_r_a77e7b69',
        undefined,
        'Extensor digiti minimi.r',
      ),
    ).toBe('forearm');

    // Hand
    expect(getKinematicSegmentForNodeId('bone_carpals')).toBe('hand');
    expect(getKinematicSegmentForNodeId('bone_metacarpals')).toBe('hand');
    expect(getKinematicSegmentForNodeId('joint_wrist')).toBe('hand');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_abductor_digiti_minimi_r_84af0e15',
        undefined,
        'Abductor digiti minimi.r',
      ),
    ).toBe('hand');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_transverse_head_of_adductor_pollicis_a8480383',
        undefined,
        'Transverse head of adductor pollicis brevis.r',
      ),
    ).toBe('hand');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_oblique_head_of_adductor_policis_bre_57a81bdb',
        undefined,
        'Oblique head of adductor policis brevis.r',
      ),
    ).toBe('hand');

    // Thigh
    expect(getKinematicSegmentForNodeId('bone_femur')).toBe('thigh');
    expect(getKinematicSegmentForNodeId('joint_hip')).toBe('thigh');
    expect(getKinematicSegmentForNodeId('muscle_quadriceps_rectus_femoris')).toBe('thigh');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_iliopsoas_ending_on_the_lesser_troch_bc5d086b',
        undefined,
        'Iliopsoas ending on the lesser trochanter.r',
      ),
    ).toBe('thigh');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_plantaris_muscle_medially_to_the_lat_3ef61b75',
        undefined,
        'Plantaris muscle medially to the lateral gastrocnemius origin.r',
      ),
    ).toBe('thigh');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_plantaris_muscle_medially_to_the_lat_143de19a',
        undefined,
        'Plantaris muscle medially to the lateral gastrocnemius orig',
      ),
    ).toBe('thigh');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_origin_of_articularis_genus_r_85ebc333',
        undefined,
        'Origin of articularis genus.r',
      ),
    ).toBe('thigh');

    // Shin
    expect(getKinematicSegmentForNodeId('bone_tibia')).toBe('shin');
    expect(getKinematicSegmentForNodeId('bone_fibula')).toBe('shin');
    expect(getKinematicSegmentForNodeId('bone_patella')).toBe('shin');
    expect(getKinematicSegmentForNodeId('joint_knee')).toBe('shin');
    expect(getKinematicSegmentForNodeId('muscle_gastrocnemius')).toBe('shin');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_interosseus_membrane_of_leg_r_b30da720',
        undefined,
        'Interosseus membrane of leg.r',
      ),
    ).toBe('shin');
    expect(
      getKinematicSegmentForNodeId('atlas_fibula_r_a2845080', undefined, 'Fibula.r'),
    ).toBe('shin');

    // Foot
    expect(getKinematicSegmentForNodeId('bone_calcaneus')).toBe('foot');
    expect(getKinematicSegmentForNodeId('bone_talus')).toBe('foot');
    expect(getKinematicSegmentForNodeId('joint_ankle')).toBe('foot');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_sesamoid_bones_of_foot_r_9fe412a6',
        undefined,
        'Sesamoid bones of foot.r',
      ),
    ).toBe('foot');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_abductor_digiti_minimi_of_foot_r_b4068044',
        undefined,
        'Abductor digiti minimi of foot.r',
      ),
    ).toBe('foot');
  });

  it('provides calibrated anatomical pivots for primary joints', () => {
    expect(KINEMATIC_PIVOTS.elbow.y).toBeCloseTo(1.107, 2);
    expect(KINEMATIC_PIVOTS.shoulder.y).toBeCloseTo(1.378, 2);
    expect(KINEMATIC_PIVOTS.wrist.y).toBeCloseTo(0.852, 2);
    expect(KINEMATIC_PIVOTS.hip.y).toBeCloseTo(0.885, 2);
    expect(KINEMATIC_PIVOTS.knee.y).toBeCloseTo(0.435, 2);
    expect(KINEMATIC_PIVOTS.ankle.y).toBeCloseTo(0.075, 2);
  });

  it('cycles smoothly through elbow, shoulder, knee, and hip/spine motions within anatomical limits', () => {
    expect(ANIMATION_CYCLE_DURATION).toBe(16.0);

    // 2s into cycle: peak elbow flexion
    const elbowMid = computeProceduralJointAngles(2.0);
    expect(elbowMid.elbowFlexion).toBeGreaterThan(1.5);
    expect(elbowMid.shoulderAbduction).toBe(0);
    expect(elbowMid.kneeFlexion).toBe(0);
    expect(elbowMid.activeMotionLabel).toContain('Elbow');

    // 6s into cycle: peak shoulder abduction
    const shoulderMid = computeProceduralJointAngles(6.0);
    expect(shoulderMid.shoulderAbduction).toBeGreaterThan(1.0);
    expect(shoulderMid.elbowFlexion).toBe(0);
    expect(shoulderMid.activeMotionLabel).toContain('Shoulder');

    // 10s into cycle: peak knee flexion
    const kneeMid = computeProceduralJointAngles(10.0);
    expect(kneeMid.kneeFlexion).toBeGreaterThan(1.2);
    expect(kneeMid.shoulderAbduction).toBe(0);
    expect(kneeMid.activeMotionLabel).toContain('Knee');

    // 14s into cycle: hip & spine motion
    const hipMid = computeProceduralJointAngles(14.0);
    expect(hipMid.hipFlexion).toBeGreaterThan(0.5);
    expect(hipMid.spineFlexion).toBeGreaterThan(0.1);
    expect(hipMid.activeMotionLabel).toContain('Hip');
  });

  it('computes correct rotation signs for anatomical joint movement in Three.js coordinates', () => {
    // Elbow flexion bends the forearm forward (+Z, anterior), which requires negative X rotation
    const elbowPose = computeProceduralJointAngles(2.0);
    const elbowRot = computeKinematicRotations(elbowPose);
    expect(elbowRot.forearmRotationX).toBeLessThan(0);
    expect(elbowRot.forearmRotationX).toBeCloseTo(-elbowPose.elbowFlexion, 4);

    // Shoulder abduction raises the arm laterally (+X), which requires positive Z rotation
    const shoulderPose = computeProceduralJointAngles(6.0);
    const shoulderRot = computeKinematicRotations(shoulderPose);
    expect(shoulderRot.armRotationZ).toBeGreaterThan(0);
    expect(shoulderRot.armRotationZ).toBeCloseTo(shoulderPose.shoulderAbduction, 4);

    // Knee flexion bends the shin backward (-Z, posterior), which requires positive X rotation
    const kneePose = computeProceduralJointAngles(10.0);
    const kneeRot = computeKinematicRotations(kneePose);
    expect(kneeRot.shinRotationX).toBeGreaterThan(0);
    expect(kneeRot.shinRotationX).toBeCloseTo(kneePose.kneeFlexion, 4);

    // Hip flexion swings the thigh forward (+Z, anterior), which requires negative X rotation
    const hipPose = computeProceduralJointAngles(14.0);
    const hipRot = computeKinematicRotations(hipPose);
    expect(hipRot.thighRotationX).toBeLessThan(0);
    expect(hipRot.thighRotationX).toBeCloseTo(-hipPose.hipFlexion, 4);

    // Spine flexion bends the trunk forward (+Z), which requires positive X rotation
    expect(hipRot.spineRotationX).toBeGreaterThan(0);
    expect(hipRot.spineRotationX).toBeCloseTo(hipPose.spineFlexion, 4);
  });

  it('deforms bridging psoas mesh without protruding through lumbar spine during hip flexion', () => {
    // Construct a mock geometry with 3 vertices:
    // v0: Upper lumbar origin (Y=1.10, Z=-0.04) -> strictly anchored to spine (w = 0)
    // v1: Lower insertion near lesser trochanter (Y=0.80, Z=0.00) -> strictly anchored to thigh (w = 1)
    // v2: Middle belly (Y=0.935, Z=-0.02) -> blended weight
    const rawCoords = [0.05, 1.1, -0.04, 0.06, 0.8, 0.0, 0.055, 0.935, -0.02];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geometry);

    // Apply hip flexion (thetaHip = -0.6 rad, ~34 degrees anterior swing) with neutral spine (thetaSpine = 0)
    deformBridgingPsoasMesh(mesh, -0.6, 0.0);

    const pos = geometry.attributes.position.array as Float32Array;

    // v0 (upper origin) should remain unchanged at rest coordinates because w = 0 and thetaSpine = 0
    expect(pos[0]).toBeCloseTo(rawCoords[0], 3);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 3);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 3);
    // Crucially, it must NOT protrude posteriorly into negative Z (which was the bug where it swung to -0.19)
    expect(pos[2]).toBeGreaterThanOrEqual(-0.04);

    // v1 (lower insertion) should follow the thigh anteriorly (Z increases in +Z)
    expect(pos[3]).toBeCloseTo(rawCoords[3], 3);
    expect(pos[5]).toBeGreaterThan(rawCoords[5]); // moved anteriorly (+Z)

    // v2 (middle belly) smoothly spans between the spine origin and the anterior femur
    expect(pos[8]).toBeGreaterThan(-0.04); // does not protrude past posterior spine limit
    expect(pos[8]).toBeGreaterThan(pos[2]);
    expect(pos[8]).toBeLessThan(pos[5]);

    // Restore original positions
    restoreOriginalPsoasPositions(mesh);
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);
    expect(pos[3]).toBeCloseTo(rawCoords[3], 5);
    expect(pos[4]).toBeCloseTo(rawCoords[4], 5);
    expect(pos[5]).toBeCloseTo(rawCoords[5], 5);
  });

  it('deforms bridging plantaris mesh across knee joint, keeping upper origin anchored to femur', () => {
    // Construct a mock geometry with 3 vertices:
    // v0: Upper femoral origin (Y=0.50, Z=-0.03) -> strictly anchored to femur (wShin = 0)
    // v1: Lower calf/tendon (Y=0.35, Z=-0.06) -> strictly anchored to shin (wShin = 1)
    // v2: Middle belly crossing knee (Y=0.445, Z=-0.04) -> blended weight
    const rawCoords = [0.09, 0.5, -0.03, 0.08, 0.35, -0.06, 0.085, 0.445, -0.04];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geometry);
    mesh.name = 'atlas_plantaris_muscle_r_5a2fd02c';

    // Apply knee flexion (thetaShin = 1.3 rad, ~75 degrees posterior swing) with neutral thigh (thetaThigh = 0)
    deformBridgingPlantarisMesh(mesh, 0.0, 1.3);

    const pos = geometry.attributes.position.array as Float32Array;

    // v0 (upper origin on femur) must remain fixed at rest coordinates
    expect(pos[0]).toBeCloseTo(rawCoords[0], 3);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 3);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 3);
    // Crucially, it must NOT swing forward into positive Z (which rigid shin did up to +0.05)
    expect(pos[2]).toBeLessThanOrEqual(-0.025);

    // v1 (lower tendon) must follow the shin posteriorly into negative Z
    expect(pos[3]).toBeCloseTo(rawCoords[3], 3);
    expect(pos[5]).toBeLessThan(rawCoords[5]); // swung posteriorly (-Z)

    // v2 (middle belly) smoothly spans between the femur origin and rotating shin
    expect(pos[8]).toBeGreaterThan(pos[5]); // stays anterior to the distal shin
    expect(pos[8]).toBeCloseTo(-0.029, 2);

    // Test restore
    restoreOriginalMeshPositions(mesh);
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);
    expect(pos[3]).toBeCloseTo(rawCoords[3], 5);
    expect(pos[4]).toBeCloseTo(rawCoords[4], 5);
    expect(pos[5]).toBeCloseTo(rawCoords[5], 5);
  });

  it('deforms bridging transversus abdominis mesh across spine flexion with pelvic anchor and squash/stretch', () => {
    // Construct a mock geometry with 3 vertices:
    // v0: Lower pelvic border (Y=0.88, Z=0.06) -> strictly anchored to pelvis (w = 0)
    // v1: Upper costal margin (Y=1.18, Z=0.08) -> strictly anchored to ribcage/spine (w = 1)
    // v2: Mid-anterior abdominal wall (Y=1.03, Z=0.07) -> flexible squashing/bulging belly
    const rawCoords = [0.08, 0.88, 0.06, 0.09, 1.18, 0.08, 0.1, 1.03, 0.07];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geometry);
    mesh.name = 'atlas_transversus_abdominis_muscle_r_c20d1664';

    // Apply forward torso flexion (thetaSpine = 0.25 rad, ~14 degrees)
    deformBridgingTransversusAbdominisMesh(mesh, 0.25);

    const pos = geometry.attributes.position.array as Float32Array;

    // v0 (pelvic anchor along pubic crest/inguinal ligament) must remain 100% fixed at rest coordinates
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);
    // Crucially, it must NOT swing backward into negative Z (which rigid spine did by -0.054 into the pelvis)
    expect(pos[2]).toBeGreaterThanOrEqual(rawCoords[2] - 1e-6);

    // v1 (ribcage anchor) must rotate forward and downward with the ribcage
    expect(pos[4]).toBeLessThan(rawCoords[4]); // Y lowered
    expect(pos[5]).toBeGreaterThan(rawCoords[5]); // Z moved forward

    // v2 (mid-anterior belly) squashes vertically (lower Y) and bulges forward (+Z) preserving abdominal volume
    expect(pos[7]).toBeLessThan(rawCoords[7]); // Y lowered
    expect(pos[8]).toBeGreaterThan(rawCoords[8]); // Z bulged forward organically rather than collapsing inward

    // Test restore
    restoreOriginalMeshPositions(mesh);
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);
    expect(pos[3]).toBeCloseTo(rawCoords[3], 5);
    expect(pos[4]).toBeCloseTo(rawCoords[4], 5);
    expect(pos[5]).toBeCloseTo(rawCoords[5], 5);
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);
  });

  it('deformBridgingMesh correctly dispatches between psoas, plantaris, and transversus abdominis', () => {
    const rawCoords = [0.09, 0.5, -0.03, 0.08, 0.35, -0.06, 0.085, 0.445, -0.04];
    const geomPlantaris = new THREE.BufferGeometry();
    geomPlantaris.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const meshPlantaris = new THREE.Mesh(geomPlantaris);
    meshPlantaris.name = 'atlas_plantaris_muscle_r_5a2fd02c';

    const geomPsoas = new THREE.BufferGeometry();
    geomPsoas.setAttribute('position', new THREE.Float32BufferAttribute([0.05, 1.1, -0.04], 3));
    const meshPsoas = new THREE.Mesh(geomPsoas);
    meshPsoas.name = 'atlas_psoas_muscle_r_08af9941';

    const geomTransversus = new THREE.BufferGeometry();
    geomTransversus.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([0.08, 0.88, 0.06, 0.09, 1.18, 0.08], 3),
    );
    const meshTransversus = new THREE.Mesh(geomTransversus);
    meshTransversus.name = 'atlas_transversus_abdominis_muscle_r_c20d1664';

    // 1. Knee flexion only: plantaris distal vertex swings posteriorly into negative Z
    deformBridgingMesh(meshPlantaris, {
      forearmRotationX: 0,
      armRotationZ: 0,
      shinRotationX: 1.3,
      thighRotationX: 0,
      spineRotationX: 0,
    });
    const posPlantaris = geomPlantaris.attributes.position.array as Float32Array;
    expect(posPlantaris[5]).toBeLessThan(-0.06);

    // 2. Spine flexion: psoas top vertex rotates with spine
    deformBridgingMesh(meshPsoas, {
      forearmRotationX: 0,
      armRotationZ: 0,
      shinRotationX: 0,
      thighRotationX: 0,
      spineRotationX: 0.1,
    });
    const posPsoas = geomPsoas.attributes.position.array as Float32Array;
    expect(posPsoas[1]).toBeGreaterThan(1.0);

    // 3. Spine flexion: transversus abdominis bottom stays at pelvis, top moves
    deformBridgingMesh(meshTransversus, {
      forearmRotationX: 0,
      armRotationZ: 0,
      shinRotationX: 0,
      thighRotationX: 0,
      spineRotationX: 0.25,
    });
    const posTrans = geomTransversus.attributes.position.array as Float32Array;
    expect(posTrans[1]).toBeCloseTo(0.88, 5); // bottom Y fixed to pelvis
    expect(posTrans[2]).toBeCloseTo(0.06, 5); // bottom Z fixed to pelvis
    expect(posTrans[4]).toBeLessThan(1.18); // top Y lowered

    // 4. Knee flexion: fascia lata distal vertex swings posteriorly into negative Z
    const geomFascia = new THREE.BufferGeometry();
    geomFascia.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([0.118, 0.40, -0.025, 0.14, 0.65, -0.01, 0.142, 0.98, -0.02], 3),
    );
    const meshFascia = new THREE.Mesh(geomFascia);
    meshFascia.name = 'atlas_fascia_lata_r_d92bb3d0';

    deformBridgingMesh(meshFascia, {
      forearmRotationX: 0,
      armRotationZ: 0,
      shinRotationX: 1.2,
      thighRotationX: 0,
      spineRotationX: 0,
    });
    const posFascia = geomFascia.attributes.position.array as Float32Array;
    expect(posFascia[2]).toBeLessThan(-0.025); // distal vertex moved with knee flexion
    expect(posFascia[5]).toBeCloseTo(-0.01, 5); // thigh vertex unaffected by pure knee flexion
    expect(posFascia[8]).toBeCloseTo(-0.02, 5); // iliac vertex unaffected by pure knee flexion
  });

  it('deforms bridging fascia lata mesh across hip and knee motions, with lower vertices following the shin', () => {
    // 3 representative vertices:
    // 0: distal insertion at Gerdy's tubercle / tibia (Y = 0.40, below knee pivot 0.435)
    // 1: mid-thigh body (Y = 0.65, between knee 0.435 and hip 0.885)
    // 2: proximal origin along iliac crest on pelvis (Y = 0.98, above hip pivot 0.885)
    const rawCoords = [
      0.118, 0.40, -0.025,
      0.14, 0.65, -0.01,
      0.142, 0.98, -0.02,
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geom);
    mesh.name = 'atlas_fascia_lata_r_d92bb3d0';

    // A. Knee flexion only:
    // Shin rotates backward (+X Euler rotation in Three.js coordinates)
    const kneeAngle = (90 * Math.PI) / 180;
    deformBridgingFasciaLataMesh(mesh, 0, kneeAngle);
    let pos = geom.attributes.position.array as Float32Array;

    // Distal vertex (idx 0..2) must swing posteriorly into negative Z
    expect(pos[2]).toBeLessThan(-0.025);
    // Mid-thigh vertex (idx 3..5) must stay fixed (not affected by knee flexion)
    expect(pos[4]).toBeCloseTo(0.65, 5);
    expect(pos[5]).toBeCloseTo(-0.01, 5);
    // Proximal iliac vertex (idx 6..8) must stay fixed to pelvis
    expect(pos[7]).toBeCloseTo(0.98, 5);
    expect(pos[8]).toBeCloseTo(-0.02, 5);

    // B. Hip flexion only:
    // Thigh rotates forward (-X Euler rotation in Three.js coordinates)
    const hipAngle = (-45 * Math.PI) / 180;
    deformBridgingFasciaLataMesh(mesh, hipAngle, 0);
    pos = geom.attributes.position.array as Float32Array;

    // Proximal iliac vertex (idx 6..8) remains anchored to pelvis
    expect(pos[7]).toBeCloseTo(0.98, 5);
    expect(pos[8]).toBeCloseTo(-0.02, 5);
    // Mid-thigh vertex (idx 3..5) swings forward (+Z)
    expect(pos[5]).toBeGreaterThan(-0.01);
    // Distal vertex (idx 0..2) also swings forward with the thigh
    expect(pos[2]).toBeGreaterThan(-0.025);

    // C. Combined Hip and Knee flexion:
    // Distal vertex compound transform: knee bends backward relative to forward-flexed thigh
    deformBridgingFasciaLataMesh(mesh, hipAngle, kneeAngle);
    pos = geom.attributes.position.array as Float32Array;
    expect(Number.isFinite(pos[0])).toBe(true);
    expect(Number.isFinite(pos[1])).toBe(true);
    expect(Number.isFinite(pos[2])).toBe(true);
    // Iliac vertex remains anchored to pelvis
    expect(pos[7]).toBeCloseTo(0.98, 5);
    expect(pos[8]).toBeCloseTo(-0.02, 5);

    // D. Restore original positions:
    restoreOriginalMeshPositions(mesh);
    pos = geom.attributes.position.array as Float32Array;
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);
    expect(pos[3]).toBeCloseTo(rawCoords[3], 5);
    expect(pos[4]).toBeCloseTo(rawCoords[4], 5);
    expect(pos[5]).toBeCloseTo(rawCoords[5], 5);
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);
  });

  it('supports separate left and right leg deformation for Fascia lata and Plantaris', () => {
    // Left leg has knee flexed, Right leg has knee extended (neutral)
    const rawCoordsFascia = [0.118, 0.40, -0.025, 0.14, 0.65, -0.01, 0.142, 0.98, -0.02];
    const leftGeomFascia = new THREE.BufferGeometry();
    leftGeomFascia.setAttribute('position', new THREE.Float32BufferAttribute(rawCoordsFascia, 3));
    const leftMeshFascia = new THREE.Mesh(leftGeomFascia);
    leftMeshFascia.name = 'atlas_fascia_lata_r_d92bb3d0';

    const rightGeomFascia = new THREE.BufferGeometry();
    rightGeomFascia.setAttribute('position', new THREE.Float32BufferAttribute(rawCoordsFascia, 3));
    const rightMeshFascia = new THREE.Mesh(rightGeomFascia);
    rightMeshFascia.name = 'atlas_fascia_lata_r_d92bb3d0';

    // Left knee flexed (kneeFlexion = 1.2 rad), Right knee neutral (0 rad)
    deformBridgingMesh(leftMeshFascia, {
      forearmRotationX: 0,
      armRotationZ: 0,
      shinRotationX: 1.2,
      thighRotationX: 0,
      spineRotationX: 0,
    });
    deformBridgingMesh(rightMeshFascia, {
      forearmRotationX: 0,
      armRotationZ: 0,
      shinRotationX: 0,
      thighRotationX: 0,
      spineRotationX: 0,
    });

    const leftPosFascia = leftGeomFascia.attributes.position.array as Float32Array;
    const rightPosFascia = rightGeomFascia.attributes.position.array as Float32Array;

    // Left distal vertex must have flexed with knee (Z < -0.025)
    expect(leftPosFascia[2]).toBeLessThan(-0.025);
    // Right distal vertex must remain at original neutral rest position
    expect(rightPosFascia[2]).toBeCloseTo(-0.025, 5);

    // Plantaris: Right leg has knee flexed, Left leg neutral
    const rawCoordsPlantaris = [0.04, 0.50, -0.05, 0.04, 0.38, -0.06];
    const leftGeomPlantaris = new THREE.BufferGeometry();
    leftGeomPlantaris.setAttribute('position', new THREE.Float32BufferAttribute(rawCoordsPlantaris, 3));
    const leftMeshPlantaris = new THREE.Mesh(leftGeomPlantaris);
    leftMeshPlantaris.name = 'atlas_plantaris_muscle_r_5a2fd02c';

    const rightGeomPlantaris = new THREE.BufferGeometry();
    rightGeomPlantaris.setAttribute('position', new THREE.Float32BufferAttribute(rawCoordsPlantaris, 3));
    const rightMeshPlantaris = new THREE.Mesh(rightGeomPlantaris);
    rightMeshPlantaris.name = 'atlas_plantaris_muscle_r_5a2fd02c';

    deformBridgingMesh(leftMeshPlantaris, {
      forearmRotationX: 0,
      armRotationZ: 0,
      shinRotationX: 0,
      thighRotationX: 0,
      spineRotationX: 0,
    });
    deformBridgingMesh(rightMeshPlantaris, {
      forearmRotationX: 0,
      armRotationZ: 0,
      shinRotationX: 1.2,
      thighRotationX: 0,
      spineRotationX: 0,
    });

    const leftPosPlantaris = leftGeomPlantaris.attributes.position.array as Float32Array;
    const rightPosPlantaris = rightGeomPlantaris.attributes.position.array as Float32Array;

    // Left distal plantaris remains at rest
    expect(leftPosPlantaris[5]).toBeCloseTo(-0.06, 5);
    // Right distal plantaris swung posteriorly with the flexed knee
    expect(rightPosPlantaris[5]).toBeLessThan(-0.06);
  });
});
