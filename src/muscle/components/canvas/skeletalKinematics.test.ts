import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  ANIMATION_CYCLE_DURATION,
  computeKinematicRotations,
  computeProceduralJointAngles,
  deformBridgingBicepsBrachiiMesh,
  deformBridgingBrachialisMesh,
  deformBridgingBrachioradialisMesh,
  deformBridgingDeltoidMesh,
  deformBridgingExtensorCarpiRadialisMesh,
  deformBridgingFasciaLataMesh,
  deformBridgingGastrocnemiusMesh,
  deformBridgingGracilisMesh,
  deformBridgingHamstringsMesh,
  deformBridgingMesh,
  deformBridgingPectoralisMajorMesh,
  deformBridgingPlantarisMesh,
  deformBridgingPsoasMesh,
  deformBridgingQuadricepsMesh,
  deformBridgingSartoriusMesh,
  deformBridgingTransversusAbdominisMesh,
  getKinematicSegmentForNodeId,
  isBicepsBrachiiMesh,
  isBrachialisMesh,
  isBrachioradialisMesh,
  isDeltoidMesh,
  isExtensorCarpiRadialisMesh,
  isFasciaLataMesh,
  isGastrocnemiusMesh,
  isGracilisMesh,
  isHamstringsMesh,
  isPectoralisMajorMesh,
  isQuadricepsMesh,
  isSartoriusMesh,
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
    expect(
      getKinematicSegmentForNodeId(
        'atlas_gracilis_muscle_pubic_insertion_r_3568d7dc',
        undefined,
        'Gracilis muscle-Pubic insertion.r',
      ),
    ).toBe('pelvis');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_long_head_of_biceps_femoris_muscle_i_69d2859a',
        undefined,
        'Long head of biceps femoris muscle-Ischiatic insertion.r',
      ),
    ).toBe('pelvis');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_sartorius_muscle_on_upper_anterior_i_a4219826',
        undefined,
        'Origin of sartorius muscle on Upper anterior iliac spine.r',
      ),
    ).toBe('pelvis');

    // Bridging dual-anchored muscles (Psoas, Plantaris, Transversus abdominis, Fascia lata, Brachioradialis, Biceps, Quads, Sartorius, Hamstrings, Gracilis)
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
    expect(getKinematicSegmentForNodeId('muscle_biceps_brachii')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_brachioradialis')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_brachialis')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_extensor_carpi_radialis')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_gastrocnemius')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_deltoid_anterior')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_deltoid_lateral')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_deltoid_posterior')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_pectoralis_major')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_quadriceps_rectus_femoris')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_vastus_lateralis')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_sartorius')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_hamstrings_biceps_femoris')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_semitendinosus')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_semimembranosus')).toBe('bridging');
    expect(getKinematicSegmentForNodeId('muscle_gracilis')).toBe('bridging');

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
    expect(
      getKinematicSegmentForNodeId(
        'atlas_acromial_head_of_deltoid_muscle_scap_18d4e450',
        undefined,
        'Acromial head of deltoid muscle-Scapular insertion.r',
      ),
    ).toBe('spine');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_clavicular_part_of_deltoid_muscle_cl_5b15cb2b',
        undefined,
        'Clavicular part of deltoid muscle-Clavicular insertion.r',
      ),
    ).toBe('spine');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_scapular_head_of_deltoid_muscle_scap_708240d7',
        undefined,
        'Scapular head of deltoid muscle-Scapular insertion.r',
      ),
    ).toBe('spine');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_pectoralis_major_muscle_clavicular_i_25190cac',
        undefined,
        'Pectoralis major muscle-Clavicular insertion.r',
      ),
    ).toBe('spine');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_pectoralis_minor_muscle_r_f973f846',
        undefined,
        'Pectoralis minor muscle.r',
      ),
    ).toBe('spine');

    // Upper arm
    expect(getKinematicSegmentForNodeId('bone_humerus')).toBe('arm');
    expect(getKinematicSegmentForNodeId('joint_shoulder')).toBe('arm');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_deltoid_muscle_humeral_insertion_r_ed353102',
        undefined,
        'Deltoid muscle-Humeral insertion.r',
      ),
    ).toBe('arm');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_pectoralis_major_muscle_humeral_inse_782e067b',
        undefined,
        'Pectoralis major muscle-Humeral insertion.r',
      ),
    ).toBe('arm');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_bracioradialis_muscle_humeral_insert_03bc4dad',
        undefined,
        'Bracioradialis muscle-Humeral insertion.r',
      ),
    ).toBe('arm');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_anconeus_muscle_humeral_insertion_r_241c9c19',
        undefined,
        'Anconeus muscle-Humeral insertion.r',
      ),
    ).toBe('arm');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_deltoid_muscle_humeral_insertion_r_ed353102',
        undefined,
        'Deltoid muscle-Humeral insertion.r',
      ),
    ).toBe('arm');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_brachialis_anterior_muscle_humeral_i_5bacb069',
        undefined,
        'Brachialis anterior muscle-Humeral insertions.r',
      ),
    ).toBe('arm');

    // Forearm
    expect(getKinematicSegmentForNodeId('bone_radius')).toBe('forearm');
    expect(getKinematicSegmentForNodeId('bone_ulna')).toBe('forearm');
    expect(getKinematicSegmentForNodeId('joint_elbow')).toBe('forearm');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_brachialis_muscle_ulnar_insertion_r_ee7c1b98',
        undefined,
        'Brachialis muscle-Ulnar insertion.r',
      ),
    ).toBe('forearm');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_biceps_brachii_muscle_radial_inserti_5a9942a5',
        undefined,
        'Biceps brachii muscle-Radial insertion.r',
      ),
    ).toBe('forearm');
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
    expect(
      getKinematicSegmentForNodeId(
        'atlas_origin_of_vastus_lateralis_r_bd09e1e7',
        undefined,
        'Origin of vastus lateralis.r',
      ),
    ).toBe('thigh');
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
      getKinematicSegmentForNodeId('atlas_plantaris_muscle_medially_to_the_lat_3ef61b75'),
    ).toBe('thigh');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_plantaris_muscle_medially_to_the_lat_143de19a',
        undefined,
        'Plantaris muscle medially to the lateral gastrocnemius orig',
      ),
    ).toBe('thigh');
    expect(
      getKinematicSegmentForNodeId('atlas_plantaris_muscle_medially_to_the_lat_143de19a'),
    ).toBe('thigh');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_origin_of_articularis_genus_r_85ebc333',
        undefined,
        'Origin of articularis genus.r',
      ),
    ).toBe('thigh');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_lateral_head_of_gastrocnemius_on_lat_d7a53202',
        undefined,
        'Lateral head of gastrocnemius on lateral condyle of femur.r',
      ),
    ).toBe('thigh');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_medial_head_of_gastrocnemius_on_med__9d2eb188',
        undefined,
        'Medial head of gastrocnemius on medial condyle of femur.r',
      ),
    ).toBe('thigh');

    // Shin
    expect(getKinematicSegmentForNodeId('bone_tibia')).toBe('shin');
    expect(getKinematicSegmentForNodeId('bone_fibula')).toBe('shin');
    expect(getKinematicSegmentForNodeId('bone_patella')).toBe('shin');
    expect(getKinematicSegmentForNodeId('joint_knee')).toBe('shin');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_quadriceps_femoris_on_base_of_patell_0a32a9b6',
        undefined,
        'Quadriceps femoris on base of patella.r',
      ),
    ).toBe('shin');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_sartorius_on_patte_d_oie_r_114b15fb',
        undefined,
        'Sartorius on patte d oie.r',
      ),
    ).toBe('shin');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_gracilis_on_patte_d_oie_r_c1543752',
        undefined,
        'Gracilis on patte d oie.r',
      ),
    ).toBe('shin');
    expect(
      getKinematicSegmentForNodeId(
        'atlas_long_head_of_biceps_femoris_on_fibul_ed8ca122',
        undefined,
        'Long head of biceps femoris on fibula.r',
      ),
    ).toBe('shin');
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

    // Shoulder flexion (forward) swings arm into +Z, requiring negative X rotation
    const shoulderFlexForward = computeKinematicRotations({ shoulderFlexion: 0.5 });
    expect(shoulderFlexForward.armRotationX).toBeCloseTo(-0.5, 4);

    // Shoulder extension (backward) swings arm into -Z, requiring positive X rotation
    const shoulderExtBack = computeKinematicRotations({ shoulderFlexion: -0.5 });
    expect(shoulderExtBack.armRotationX).toBeCloseTo(0.5, 4);

    // Hip abduction pivots thigh outward laterally away from midline
    const hipAbduct = computeKinematicRotations({ hipAbduction: 0.4 });
    expect(hipAbduct.thighRotationZ).toBeCloseTo(0.4, 4);
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

    // Apply outward hip abduction (thetaThighZ = 0.5 rad, ~28.6 degrees lateral swing) with neutral flexion
    deformBridgingPlantarisMesh(mesh, 0.0, 0.0, 0.5);

    // Both femur origin and calf tendon must pivot laterally outward (+X) around hip pivot
    expect(pos[0]).toBeGreaterThan(rawCoords[0]); // upper femur origin follows thigh outward
    expect(pos[3]).toBeGreaterThan(rawCoords[3]); // lower calf tendon follows shin outward
    expect(pos[6]).toBeGreaterThan(rawCoords[6]); // middle belly follows outward

    // Clean up
    restoreOriginalMeshPositions(mesh);
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);

    // Compound motion: hip moved outward (thetaThighZ = 0.4) AND moved forward/back (thetaThigh = -0.5)
    // with knee flexion (thetaShin = 0.8)
    deformBridgingPlantarisMesh(mesh, -0.5, 0.8, 0.4);

    // Verify against exact Three.js scene graph hierarchy
    const testThighPivot = new THREE.Group();
    testThighPivot.position.copy(KINEMATIC_PIVOTS.hip);
    const testContentThigh = new THREE.Group();
    testContentThigh.position.copy(KINEMATIC_PIVOTS.hip).negate();
    testThighPivot.add(testContentThigh);

    const femurMarker = new THREE.Object3D();
    femurMarker.position.set(rawCoords[0], rawCoords[1], rawCoords[2]);
    testContentThigh.add(femurMarker);

    const testShinPivot = new THREE.Group();
    testShinPivot.position.copy(KINEMATIC_PIVOTS.knee);
    testContentThigh.add(testShinPivot);
    const testContentShin = new THREE.Group();
    testContentShin.position.copy(KINEMATIC_PIVOTS.knee).negate();
    testShinPivot.add(testContentShin);

    const shinMarker = new THREE.Object3D();
    shinMarker.position.set(rawCoords[3], rawCoords[4], rawCoords[5]);
    testContentShin.add(shinMarker);

    testThighPivot.rotation.x = -0.5;
    testThighPivot.rotation.z = 0.4;
    testShinPivot.rotation.x = 0.8;
    testThighPivot.updateMatrixWorld(true);

    const expectedFemur = new THREE.Vector3();
    femurMarker.getWorldPosition(expectedFemur);
    const expectedShin = new THREE.Vector3();
    shinMarker.getWorldPosition(expectedShin);

    expect(pos[0]).toBeCloseTo(expectedFemur.x, 4);
    expect(pos[1]).toBeCloseTo(expectedFemur.y, 4);
    expect(pos[2]).toBeCloseTo(expectedFemur.z, 4);

    expect(pos[3]).toBeCloseTo(expectedShin.x, 4);
    expect(pos[4]).toBeCloseTo(expectedShin.y, 4);
    expect(pos[5]).toBeCloseTo(expectedShin.z, 4);

    // Clean up
    restoreOriginalMeshPositions(mesh);
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
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

    // D. Hip outward abduction (thetaHipZ):
    // Thigh rotates outward laterally (+Z Euler rotation in Three.js coordinates)
    const hipAbductionAngle = (30 * Math.PI) / 180;
    deformBridgingFasciaLataMesh(mesh, 0, 0, hipAbductionAngle);
    pos = geom.attributes.position.array as Float32Array;

    // Proximal iliac vertex (idx 6..8) remains anchored to pelvis
    expect(pos[6]).toBeCloseTo(0.142, 5);
    expect(pos[7]).toBeCloseTo(0.98, 5);
    // Mid-thigh vertex (idx 3..5) moves laterally outward (+X)
    expect(pos[3]).toBeGreaterThan(0.14);
    // Distal vertex (idx 0..2) also moves laterally outward (+X)
    expect(pos[0]).toBeGreaterThan(0.118);

    // E. Restore original positions:
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

    // Plantaris: Left leg pivots hip outward (thighRotationZ = 0.4 rad), Right leg neutral
    restoreOriginalMeshPositions(leftMeshPlantaris);
    restoreOriginalMeshPositions(rightMeshPlantaris);
    deformBridgingMesh(leftMeshPlantaris, {
      forearmRotationX: 0,
      armRotationZ: 0,
      shinRotationX: 0,
      thighRotationX: 0,
      thighRotationZ: 0.4,
      spineRotationX: 0,
    });
    deformBridgingMesh(rightMeshPlantaris, {
      forearmRotationX: 0,
      armRotationZ: 0,
      shinRotationX: 0,
      thighRotationX: 0,
      thighRotationZ: 0,
      spineRotationX: 0,
    });
    // Left Plantaris moved outward laterally (+X)
    expect(leftPosPlantaris[0]).toBeGreaterThan(rawCoordsPlantaris[0]);
    // Right Plantaris remains at rest
    expect(rightPosPlantaris[0]).toBeCloseTo(rawCoordsPlantaris[0], 5);
  });

  it('deforms bridging brachioradialis mesh across elbow flexion with lateral/anterior belly bulge and fixed humeral/radial attachments', () => {
    // 3 representative vertices:
    // 0: distal radial insertion (Y = 0.90, below elbow 1.107)
    // 1: mid-belly (Y = 1.05, spanning across elbow)
    // 2: proximal humeral origin (Y = 1.18, above elbow 1.107)
    const rawCoords = [
      0.24, 0.90, 0.00,
      0.25, 1.05, 0.01,
      0.23, 1.18, -0.02,
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geom);
    mesh.name = 'muscle_brachioradialis';

    expect(isBrachioradialisMesh(mesh)).toBe(true);

    // Elbow flexion (forearmRotationX = -1.2 rad, swings forward +Z and upward +Y)
    deformBridgingBrachioradialisMesh(mesh, -1.2);
    let pos = geom.attributes.position.array as Float32Array;

    // Distal vertex on radius swings forward (+Z) and upward (+Y) with forearm
    expect(pos[2]).toBeGreaterThan(rawCoords[2] + 0.05);
    expect(pos[1]).toBeGreaterThan(rawCoords[1]);

    // Proximal humeral origin stays completely fixed to humerus (arm at rest)
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);

    // Mid-belly experiences anterolateral bulge (+Z and +X)
    expect(pos[5]).toBeGreaterThan(rawCoords[5]);
    expect(pos[3]).toBeGreaterThan(rawCoords[3]);

    // Restores cleanly
    restoreOriginalMeshPositions(mesh);
    pos = geom.attributes.position.array as Float32Array;
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);
  });

  it('deforms bridging biceps brachii mesh across elbow flexion with strong anterior belly bulge and fixed radial/shoulder attachments', () => {
    // 3 representative vertices:
    // 0: distal radial tuberosity insertion (Y = 1.06, below elbow 1.107)
    // 1: mid-belly (Y = 1.22, between elbow and shoulder)
    // 2: proximal shoulder/scapula origin (Y = 1.38, near shoulder pivot 1.378)
    const rawCoords = [
      0.20, 1.06, -0.02,
      0.19, 1.22, 0.01,
      0.17, 1.38, -0.01,
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geom);
    mesh.name = 'muscle_biceps_brachii';

    expect(isBicepsBrachiiMesh(mesh)).toBe(true);

    // Elbow flexion (forearmRotationX = -1.2 rad)
    deformBridgingBicepsBrachiiMesh(mesh, -1.2);
    let pos = geom.attributes.position.array as Float32Array;

    // Distal vertex on radius swings forward with forearm
    expect(pos[2]).toBeGreaterThan(rawCoords[2] + 0.025);

    // Proximal shoulder origin stays fixed to arm at rest
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);

    // Mid-belly shortens axially (Y increases toward shoulder)
    expect(pos[4]).toBeGreaterThan(rawCoords[4]);

    // Mid-belly squashes and bulges anteriorly (+Z) without excessive bowing away from bone
    expect(pos[5]).toBeGreaterThan(rawCoords[5] + 0.02);
    expect(pos[5]).toBeLessThan(rawCoords[5] + 0.05);

    restoreOriginalMeshPositions(mesh);
  });

  it('deforms bridging quadriceps femoris meshes across knee flexion and hip flexion, with patellar end following the shin', () => {
    // Rectus femoris: spanning from pelvis (AIIS at Y = 0.90) to base of patella (Y = 0.40)
    const rawCoordsRF = [
      0.11, 0.40, 0.01, // Patellar insertion
      0.12, 0.65, 0.03, // Mid-thigh belly
      0.10, 0.90, 0.01, // Pelvic origin (AIIS)
    ];
    const geomRF = new THREE.BufferGeometry();
    geomRF.setAttribute('position', new THREE.Float32BufferAttribute(rawCoordsRF, 3));
    const meshRF = new THREE.Mesh(geomRF);
    meshRF.name = 'muscle_quadriceps_rectus_femoris';

    expect(isQuadricepsMesh(meshRF)).toBe(true);

    // Knee flexion: shin rotates backward (+X in Three.js)
    deformBridgingQuadricepsMesh(meshRF, 0, 1.2, 0);
    let pos = geomRF.attributes.position.array as Float32Array;

    // Patellar insertion swings backward (-Z) with the shin
    expect(pos[2]).toBeLessThan(rawCoordsRF[2] - 0.04);
    expect(Number.isFinite(pos[1])).toBe(true);

    // Pelvic origin remains strictly fixed to pelvis
    expect(pos[6]).toBeCloseTo(rawCoordsRF[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoordsRF[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoordsRF[8], 5);

    // Vastus lateralis: originates on femur (Y = 0.70)
    const rawCoordsVL = [
      0.13, 0.40, 0.01, // Patellar insertion
      0.14, 0.70, 0.02, // Femoral origin
    ];
    const geomVL = new THREE.BufferGeometry();
    geomVL.setAttribute('position', new THREE.Float32BufferAttribute(rawCoordsVL, 3));
    const meshVL = new THREE.Mesh(geomVL);
    meshVL.name = 'muscle_vastus_lateralis';

    expect(isQuadricepsMesh(meshVL)).toBe(true);

    // Hip flexion: thigh swings forward (-X in Three.js)
    deformBridgingQuadricepsMesh(meshVL, -0.6, 0, 0);
    pos = geomVL.attributes.position.array as Float32Array;

    // Femoral origin swings forward (+Z) with thigh
    expect(pos[5]).toBeGreaterThan(rawCoordsVL[5]);
    // Patellar insertion also moves forward with thigh when knee is extended
    expect(pos[2]).toBeGreaterThan(rawCoordsVL[2]);
  });

  it('deforms bridging sartorius mesh across hip and knee motions, keeping ASIS and pes anserinus constrained', () => {
    // 3 representative vertices:
    // 0: pes anserinus on medial tibia (Y = 0.38, below knee 0.435)
    // 1: mid-thigh diagonal strap (Y = 0.65)
    // 2: ASIS origin on pelvis (Y = 0.92, above hip 0.885)
    const rawCoords = [
      0.06, 0.38, -0.01,
      0.08, 0.65, 0.02,
      0.12, 0.92, 0.04,
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geom);
    mesh.name = 'muscle_sartorius';

    expect(isSartoriusMesh(mesh)).toBe(true);

    // Knee flexion + Hip abduction
    deformBridgingSartoriusMesh(mesh, 0, 1.2, 0.3);
    const pos = geom.attributes.position.array as Float32Array;

    // Pes anserinus on tibia swings backward (-Z) and laterally with shin
    expect(pos[2]).toBeLessThan(rawCoords[2]);

    // ASIS on pelvis remains anchored
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);

    // Mid-thigh strap moves with thigh abduction (+X)
    expect(pos[3]).toBeGreaterThan(rawCoords[3]);
  });

  it('deforms bridging hamstrings mesh across knee flexion with posterior belly squash/bulge and ischial/shin constraints', () => {
    // 3 representative vertices:
    // 0: distal insertion at fibula / tibia (Y = 0.39, below knee 0.435)
    // 1: mid-belly (Y = 0.62)
    // 2: ischial tuberosity origin on pelvis (Y = 0.81, near hip)
    const rawCoords = [
      0.09, 0.39, -0.05,
      0.09, 0.62, -0.06,
      0.07, 0.81, -0.05,
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geom);
    mesh.name = 'muscle_hamstrings_biceps_femoris';

    expect(isHamstringsMesh(mesh)).toBe(true);

    // Knee flexion (shinRotationX = 1.2 rad)
    deformBridgingHamstringsMesh(mesh, 0, 1.2, 0);
    const pos = geom.attributes.position.array as Float32Array;

    // Distal insertion swings backward (-Z) and upward (+Y)
    expect(pos[2]).toBeLessThan(rawCoords[2]);
    expect(pos[1]).toBeGreaterThan(rawCoords[1]);

    // Ischial tuberosity remains anchored to pelvis
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);

    // Mid-belly squashes and bulges posteriorly (-Z)
    expect(pos[5]).toBeLessThan(rawCoords[5] - 0.015);
  });

  it('deforms bridging gracilis mesh across hip abduction and knee flexion with pubic and tibial constraints', () => {
    // 3 representative vertices:
    // 0: pes anserinus on medial tibia (Y = 0.38, below knee 0.435)
    // 1: mid-thigh medial body (Y = 0.60)
    // 2: pubic origin on pelvis (Y = 0.82)
    const rawCoords = [
      0.04, 0.38, -0.02,
      0.03, 0.60, 0.00,
      0.02, 0.82, 0.01,
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geom);
    mesh.name = 'muscle_gracilis';

    expect(isGracilisMesh(mesh)).toBe(true);

    // Hip abduction (thighRotationZ = 0.4 rad)
    deformBridgingGracilisMesh(mesh, 0, 0, 0.4);
    const pos = geom.attributes.position.array as Float32Array;

    // Pubic origin on pelvis remains anchored
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);

    // Mid-thigh and distal ends move outward laterally (+X)
    expect(pos[3]).toBeGreaterThan(rawCoords[3]);
    expect(pos[0]).toBeGreaterThan(rawCoords[0]);
  });

  it('deforms bridging brachialis mesh across elbow flexion with anterior squashing and fixed humeral/ulnar attachments', () => {
    // 3 representative vertices:
    // 0: distal ulnar insertion on coronoid process (Y = 1.06, below elbow 1.107)
    // 1: mid-belly (Y = 1.15, anterior elbow joint line)
    // 2: proximal humeral origin (Y = 1.25, above elbow 1.107)
    const rawCoords = [
      0.18, 1.06, -0.01,
      0.18, 1.15, 0.01,
      0.17, 1.25, -0.01,
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geom);
    mesh.name = 'muscle_brachialis';

    expect(isBrachialisMesh(mesh)).toBe(true);

    // Elbow flexion (forearmRotationX = -1.2 rad)
    deformBridgingBrachialisMesh(mesh, -1.2);
    let pos = geom.attributes.position.array as Float32Array;

    // Distal vertex on ulna swings forward (+Z) and upward (+Y) with forearm
    expect(pos[2]).toBeGreaterThan(rawCoords[2] + 0.02);
    expect(pos[1]).toBeGreaterThan(rawCoords[1]);

    // Proximal humeral origin stays fixed to humerus (arm at rest)
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);

    // Mid-belly shortens axially upward and squashes close to anterior humerus/capsule
    expect(pos[4]).toBeGreaterThan(rawCoords[4]);
    expect(pos[5]).toBeGreaterThan(rawCoords[5]);

    restoreOriginalMeshPositions(mesh);
    pos = geom.attributes.position.array as Float32Array;
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);
  });

  it('deforms bridging extensor carpi radialis longus mesh across elbow flexion with anterolateral bulge and fixed supracondylar origin', () => {
    // 3 representative vertices:
    // 0: distal forearm tendon (Y = 0.90, below elbow 1.107)
    // 1: mid-belly spanning lateral elbow (Y = 1.05)
    // 2: proximal lateral supracondylar origin on humerus (Y = 1.15, above elbow 1.107)
    const rawCoords = [
      0.24, 0.90, -0.01,
      0.24, 1.05, 0.00,
      0.22, 1.15, -0.02,
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geom);
    mesh.name = 'muscle_extensor_carpi_radialis';

    expect(isExtensorCarpiRadialisMesh(mesh)).toBe(true);

    // Elbow flexion (forearmRotationX = -1.2 rad)
    deformBridgingExtensorCarpiRadialisMesh(mesh, -1.2);
    let pos = geom.attributes.position.array as Float32Array;

    // Distal tendon swings with forearm (+Z and +Y)
    expect(pos[2]).toBeGreaterThan(rawCoords[2] + 0.05);
    expect(pos[1]).toBeGreaterThan(rawCoords[1]);

    // Proximal humeral origin stays fixed to humerus
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);

    // Mid-belly experiences anterolateral bulge (+Z and +X)
    expect(pos[5]).toBeGreaterThan(rawCoords[5]);
    expect(pos[3]).toBeGreaterThan(rawCoords[3]);

    restoreOriginalMeshPositions(mesh);
    pos = geom.attributes.position.array as Float32Array;
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);
  });

  it('deforms bridging gastrocnemius mesh across knee flexion with posterior calf belly bulge and fixed femoral/calcaneal attachments', () => {
    // 3 representative vertices:
    // 0: distal calcaneal tendon (Y = 0.30, below knee 0.435)
    // 1: mid calf belly (Y = 0.38)
    // 2: proximal femoral condyle origin (Y = 0.49, above knee 0.435)
    const rawCoords = [
      0.04, 0.30, -0.05,
      0.05, 0.38, -0.06,
      0.04, 0.49, -0.04,
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geom);
    mesh.name = 'muscle_gastrocnemius';

    expect(isGastrocnemiusMesh(mesh)).toBe(true);

    // Knee flexion (shinRotationX = 1.2 rad)
    deformBridgingGastrocnemiusMesh(mesh, 0, 1.2, 0);
    let pos = geom.attributes.position.array as Float32Array;

    // Distal calcaneal tendon swings backward (-Z) and upward (+Y) with shin
    expect(pos[2]).toBeLessThan(rawCoords[2] - 0.05);
    expect(pos[1]).toBeGreaterThan(rawCoords[1]);

    // Proximal femoral condyle origin stays fixed on thigh/femur (thigh at rest)
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);

    // Mid calf belly squashes and bulges posteriorly (-Z)
    expect(pos[5]).toBeLessThan(rawCoords[5] - 0.012);

    restoreOriginalMeshPositions(mesh);
    pos = geom.attributes.position.array as Float32Array;
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);
  });

  it('deforms bridging deltoid mesh across 2-axis shoulder movements (abduction, flexion, and combined)', () => {
    // 3 representative vertices:
    // 0: distal humeral insertion at deltoid tuberosity (Y = 1.28, below 1.285 threshold)
    // 1: mid-belly (Y = 1.35, between shoulder pivot 1.378 and insertion)
    // 2: proximal clavicular/acromial origin (Y = 1.415, above 1.410 threshold)
    const rawCoords = [
      0.20, 1.28, -0.03, // Deltoid tuberosity on humerus
      0.21, 1.35, -0.01, // Lateral deltoid belly
      0.16, 1.415, -0.03, // Clavicular/acromial origin on torso
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geom);
    mesh.name = 'muscle_deltoid_lateral';

    expect(isDeltoidMesh(mesh)).toBe(true);

    // A. Shoulder Abduction (thetaArmZ = 0.8 rad ~45° outward)
    deformBridgingDeltoidMesh(mesh, 0.8, 0, 0);
    let pos = geom.attributes.position.array as Float32Array;

    // Distal insertion on humerus swings outward laterally (+X) and upward (+Y)
    expect(pos[0]).toBeGreaterThan(rawCoords[0] + 0.04);
    expect(pos[1]).toBeGreaterThan(rawCoords[1]);

    // Proximal origin remains strictly fixed to clavicle/acromion
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);

    // Mid-belly experiences outward lateral bulge (+X) and flexes upward (+Y)
    expect(pos[3]).toBeGreaterThan(rawCoords[3] + 0.01);
    expect(pos[4]).toBeGreaterThan(rawCoords[4] + 0.02);

    // B. Shoulder Flexion (thetaArmX = -0.8 rad forward swing)
    restoreOriginalMeshPositions(mesh);
    deformBridgingDeltoidMesh(mesh, 0, -0.8, 0);
    pos = geom.attributes.position.array as Float32Array;

    // Distal insertion swings forward (+Z) and upward (+Y)
    expect(pos[2]).toBeGreaterThan(rawCoords[2] + 0.05);

    // Proximal origin remains strictly fixed to clavicle/acromion
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);

    // Mid-belly moves forward (+Z)
    expect(pos[5]).toBeGreaterThan(rawCoords[5] + 0.01);

    // C. Combined 2-axis rotation (Abduction 0.6 rad + Forward Flexion -0.6 rad)
    restoreOriginalMeshPositions(mesh);
    deformBridgingDeltoidMesh(mesh, 0.6, -0.6, 0);
    pos = geom.attributes.position.array as Float32Array;

    // Distal insertion compounds in both lateral (+X) and forward (+Z)
    expect(pos[0]).toBeGreaterThan(rawCoords[0] + 0.02);
    expect(pos[2]).toBeGreaterThan(rawCoords[2] + 0.02);

    // Proximal origin stays anchored
    expect(pos[6]).toBeCloseTo(rawCoords[6], 5);
    expect(pos[7]).toBeCloseTo(rawCoords[7], 5);
    expect(pos[8]).toBeCloseTo(rawCoords[8], 5);

    // D. Restore
    restoreOriginalMeshPositions(mesh);
    pos = geom.attributes.position.array as Float32Array;
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);
  });

  it('deforms bridging pectoralis major mesh across 2-axis shoulder movements with sternal anchor and axillary fold stretch', () => {
    // 4 representative vertices:
    // 0: medial sternal origin (X = 0.04, Y = 1.30, Z = 0.06)
    // 1: mid-belly / axillary fold (X = 0.14, Y = 1.32, Z = 0.04)
    // 2: lateral humeral insertion at greater tubercle (X = 0.19, Y = 1.33, Z = -0.01)
    // 3: lower costal edge (X = 0.08, Y = 1.20, Z = 0.08, below Y <= 1.240 threshold)
    const rawCoords = [
      0.04, 1.30, 0.06, // Sternum origin
      0.14, 1.32, 0.04, // Chest belly / axillary fold
      0.19, 1.33, -0.01, // Humeral tendon insertion
      0.08, 1.20, 0.08, // Lower edge on ribs
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(rawCoords, 3));
    const mesh = new THREE.Mesh(geom);
    mesh.name = 'muscle_pectoralis_major';

    expect(isPectoralisMajorMesh(mesh)).toBe(true);

    // A. Shoulder Abduction (thetaArmZ = 0.8 rad)
    deformBridgingPectoralisMajorMesh(mesh, 0.8, 0, 0);
    let pos = geom.attributes.position.array as Float32Array;

    // Medial sternal origin stays strictly fixed to chest
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);

    // Lower edge constraint: stays strictly fixed to chest wall / ribs
    expect(pos[9]).toBeCloseTo(rawCoords[9], 5);
    expect(pos[10]).toBeCloseTo(rawCoords[10], 5);
    expect(pos[11]).toBeCloseTo(rawCoords[11], 5);

    // Lateral humeral insertion translates outward laterally (+X) and upward (+Y)
    expect(pos[6]).toBeGreaterThan(rawCoords[6] + 0.02);
    expect(pos[7]).toBeGreaterThan(rawCoords[7]);

    // Mid-belly mildly stretches outward
    expect(pos[3]).toBeGreaterThan(rawCoords[3]);

    // B. Forward Flexion / Horizontal Adduction (thetaArmX = -0.8 rad)
    restoreOriginalMeshPositions(mesh);
    deformBridgingPectoralisMajorMesh(mesh, 0, -0.8, 0);
    pos = geom.attributes.position.array as Float32Array;

    // Medial sternal origin stays strictly fixed to chest
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);

    // Lower edge remains strictly pinned to chest wall
    expect(pos[9]).toBeCloseTo(rawCoords[9], 5);
    expect(pos[10]).toBeCloseTo(rawCoords[10], 5);
    expect(pos[11]).toBeCloseTo(rawCoords[11], 5);

    // Lateral humeral insertion translates forward into +Z
    expect(pos[8]).toBeGreaterThan(rawCoords[8] + 0.02);

    // Mid-belly contracts mildly and bulges anteriorly (+Z)
    expect(pos[5]).toBeGreaterThan(rawCoords[5] + 0.005);

    // C. Combined 2-axis rotation (Abduction 0.6 rad + Forward Flexion -0.6 rad)
    restoreOriginalMeshPositions(mesh);
    deformBridgingPectoralisMajorMesh(mesh, 0.6, -0.6, 0);
    pos = geom.attributes.position.array as Float32Array;

    // Sternal origin strictly anchored
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);

    // Lower edge strictly anchored
    expect(pos[9]).toBeCloseTo(rawCoords[9], 5);
    expect(pos[10]).toBeCloseTo(rawCoords[10], 5);
    expect(pos[11]).toBeCloseTo(rawCoords[11], 5);

    // Lateral tendon compounds in both X and Z
    expect(pos[6]).toBeGreaterThan(rawCoords[6]);
    expect(pos[8]).toBeGreaterThan(rawCoords[8]);

    // D. Restore
    restoreOriginalMeshPositions(mesh);
    pos = geom.attributes.position.array as Float32Array;
    expect(pos[0]).toBeCloseTo(rawCoords[0], 5);
    expect(pos[1]).toBeCloseTo(rawCoords[1], 5);
    expect(pos[2]).toBeCloseTo(rawCoords[2], 5);
    expect(pos[9]).toBeCloseTo(rawCoords[9], 5);
    expect(pos[10]).toBeCloseTo(rawCoords[10], 5);
    expect(pos[11]).toBeCloseTo(rawCoords[11], 5);
  });

  it('deformBridgingMesh correctly dispatches all bridging muscle groups', () => {
    const muscles = [
      { name: 'atlas_psoas_muscle_r_08af9941', coords: [0.06, 0.90, -0.02] },
      { name: 'atlas_plantaris_muscle_r_5a2fd02c', coords: [0.04, 0.45, -0.05] },
      { name: 'atlas_transversus_abdominis_muscle_r_c20d1664', coords: [0.08, 1.05, 0.05] },
      { name: 'atlas_fascia_lata_r_d92bb3d0', coords: [0.14, 0.65, -0.01] },
      { name: 'muscle_brachioradialis', coords: [0.24, 1.05, 0.01] },
      { name: 'muscle_biceps_brachii', coords: [0.19, 1.22, 0.01] },
      { name: 'muscle_brachialis', coords: [0.18, 1.15, 0.01] },
      { name: 'muscle_extensor_carpi_radialis', coords: [0.24, 1.05, 0.01] },
      { name: 'muscle_gastrocnemius', coords: [0.04, 0.38, -0.06] },
      { name: 'muscle_deltoid_lateral', coords: [0.21, 1.35, -0.01] },
      { name: 'muscle_pectoralis_major', coords: [0.12, 1.32, 0.04] },
      { name: 'muscle_quadriceps_rectus_femoris', coords: [0.11, 0.65, 0.03] },
      { name: 'muscle_sartorius', coords: [0.08, 0.65, 0.02] },
      { name: 'muscle_hamstrings_biceps_femoris', coords: [0.09, 0.62, -0.06] },
      { name: 'muscle_gracilis', coords: [0.03, 0.60, 0.00] },
    ];

    const rotations = {
      forearmRotationX: -0.8,
      armRotationX: 0,
      armRotationZ: 0.2,
      shinRotationX: 0.9,
      thighRotationX: -0.4,
      thighRotationZ: 0.2,
      spineRotationX: 0.1,
    };

    for (const item of muscles) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(item.coords, 3));
      const mesh = new THREE.Mesh(geom);
      mesh.name = item.name;

      deformBridgingMesh(mesh, rotations);
      const pos = geom.attributes.position.array as Float32Array;

      // Every bridging mesh position must update and remain numerically valid
      expect(Number.isFinite(pos[0])).toBe(true);
      expect(Number.isFinite(pos[1])).toBe(true);
      expect(Number.isFinite(pos[2])).toBe(true);

      restoreOriginalMeshPositions(mesh);
      expect(pos[0]).toBeCloseTo(item.coords[0], 5);
      expect(pos[1]).toBeCloseTo(item.coords[1], 5);
      expect(pos[2]).toBeCloseTo(item.coords[2], 5);
    }
  });
});
