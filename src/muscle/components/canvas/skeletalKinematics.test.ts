import { describe, expect, it } from 'vitest';
import {
  ANIMATION_CYCLE_DURATION,
  computeProceduralJointAngles,
  getKinematicSegmentForNodeId,
  KINEMATIC_PIVOTS,
} from './skeletalKinematics';

describe('skeletalKinematics', () => {
  it('maps curriculum bones and joints to correct kinematic segments', () => {
    // Pelvis
    expect(getKinematicSegmentForNodeId('bone_pelvis')).toBe('pelvis');

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

    // Hand
    expect(getKinematicSegmentForNodeId('bone_carpals')).toBe('hand');
    expect(getKinematicSegmentForNodeId('bone_metacarpals')).toBe('hand');
    expect(getKinematicSegmentForNodeId('joint_wrist')).toBe('hand');

    // Thigh
    expect(getKinematicSegmentForNodeId('bone_femur')).toBe('thigh');
    expect(getKinematicSegmentForNodeId('joint_hip')).toBe('thigh');
    expect(getKinematicSegmentForNodeId('muscle_quadriceps_rectus_femoris')).toBe('thigh');

    // Shin
    expect(getKinematicSegmentForNodeId('bone_tibia')).toBe('shin');
    expect(getKinematicSegmentForNodeId('bone_patella')).toBe('shin');
    expect(getKinematicSegmentForNodeId('joint_knee')).toBe('shin');
    expect(getKinematicSegmentForNodeId('muscle_gastrocnemius')).toBe('shin');

    // Foot
    expect(getKinematicSegmentForNodeId('bone_calcaneus')).toBe('foot');
    expect(getKinematicSegmentForNodeId('bone_talus')).toBe('foot');
    expect(getKinematicSegmentForNodeId('joint_ankle')).toBe('foot');
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
});
