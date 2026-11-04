import type { MuscleRegion } from '../types/node';
import type { StudyUnit } from './types';

export const STUDY_MODULE_METADATA: Record<
  MuscleRegion,
  { order: number; label: string; icon: string; description: string; is3D: boolean }
> = {
  anatomy_terms: {
    order: 1,
    label: 'Language of Anatomy',
    icon: '📚',
    description: 'Planes, directional terms, movement, and joint types (text foundation)',
    is3D: false,
  },
  fundamentals: {
    order: 2,
    label: 'Skeletal Landmarks',
    icon: '💀',
    description: 'Key bony landmarks and major joint pivots in 3D',
    is3D: true,
  },
  torso: {
    order: 3,
    label: 'Torso Masses',
    icon: '🎽',
    description: 'Pecs, abs, obliques, lats, and spine columns',
    is3D: true,
  },
  shoulder_neck: {
    order: 4,
    label: 'Shoulder & Neck',
    icon: '🦾',
    description: 'Deltoid heads, shoulder girdle, and rotator cuff',
    is3D: true,
  },
  arm: {
    order: 5,
    label: 'Arm Volumes',
    icon: '💪',
    description: 'Biceps, triceps heads, and forearm contours',
    is3D: true,
  },
  hand: {
    order: 6,
    label: 'Hand Architecture',
    icon: '✋',
    description: 'Palm masses, thenar group, and digit tendons',
    is3D: true,
  },
  leg: {
    order: 7,
    label: 'Leg Pillars',
    icon: '🦵',
    description: 'Quadriceps, hamstrings, gluteals, and calf',
    is3D: true,
  },
  foot: {
    order: 8,
    label: 'Foot Base',
    icon: '🦶',
    description: 'Heel calcaneus, arches, and metatarsals',
    is3D: true,
  },
};

export const STUDY_UNITS: StudyUnit[] = [
  // ==========================================
  // MODULE 1: Language of Anatomy (Text Units)
  // ==========================================
  {
    id: 'unit_terms_planes',
    moduleId: 'anatomy_terms',
    title: 'Reference & Planes',
    subtitle: 'Anatomical position and the three cardinal slicing planes',
    type: 'text',
    groupName: 'Planes',
    itemIds: [
      'term_anatomical_position',
      'term_planes_overview',
      'term_plane_sagittal',
      'term_plane_coronal',
      'term_plane_transverse',
    ],
  },
  {
    id: 'unit_terms_locations',
    moduleId: 'anatomy_terms',
    title: 'Directional Pairs',
    subtitle: 'Anterior/Posterior, Medial/Lateral, Proximal/Distal, Deep/Superficial',
    type: 'text',
    groupName: 'Directions',
    itemIds: [
      'term_anterior',
      'term_posterior',
      'term_medial',
      'term_lateral',
      'term_superior',
      'term_inferior',
      'term_proximal',
      'term_distal',
      'term_deep',
      'term_superficial',
    ],
    prerequisiteUnitId: 'unit_terms_planes',
  },
  {
    id: 'unit_terms_movement',
    moduleId: 'anatomy_terms',
    title: 'Movement Vocabulary',
    subtitle: 'Flexion/Extension, Abduction/Adduction, Pronation/Supination, Origin/Insertion',
    type: 'text',
    groupName: 'Movement',
    itemIds: [
      'term_flexion',
      'term_extension',
      'term_abduction',
      'term_adduction',
      'term_pronation',
      'term_supination',
      'term_origin',
      'term_insertion',
    ],
    prerequisiteUnitId: 'unit_terms_locations',
  },
  {
    id: 'unit_terms_naming',
    moduleId: 'anatomy_terms',
    title: 'Naming Patterns',
    subtitle: 'Roots and affixes: Bi-, Tri-, Maximus, Minimus, Longus, Brevis, Gluteus',
    type: 'text',
    groupName: 'Naming',
    itemIds: [
      'term_prefix_bi',
      'term_prefix_tri',
      'term_prefix_maximus',
      'term_prefix_minimus',
      'term_prefix_longus',
      'term_prefix_brevis',
      'term_prefix_gluteus',
    ],
    prerequisiteUnitId: 'unit_terms_movement',
  },
  {
    id: 'unit_terms_joints',
    moduleId: 'anatomy_terms',
    title: 'Joint Classifications',
    subtitle: 'Hinge, Pivot, Ball & Socket, Ellipsoid, Saddle, and Plane joints',
    type: 'text',
    groupName: 'Joints',
    itemIds: [
      'term_joint_hinge',
      'term_joint_pivot',
      'term_joint_ball_socket',
      'term_joint_ellipsoid',
      'term_joint_saddle',
      'term_joint_plane',
    ],
    prerequisiteUnitId: 'unit_terms_naming',
  },

  // ==========================================
  // MODULE 2: Skeletal Landmarks (3D Units)
  // ==========================================
  {
    id: 'unit_fund_head_torso',
    moduleId: 'fundamentals',
    title: 'Head & Torso Landmarks',
    subtitle: 'Skull, sternum, rib cage, and pelvic bowl',
    type: '3d',
    groupName: 'Axial Skeleton',
    itemIds: ['bone_skull', 'bone_sternum', 'bone_ribcage', 'bone_pelvis'],
    prerequisiteUnitId: 'unit_terms_joints',
  },
  {
    id: 'unit_fund_limbs',
    moduleId: 'fundamentals',
    title: 'Limb Landmarks & Major Pivots',
    subtitle: 'Humerus, radius, ulna, femur, tibia, and major joint pivots',
    type: '3d',
    groupName: 'Appendicular Skeleton',
    itemIds: [
      'bone_humerus',
      'bone_radius',
      'bone_ulna',
      'bone_femur',
      'bone_tibia',
      'joint_shoulder',
      'joint_elbow',
      'joint_hip',
      'joint_knee',
    ],
    prerequisiteUnitId: 'unit_fund_head_torso',
  },

  // ==========================================
  // MODULE 3: Torso (3D Units)
  // ==========================================
  {
    id: 'unit_torso_anterior',
    moduleId: 'torso',
    title: 'Anterior Torso Forms',
    subtitle: 'Pectoralis major, rectus abdominis, obliques, and serratus',
    type: '3d',
    groupName: 'Chest & Abdomen',
    itemIds: [
      'muscle_pectoralis_major',
      'muscle_rectus_abdominis',
      'muscle_external_oblique',
      'muscle_serratus_anterior',
    ],
    prerequisiteUnitId: 'unit_fund_limbs',
  },
  {
    id: 'unit_torso_posterior',
    moduleId: 'torso',
    title: 'Posterior Torso Forms',
    subtitle: 'Latissimus dorsi and erector spinae group',
    type: '3d',
    groupName: 'Back Columns',
    itemIds: ['muscle_latissimus_dorsi', 'muscle_erector_spinae'],
    prerequisiteUnitId: 'unit_torso_anterior',
  },

  // ==========================================
  // MODULE 4: Shoulder & Neck (3D Units)
  // ==========================================
  {
    id: 'unit_sn_girdle_deltoid',
    moduleId: 'shoulder_neck',
    title: 'Shoulder Girdle & Deltoids',
    subtitle: 'Clavicle, scapula, and the anterior, lateral, and posterior deltoid heads',
    type: '3d',
    groupName: 'Deltoid & Girdle',
    itemIds: [
      'bone_clavicle',
      'bone_scapula',
      'muscle_deltoid_anterior',
      'muscle_deltoid_lateral',
      'muscle_deltoid_posterior',
    ],
    prerequisiteUnitId: 'unit_torso_posterior',
  },
  {
    id: 'unit_sn_rotator_cuff',
    moduleId: 'shoulder_neck',
    title: 'Rotator Cuff & Deep Girdle',
    subtitle: 'Supraspinatus, infraspinatus, teres minor, and subscapularis',
    type: '3d',
    groupName: 'Rotator Cuff',
    itemIds: [
      'muscle_supraspinatus',
      'muscle_infraspinatus',
      'muscle_teres_minor',
      'muscle_subscapularis',
    ],
    prerequisiteUnitId: 'unit_sn_girdle_deltoid',
  },
  {
    id: 'unit_sn_neck_surface',
    moduleId: 'shoulder_neck',
    title: 'Neck & Upper Back Surface Forms',
    subtitle: 'Trapezius upper, sternocleidomastoid, rhomboids, and teres major',
    type: '3d',
    groupName: 'Neck & Trapezius',
    itemIds: [
      'muscle_trapezius_upper',
      'muscle_sternocleidomastoid',
      'muscle_rhomboid_major',
      'muscle_teres_major',
    ],
    prerequisiteUnitId: 'unit_sn_rotator_cuff',
  },

  // ==========================================
  // MODULE 5: Arm (3D Units)
  // ==========================================
  {
    id: 'unit_arm_flexors_triceps',
    moduleId: 'arm',
    title: 'Upper Arm Flexors & Triceps',
    subtitle: 'Biceps brachii, brachialis, and all three triceps heads',
    type: '3d',
    groupName: 'Upper Arm Masses',
    itemIds: [
      'muscle_biceps_brachii',
      'muscle_brachialis',
      'muscle_triceps_long_head',
      'muscle_triceps_lateral_head',
      'muscle_triceps_medial_head',
    ],
    prerequisiteUnitId: 'unit_sn_neck_surface',
  },
  {
    id: 'unit_arm_forearm',
    moduleId: 'arm',
    title: 'Forearm Ridges & Wrist Drivers',
    subtitle: 'Brachioradialis, extensor carpi radialis, and flexor carpi radialis',
    type: '3d',
    groupName: 'Forearm Group',
    itemIds: [
      'muscle_brachioradialis',
      'muscle_extensor_carpi_radialis',
      'muscle_flexor_carpi_radialis',
    ],
    prerequisiteUnitId: 'unit_arm_flexors_triceps',
  },

  // ==========================================
  // MODULE 6: Hand (3D Units)
  // ==========================================
  {
    id: 'unit_hand_architecture',
    moduleId: 'hand',
    title: 'Hand Bones & Palm Masses',
    subtitle: 'Carpals, metacarpals, phalanges, and thenar/hypothenar eminences',
    type: '3d',
    groupName: 'Hand Architecture',
    itemIds: [
      'bone_carpals',
      'bone_metacarpals',
      'bone_phalanges_hand',
      'muscle_thenar_eminence',
      'muscle_hypothenar_eminence',
    ],
    prerequisiteUnitId: 'unit_arm_forearm',
  },

  // ==========================================
  // MODULE 7: Leg (3D Units)
  // ==========================================
  {
    id: 'unit_leg_quads_glutes',
    moduleId: 'leg',
    title: 'Quadriceps & Gluteal Masses',
    subtitle: 'Rectus femoris, vastus lateralis/medialis/intermedius, and gluteus maximus/medius',
    type: '3d',
    groupName: 'Thigh & Glutes',
    itemIds: [
      'muscle_quadriceps_rectus_femoris',
      'muscle_vastus_lateralis',
      'muscle_vastus_medialis',
      'muscle_vastus_intermedius',
      'muscle_gluteus_maximus',
      'muscle_gluteus_medius',
    ],
    prerequisiteUnitId: 'unit_hand_architecture',
  },
  {
    id: 'unit_leg_hamstrings_calf',
    moduleId: 'leg',
    title: 'Hamstrings & Lower Leg',
    subtitle: 'Biceps femoris, semitendinosus, gastrocnemius, and tibialis anterior',
    type: '3d',
    groupName: 'Hamstrings & Calf',
    itemIds: [
      'muscle_hamstrings_biceps_femoris',
      'muscle_semitendinosus',
      'muscle_semimembranosus',
      'muscle_gastrocnemius',
      'muscle_tibialis_anterior',
    ],
    prerequisiteUnitId: 'unit_leg_quads_glutes',
  },

  // ==========================================
  // MODULE 8: Foot (3D Units)
  // ==========================================
  {
    id: 'unit_foot_landmarks',
    moduleId: 'foot',
    title: 'Foot Architecture & Arches',
    subtitle: 'Calcaneus (heel), tarsals, and metatarsals',
    type: '3d',
    groupName: 'Foot Architecture',
    itemIds: ['bone_calcaneus', 'bone_tarsals', 'bone_metatarsals'],
    prerequisiteUnitId: 'unit_leg_hamstrings_calf',
  },
];

export const TEXT_UNIT_IDS = [
  'unit_terms_planes',
  'unit_terms_locations',
  'unit_terms_movement',
  'unit_terms_naming',
  'unit_terms_joints',
];

export function isGraduatedTo3D(completedUnitIds: string[]): boolean {
  return TEXT_UNIT_IDS.every((id) => completedUnitIds.includes(id));
}

export function getUnitById(id: string): StudyUnit | undefined {
  return STUDY_UNITS.find((u) => u.id === id);
}

export function isUnitUnlocked(unitId: string, completedUnitIds: string[]): boolean {
  const unit = getUnitById(unitId);
  if (!unit) return false;
  if (!unit.prerequisiteUnitId) return true;

  // If this is a 3D unit, ensure all text units are completed first
  if (unit.type === '3d' && !isGraduatedTo3D(completedUnitIds)) {
    return false;
  }

  return completedUnitIds.includes(unit.prerequisiteUnitId);
}
