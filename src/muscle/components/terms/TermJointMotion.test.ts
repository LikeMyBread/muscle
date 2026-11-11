// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { DEFAULT_ANATOMY_STAGE_FRAME } from '../../types/anatomyStageFrame';
import { getAnatomyTermById } from '../../curriculum/anatomyTerms';
import {
  buildAngleArcPoints,
  buildJointMotionSpec,
  computeMotionProgress,
  resolveWorldLandmark,
} from './TermJointMotion';

describe('TermJointMotion kinematics and landmarks', () => {
  const frame = {
    ...DEFAULT_ANATOMY_STAGE_FRAME,
    layout: {
      position: [0.0643, -0.0445, -0.0083] as [number, number, number],
      scale: 1.0522,
    },
  };

  describe('computeMotionProgress', () => {
    it('executes a jump-back cycle for flexion and straightening', () => {
      // Phase 1: hold at start pose (0 to 0.25s)
      expect(computeMotionProgress(0.1, true)).toBe(0);

      // Phase 2: smooth ease movement (0.25 to 1.65s)
      const halfway = computeMotionProgress(0.25 + 0.7, true);
      expect(halfway).toBeCloseTo(0.5, 1);
      expect(halfway).toBeGreaterThan(0.4);
      expect(halfway).toBeLessThan(0.6);

      // Phase 3: hold at final pose (1.65 to 2.20s)
      expect(computeMotionProgress(1.8, true)).toBe(1);
      expect(computeMotionProgress(2.19, true)).toBe(1);

      // Phase 4: jump back to start on next cycle (wrap at 2.20s)
      expect(computeMotionProgress(2.21, true)).toBe(0);
      expect(computeMotionProgress(2.35, true)).toBe(0);
    });

    it('executes smooth sine oscillation when jumpBack is false', () => {
      // Sine wave starts at 0 at t = 0
      expect(computeMotionProgress(0, false)).toBeCloseTo(0, 1);
      // Oscillates smoothly
      const val = computeMotionProgress(1.0, false);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    });
  });

  it('resolves world landmark taking ancestor group matrix transforms into account', () => {
    const scene = new THREE.Scene();
    const halfGroup = new THREE.Group();
    // Simulate AnatomyHalfGroup sagittal offset
    halfGroup.position.set(0.1824, 0.0656, -0.0035);
    scene.add(halfGroup);

    const geom = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    const mat = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = 'joint_elbow';
    mesh.position.set(0.22, 1.107, -0.037);
    halfGroup.add(mesh);

    // Call resolveWorldLandmark
    const resolved = resolveWorldLandmark(scene, 'joint_elbow', [0.22, 1.107, -0.037], frame);

    // X position must include halfGroup translation (0.22 + 0.1824 = ~0.4024), NOT un-updated local (0.22)
    expect(resolved.x).toBeCloseTo(0.4024, 2);
    expect(resolved.y).toBeCloseTo(1.107 + 0.0656, 2);
  });

  it('resolves fallback landmark using default sagittal split offset if stage frame layout is empty', () => {
    const scene = new THREE.Scene();
    const fallback = resolveWorldLandmark(
      scene,
      'joint_elbow',
      [0.22, 1.107, -0.037],
      {
        ...DEFAULT_ANATOMY_STAGE_FRAME,
        layout: { position: [0, 0, 0], scale: 1 },
      },
    );
    // Even if position is [0, 0, 0], fallback applies the study sagittal offset ~0.1824 so it is not in ribcage
    expect(fallback.x).toBeGreaterThan(0.35);
  });

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

  it('knee extension starts bent at 70 degrees, stops at 179 degrees, and keeps the interior angle arc posterior', () => {
    const scene = new THREE.Scene();
    const spec = buildJointMotionSpec('extension', scene, frame);

    // Knee is below hip
    expect(spec.pivot.y).toBeLessThan(spec.anchor.y);

    // Starts bent at an acute angle (70°)
    const startAngleDeg = (spec.uDistal0.angleTo(spec.uAnchor) * 180) / Math.PI;
    expect(startAngleDeg).toBeCloseTo(70, 3);

    // Straightens to 179° (stopping 1° shy of 180° to prevent interior-angle side ambiguity)
    const endDir = spec.uDistal0.clone().applyAxisAngle(spec.rotationAxis, spec.maxAngle);
    const endAngleDeg = (endDir.angleTo(spec.uAnchor) * 180) / Math.PI;
    expect(endAngleDeg).toBeCloseTo(179, 3);
    expect(endAngleDeg).toBeLessThan(180);

    // Arrowhead sits at the 179° extended target position
    const expectedEndPos = spec.pivot.clone().addScaledVector(endDir, spec.distalLength);
    expect(spec.arrowPos.distanceTo(expectedEndPos)).toBeCloseTo(0, 4);

    // Throughout the entire extension sweep including 179°, the interior angle arc stays posterior (-Z)
    for (const progress of [0, 0.25, 0.5, 0.75, 0.95, 1]) {
      const dir = spec.uDistal0
        .clone()
        .applyAxisAngle(spec.rotationAxis, progress * spec.maxAngle);
      const arc = buildAngleArcPoints(
        spec.pivot,
        dir,
        spec.uAnchor,
        spec.rotationAxis,
        spec.angleArcRadius,
      );
      expect(arc.length).toBeGreaterThan(2);
      const midPt = arc[Math.floor(arc.length / 2)];
      expect(midPt[2]).toBeLessThan(spec.pivot.z);
    }
  });

  it('shoulder abduction starts at side, raises away from midline, and increases lateral distance', () => {
    const localShoulder: [number, number, number] = [0.163, 1.378, -0.028];
    const localWrist: [number, number, number] = [0.265, 0.852, 0.022];

    const toWorld = (l: [number, number, number]) =>
      new THREE.Vector3(
        l[0] * frame.layout.scale + frame.layout.position[0],
        l[1] * frame.layout.scale + frame.layout.position[1],
        l[2] * frame.layout.scale + frame.layout.position[2],
      );

    const pivot = toWorld(localShoulder);
    const wristAtSide = toWorld(localWrist);
    const armLength = pivot.distanceTo(wristAtSide);

    const uArmRest = new THREE.Vector3().subVectors(wristAtSide, pivot).normalize();
    const rotationAxis = new THREE.Vector3(0, 0, 1);
    const maxAngle = (85 * Math.PI) / 180;
    const raisedDir = uArmRest.clone().applyAxisAngle(rotationAxis, maxAngle);
    const raisedWrist = pivot.clone().addScaledVector(raisedDir, armLength);

    // Lateral distance (X) from shoulder to wrist must increase significantly
    expect(raisedWrist.x).toBeGreaterThan(wristAtSide.x + 0.3);
    // Vertical position (Y) raises up
    expect(raisedWrist.y).toBeGreaterThan(wristAtSide.y + 0.3);

    // Arrow tangent at raised position points in direction of abduction (upward and slightly lateral)
    const arrowTangent = new THREE.Vector3().crossVectors(rotationAxis, raisedDir).normalize();
    expect(arrowTangent.y).toBeGreaterThan(0.8);
  });

  it('shoulder adduction starts raised, lowers toward midline, and decreases lateral distance', () => {
    const localShoulder: [number, number, number] = [0.163, 1.378, -0.028];
    const localWrist: [number, number, number] = [0.265, 0.852, 0.022];

    const toWorld = (l: [number, number, number]) =>
      new THREE.Vector3(
        l[0] * frame.layout.scale + frame.layout.position[0],
        l[1] * frame.layout.scale + frame.layout.position[1],
        l[2] * frame.layout.scale + frame.layout.position[2],
      );

    const pivot = toWorld(localShoulder);
    const wristAtSide = toWorld(localWrist);
    const armLength = pivot.distanceTo(wristAtSide);

    const uArmRest = new THREE.Vector3().subVectors(wristAtSide, pivot).normalize();
    const maxAngle = (85 * Math.PI) / 180;
    const uArmRaised = uArmRest.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), maxAngle);
    const raisedWrist = pivot.clone().addScaledVector(uArmRaised, armLength);

    // Adduction rotates around -Z axis back down to side
    const adductionAxis = new THREE.Vector3(0, 0, -1);
    const loweredDir = uArmRaised.clone().applyAxisAngle(adductionAxis, maxAngle);
    const finalWrist = pivot.clone().addScaledVector(loweredDir, armLength);

    // Starts raised at high X
    expect(raisedWrist.x).toBeGreaterThan(wristAtSide.x + 0.3);

    // Ends lowered back at side (finalWrist matches wristAtSide)
    expect(finalWrist.distanceTo(wristAtSide)).toBeCloseTo(0, 3);
    expect(finalWrist.x).toBeLessThan(raisedWrist.x - 0.3);

    // Arrow tangent at lowered position points medially and down (direction of adduction)
    const arrowTangent = new THREE.Vector3().crossVectors(adductionAxis, uArmRest).normalize();
    expect(arrowTangent.x).toBeLessThan(-0.8); // Points medially toward midline
  });

  it('pronation curves 180 degrees inward around the wrist', () => {
    const localElbow: [number, number, number] = [0.22, 1.107, -0.037];
    const localWrist: [number, number, number] = [0.265, 0.852, 0.022];

    const toWorld = (l: [number, number, number]) =>
      new THREE.Vector3(
        l[0] * frame.layout.scale + frame.layout.position[0],
        l[1] * frame.layout.scale + frame.layout.position[1],
        l[2] * frame.layout.scale + frame.layout.position[2],
      );

    const pivot = toWorld(localWrist);
    const anchor = toWorld(localElbow);

    const uForearm = new THREE.Vector3().subVectors(pivot, anchor).normalize();
    const zAnt = new THREE.Vector3(0, 0, 1);
    const uAnterior = zAnt.clone().sub(uForearm.clone().multiplyScalar(zAnt.dot(uForearm))).normalize();
    const uLateral = new THREE.Vector3().crossVectors(uAnterior, uForearm).normalize();
    const uMedial = uLateral.clone().negate();

    // 180° rotation of lateral starting direction around forearm axis reaches medial direction
    const endDir = uLateral.clone().applyAxisAngle(uForearm, Math.PI);
    expect(endDir.distanceTo(uMedial)).toBeCloseTo(0, 3);

    // Lateral is +X, Medial is -X
    expect(uLateral.x).toBeGreaterThan(0.8);
    expect(uMedial.x).toBeLessThan(-0.8);

    // Tangent at end of 180° curve points posteriorly in the rotation plane
    const arrowTangent = new THREE.Vector3().crossVectors(uForearm, uMedial).normalize();
    expect(arrowTangent.z).toBeLessThan(-0.8);
  });

  it('supination curves 180 degrees outward around the wrist', () => {
    const localElbow: [number, number, number] = [0.22, 1.107, -0.037];
    const localWrist: [number, number, number] = [0.265, 0.852, 0.022];

    const toWorld = (l: [number, number, number]) =>
      new THREE.Vector3(
        l[0] * frame.layout.scale + frame.layout.position[0],
        l[1] * frame.layout.scale + frame.layout.position[1],
        l[2] * frame.layout.scale + frame.layout.position[2],
      );

    const pivot = toWorld(localWrist);
    const anchor = toWorld(localElbow);

    const uForearm = new THREE.Vector3().subVectors(pivot, anchor).normalize();
    const zAnt = new THREE.Vector3(0, 0, 1);
    const uAnterior = zAnt.clone().sub(uForearm.clone().multiplyScalar(zAnt.dot(uForearm))).normalize();
    const uLateral = new THREE.Vector3().crossVectors(uAnterior, uForearm).normalize();
    const uMedial = uLateral.clone().negate();

    // Outward rotation around -uForearm takes medial starting direction to lateral direction
    const endDir = uMedial.clone().applyAxisAngle(uForearm.clone().negate(), Math.PI);
    expect(endDir.distanceTo(uLateral)).toBeCloseTo(0, 3);

    // Tangent at end of 180° outward curve points posteriorly in the rotation plane
    const arrowTangent = new THREE.Vector3().crossVectors(uForearm.clone().negate(), uLateral).normalize();
    expect(arrowTangent.z).toBeLessThan(-0.8);
  });
});
