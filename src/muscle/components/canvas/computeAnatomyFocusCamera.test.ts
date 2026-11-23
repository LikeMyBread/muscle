import { Group, Mesh, Object3D, PerspectiveCamera, SphereGeometry, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import {
  computeFramingPresetFromLayout,
  computeFramingPresetFromObject,
  findSceneObjectForNodeId,
} from './computeAnatomyFocusCamera';

describe('computeAnatomyFocusCamera', () => {
  it('correctly focuses on left vs right version of symmetrical body parts', () => {
    const scene = new Group();

    // Symmetrical deltoid meshes: right (-X) and left (+X)
    const rightDeltoid = new Mesh(new SphereGeometry(0.15, 8, 8));
    rightDeltoid.name = 'muscle_deltoid';
    rightDeltoid.userData = { side: 'right' };
    rightDeltoid.position.set(-0.35, 1.45, 0.05);

    const leftDeltoid = new Mesh(new SphereGeometry(0.15, 8, 8));
    leftDeltoid.name = 'muscle_deltoid';
    leftDeltoid.userData = { side: 'left' };
    leftDeltoid.position.set(0.35, 1.45, 0.05);

    const refGroup = new Group();
    refGroup.name = 'anatomy-half-reference';
    refGroup.add(rightDeltoid);

    const studyGroup = new Group();
    studyGroup.name = 'anatomy-half-study';
    studyGroup.add(leftDeltoid);

    scene.add(refGroup);
    scene.add(studyGroup);
    scene.updateMatrixWorld(true);

    const foundLeft = findSceneObjectForNodeId(scene, 'muscle_deltoid', 'left');
    const foundRight = findSceneObjectForNodeId(scene, 'muscle_deltoid', 'right');

    expect(foundLeft).toBe(leftDeltoid);
    expect(foundRight).toBe(rightDeltoid);

    // Compute presets for left and right
    const leftPreset = computeFramingPresetFromObject(foundLeft!);
    const rightPreset = computeFramingPresetFromObject(foundRight!);

    expect(leftPreset.target[0]).toBeCloseTo(0.35, 2);
    expect(rightPreset.target[0]).toBeCloseTo(-0.35, 2);
  });
  it('frames a mesh bounding box with the camera looking at its center', () => {
    const root = new Object3D();
    const mesh = new Mesh(new SphereGeometry(0.2, 8, 8));
    mesh.position.set(0.4, 1.1, 0.05);
    root.add(mesh);
    root.updateMatrixWorld(true);

    const preset = computeFramingPresetFromObject(mesh);

    expect(preset.target[0]).toBeCloseTo(0.4, 2);
    expect(preset.target[1]).toBeCloseTo(1.1, 2);
    expect(preset.target[2]).toBeCloseTo(0.05, 2);
    expect(preset.position[2]).toBeGreaterThan(preset.target[2]);
  });

  it('preserves the current viewing direction when reframing focus', () => {
    const root = new Object3D();
    const mesh = new Mesh(new SphereGeometry(0.2, 8, 8));
    mesh.position.set(0.35, 1.45, -0.12);
    root.add(mesh);
    root.updateMatrixWorld(true);

    const viewFrom = new Vector3(0.2, 1.5, -1.8);
    const preset = computeFramingPresetFromObject(mesh, viewFrom);

    expect(preset.target[2]).toBeLessThan(0);
    expect(preset.position[2]).toBeLessThan(preset.target[2]);
  });

  it('frames procedural layout hints from the current camera bearing', () => {
    const camera = new PerspectiveCamera();
    camera.position.set(-0.4, 1.55, 2.4);
    const preset = computeFramingPresetFromLayout([0.2, 1.5, 0.1], [0.3, 0.2, 0.15], camera.position);
    expect(preset.target).toEqual([0.2, 1.5, 0.1]);
    expect(preset.position[0]).toBeLessThan(preset.target[0]);
  });

  it('frames knee joint above the floor at anatomical knee height', () => {
    const kneeLayoutPos: [number, number, number] = [0.28, 0.48, 0.05];
    const camera = new PerspectiveCamera();
    camera.position.set(0.35, 0.52, 1.2);
    const preset = computeFramingPresetFromLayout(kneeLayoutPos, [0.1, 0.1, 0.1], camera.position);

    // Target must be at knee height ~0.48, well above the feet/floor (y > 0.40)
    expect(preset.target[1]).toBeCloseTo(0.48, 2);
    expect(preset.target[1]).toBeGreaterThan(0.4);
    expect(preset.position[1]).toBeGreaterThan(0.4);
  });
});
