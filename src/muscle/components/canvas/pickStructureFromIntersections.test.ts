import * as THREE from 'three';
import { BoxGeometry, Mesh } from 'three';
import { describe, expect, it } from 'vitest';
import { getNodesForRegion } from '../../curriculum';
import {
  pickStructureDetailsFromIntersections,
  pickStructureFromIntersections,
} from './pickStructureFromIntersections';

function hit(mesh: Mesh, distance: number): THREE.Intersection {
  return { object: mesh, distance, point: new THREE.Vector3() };
}

describe('pickStructureFromIntersections', () => {
  it('prefers superficial muscles over deeper bones along the same ray', () => {
    const muscle = getNodesForRegion('torso').find((node) => node.type === 'muscle' && node.layerDepth === 0);
    const bone = getNodesForRegion('fundamentals').find((node) => node.type === 'bone');
    expect(muscle).toBeTruthy();
    expect(bone).toBeTruthy();
    if (!muscle || !bone) return;

    const muscleMesh = new Mesh(new BoxGeometry(1, 1, 1));
    muscleMesh.name = muscle.id;
    const boneMesh = new Mesh(new BoxGeometry(1, 1, 1));
    boneMesh.name = bone.id;

    const picked = pickStructureFromIntersections(
      [hit(boneMesh, 1), hit(muscleMesh, 2)],
      0,
    );
    expect(picked).toBe(muscle.id);
  });

  it('ignores atlas mirror fill meshes', () => {
    const muscle = getNodesForRegion('torso').find((node) => node.type === 'muscle');
    expect(muscle).toBeTruthy();
    if (!muscle) return;

    const mirrorMesh = new Mesh(new BoxGeometry(1, 1, 1));
    mirrorMesh.name = `${muscle.id}__atlas_mirror`;

    const picked = pickStructureFromIntersections([hit(mirrorMesh, 0.5)], 0);
    expect(picked).toBeUndefined();
  });

  it('resolves correct side (left or right) for tapped symmetrical structures', () => {
    const muscle = getNodesForRegion('shoulder_neck').find((node) => node.type === 'muscle');
    expect(muscle).toBeTruthy();
    if (!muscle) return;

    const leftMesh = new Mesh(new BoxGeometry(1, 1, 1));
    leftMesh.name = muscle.id;
    leftMesh.userData = { side: 'left' };

    const rightMesh = new Mesh(new BoxGeometry(1, 1, 1));
    rightMesh.name = muscle.id;
    rightMesh.userData = { side: 'right' };

    const leftHit: THREE.Intersection = {
      object: leftMesh,
      distance: 1,
      point: new THREE.Vector3(0.3, 1.4, 0),
    };
    const rightHit: THREE.Intersection = {
      object: rightMesh,
      distance: 1,
      point: new THREE.Vector3(-0.3, 1.4, 0),
    };

    const leftDetails = pickStructureDetailsFromIntersections([leftHit], 0);
    const rightDetails = pickStructureDetailsFromIntersections([rightHit], 0);

    expect(leftDetails?.nodeId).toBe(muscle.id);
    expect(leftDetails?.side).toBe('left');

    expect(rightDetails?.nodeId).toBe(muscle.id);
    expect(rightDetails?.side).toBe('right');
  });
});
