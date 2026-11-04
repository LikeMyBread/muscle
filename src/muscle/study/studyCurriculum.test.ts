import { describe, expect, it } from 'vitest';
import {
  STUDY_UNITS,
  TEXT_UNIT_IDS,
  isGraduatedTo3D,
  isUnitUnlocked,
} from './studyCurriculum';

describe('studyCurriculum & graduation', () => {
  it('defines 5 initial text units for Module 1 (Language of Anatomy)', () => {
    const textUnits = STUDY_UNITS.filter((u) => u.type === 'text');
    expect(textUnits).toHaveLength(5);
    expect(textUnits.map((u) => u.id)).toEqual(TEXT_UNIT_IDS);
  });

  it('prevents graduation to 3D mode until all 5 text units are completed', () => {
    expect(isGraduatedTo3D([])).toBe(false);
    expect(isGraduatedTo3D(['unit_terms_planes', 'unit_terms_locations'])).toBe(false);
    expect(
      isGraduatedTo3D([
        'unit_terms_planes',
        'unit_terms_locations',
        'unit_terms_movement',
        'unit_terms_naming',
      ]),
    ).toBe(false);

    expect(isGraduatedTo3D(TEXT_UNIT_IDS)).toBe(true);
  });

  it('locks 3D units when text units are incomplete, and unlocks sequentially when prerequisites met', () => {
    // 3D fundamentals unit is locked without text completion
    expect(isUnitUnlocked('unit_fund_head_torso', [])).toBe(false);

    // Complete all text units
    expect(isUnitUnlocked('unit_fund_head_torso', TEXT_UNIT_IDS)).toBe(true);

    // Later 3D units require preceding 3D units
    expect(isUnitUnlocked('unit_torso_anterior', TEXT_UNIT_IDS)).toBe(false);
    expect(
      isUnitUnlocked('unit_torso_anterior', [
        ...TEXT_UNIT_IDS,
        'unit_fund_head_torso',
        'unit_fund_limbs',
      ]),
    ).toBe(true);
  });

  it('unlocks all units and graduates to 3D immediately when debugUnlocked is true', () => {
    expect(isGraduatedTo3D([], true)).toBe(true);
    expect(isUnitUnlocked('unit_fund_head_torso', [], true)).toBe(true);
    expect(isUnitUnlocked('unit_torso_anterior', [], true)).toBe(true);
    expect(isUnitUnlocked('unit_foot_landmarks', [], true)).toBe(true);
  });
});
