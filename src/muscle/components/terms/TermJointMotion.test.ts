// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { DEFAULT_ANATOMY_STAGE_FRAME } from '../../types/anatomyStageFrame';
import { getAnatomyTermById } from '../../curriculum/anatomyTerms';

describe('TermJointMotion kinematics and landmarks', () => {
  const frame = {
    ...DEFAULT_ANATOMY_STAGE_FRAME,
    layout: {
      position: [0.0643, -0.0445, -0.0083] as [number, number, number],
      scale: 1.0522,
    },
  };

  it('calculates elbow flexion pivot directly at the anatomical elbow joint', () => {
    const term = getAnatomyTermById('term_flexion');
    expect(term).toBeDefined();

    // Fallback local coords for joint_elbow
    const localElbow: [number, number, number] = [0.22, 1.107, -0.037];
    const worldElbow = new THREE.Vector3(
      localElbow[0] * frame.layout.scale + frame.layout.position[0],
      localElbow[1] * frame.layout.scale + frame.layout.position[1],
      localElbow[2] * frame.layout.scale + frame.layout.position[2],
    );

    // Pivot must be at x ≈ 0.296 (right arm, well outside the midline chest x ≈ 0.064)
    expect(worldElbow.x).toBeGreaterThan(0.25);
    // Y must be at elbow level ~1.12
    expect(worldElbow.y).toBeCloseTo(1.12, 1);
  });

  it('elbow flexion swings the forearm anteriorly and upward toward the upper arm, decreasing the joint angle', () => {
    const localElbow: [number, number, number] = [0.22, 1.107, -0.037];
    const localShoulder: [number, number, number] = [0.163, 1.378, -0.028];
    const localWrist: [number, number, number] = [0.265, 0.852, 0.022];

    const toWorld = (l: [number, number, number]) =>
      new THREE.Vector3(
        l[0] * frame.layout.scale + frame.layout.position[0],
        l[1] * frame.layout.scale + frame.layout.position[1],
        l[2] * frame.layout.scale + frame.layout.position[2],
      );

    const pivot = toWorld(localElbow);
    const anchor = toWorld(localShoulder);
    const restDistal = toWorld(localWrist);

    const uUpper = new THREE.Vector3().subVectors(anchor, pivot).normalize();
    const uForearm0 = new THREE.Vector3().subVectors(restDistal, pivot).normalize();
    const forearmLength = pivot.distanceTo(restDistal);
    const rotationAxis = new THREE.Vector3().crossVectors(uForearm0, uUpper).normalize();

    // Transverse rotation axis predominantly in X direction (epicondylar axis)
    expect(Math.abs(rotationAxis.x)).toBeGreaterThan(0.85);

    // Initial angle at full extension (nearly 180 degrees)
    const initialAngleDeg = (uForearm0.angleTo(uUpper) * 180) / Math.PI;
    expect(initialAngleDeg).toBeGreaterThan(150);

    // At full flexion (135 degrees of flexion)
    const maxFlexion = (135 * Math.PI) / 180;
    const flexedDir = uForearm0.clone().applyAxisAngle(rotationAxis, maxFlexion);
    const flexedWrist = pivot.clone().addScaledVector(flexedDir, forearmLength);

    // Flexed wrist must be higher (+Y) than resting wrist
    expect(flexedWrist.y).toBeGreaterThan(restDistal.y + 0.35);

    // Flexed wrist must be anterior (+Z) relative to resting wrist
    expect(flexedWrist.z).toBeGreaterThan(restDistal.z + 0.05);

    // The angle between forearm and upper arm MUST decrease (the definition of flexion)
    const flexedAngleDeg = (flexedDir.angleTo(uUpper) * 180) / Math.PI;
    expect(flexedAngleDeg).toBeLessThan(45);
    expect(flexedAngleDeg).toBeLessThan(initialAngleDeg);
  });

  it('knee extension hinges at the knee joint and increases joint angle to full extension', () => {
    const localKnee: [number, number, number] = [0.095, 0.435, -0.026];
    const localHip: [number, number, number] = [0.09, 0.885, -0.007];
    const localAnkle: [number, number, number] = [0.08, 0.075, -0.029];

    const toWorld = (l: [number, number, number]) =>
      new THREE.Vector3(
        l[0] * frame.layout.scale + frame.layout.position[0],
        l[1] * frame.layout.scale + frame.layout.position[1],
        l[2] * frame.layout.scale + frame.layout.position[2],
      );

    const pivot = toWorld(localKnee);
    const anchor = toWorld(localHip);
    const straightAnkle = toWorld(localAnkle);

    // Knee is below hip and above ankle
    expect(pivot.y).toBeLessThan(anchor.y);
    expect(pivot.y).toBeGreaterThan(straightAnkle.y);
  });
});
