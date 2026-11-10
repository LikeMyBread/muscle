import { bone, muscle } from '../nodeHelpers';

export const legNodes = [
  bone('bone_patella', 'Patella', 'leg', 'egg', {
    layout: { position: [0.28, 0.48, 0.08], scale: [0.08, 0.06, 0.04] },
    subcutaneousLandmarks: ['Patella'],
    cameraPresetKey: 'knee',
  }),
  muscle('muscle_quadriceps_rectus_femoris', 'Rectus femoris', 'leg', 0, 'egg', {
    originBoneId: 'bone_pelvis',
    insertionBoneId: 'bone_patella',
    layout: { position: [0.27, 0.65, 0.08], scale: [0.14, 0.35, 0.14] },
    cameraPresetKey: 'leg',
  }),
  muscle('muscle_vastus_lateralis', 'Vastus lateralis', 'leg', 0, 'egg', {
    layout: { position: [0.32, 0.62, 0.02], scale: [0.12, 0.32, 0.13] },
    cameraPresetKey: 'leg',
  }),
  muscle('muscle_hamstrings_biceps_femoris', 'Biceps femoris', 'leg', 0, 'egg', {
    layout: { position: [0.28, 0.62, -0.06], scale: [0.13, 0.33, 0.12] },
    cameraPresetKey: 'leg',
  }),
  muscle('muscle_gastrocnemius', 'Gastrocnemius', 'leg', 0, 'egg', {
    layout: { position: [0.26, 0.35, -0.06], scale: [0.14, 0.22, 0.12] },
    cameraPresetKey: 'leg',
  }),
  muscle('muscle_tibialis_anterior', 'Tibialis anterior', 'leg', 0, 'egg', {
    layout: { position: [0.27, 0.25, 0.06], scale: [0.1, 0.25, 0.08] },
    cameraPresetKey: 'leg',
  }),
];
