import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  ANIMATION_CYCLE_DURATION,
  computeKinematicRotations,
  computeProceduralJointAngles,
  deformBridgingPsoasMesh,
  getKinematicSegmentForNodeId,
  KINEMATIC_PIVOTS,
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

    // Bridging dual-anchored muscles (Psoas)
    expect(
      getKinematicSegmentForNodeId(
        'atlas_psoas_muscle_r_08af9941',
        undefined,
        'Psoas muscle.r',
      ),
    ).toBe('bridging');

    // Spine & upper trunk
    expect(getKinematicSegmentForNodeId('bone_spine')).toBe('spine');
    expect(getKinematicSegmentForNodeId('bone_ribcage')).toBe('spine');
    expect(getKinematicSegmentForNodeId('bone_sternum')).toBe('spine');
    expect(getKinematicSegmentForNodeId('bone_skull')).toBe('spine');

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

    // Hand
    expect(getKinematicSegmentForNodeId('bone_carpals')).toBe('hand');
    expect(getKinematicSegmentForNodeId('bone_metacarpals')).toBe('hand');
    expect(getKinematicSegmentForNodeId('joint_wrist')).toBe('hand');
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
});
