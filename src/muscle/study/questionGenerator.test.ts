import { describe, expect, it } from 'vitest';
import {
  generateTextQuestion,
  generate3DQuestion,
  computeBestPeelDepthForNode,
} from './questionGenerator';
import { STUDY_UNITS } from './studyCurriculum';
import { getNodeById } from '../curriculum';

describe('questionGenerator', () => {
  it('generates 4 distinct choices for text terminology questions', () => {
    const planesUnit = STUDY_UNITS.find((u) => u.id === 'unit_terms_planes')!;
    const q = generateTextQuestion('term_plane_sagittal', planesUnit);

    expect(q).not.toBeNull();
    expect(q?.type).toBe('text');
    expect(q?.targetId).toBe('term_plane_sagittal');
    expect(q?.choices).toHaveLength(4);

    const ids = q!.choices.map((c) => c.id);
    expect(new Set(ids).size).toBe(4);
    expect(ids).toContain('term_plane_sagittal');
  });

  it('generates 4 distinct choices for 3D questions with distractors from the same group/module', () => {
    const deltoidUnit = STUDY_UNITS.find((u) => u.id === 'unit_sn_girdle_deltoid')!;
    const q = generate3DQuestion('muscle_deltoid_anterior', deltoidUnit);

    expect(q).not.toBeNull();
    expect(q?.type).toBe('3d');
    expect(q?.targetId).toBe('muscle_deltoid_anterior');
    expect(q?.choices).toHaveLength(4);

    const ids = q!.choices.map((c) => c.id);
    expect(new Set(ids).size).toBe(4);
    expect(ids).toContain('muscle_deltoid_anterior');
  });

  it('computes optimal layer peel depth (bones hide muscles at depth 3)', () => {
    const skull = getNodeById('bone_skull')!;
    expect(computeBestPeelDepthForNode(skull)).toBe(3);

    const clavicle = getNodeById('bone_clavicle')!;
    expect(computeBestPeelDepthForNode(clavicle)).toBe(3);

    const pecMajor = getNodeById('muscle_pectoralis_major')!;
    expect(computeBestPeelDepthForNode(pecMajor)).toBeLessThan(3);
  });
});
