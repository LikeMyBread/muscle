import type { AnatomyGroupLayout } from '../components/canvas/AnatomyHalfGroup';

export type AnatomyStageBounds = {
  min: [number, number, number];
  max: [number, number, number];
};

/** Staged anatomy volume in world space — orbit target, group layout, and fitted bounds. */
export type AnatomyStageFrame = {
  center: [number, number, number];
  layout: AnatomyGroupLayout;
  bounds: AnatomyStageBounds;
};

export const DEFAULT_ANATOMY_STAGE_FRAME: AnatomyStageFrame = {
  center: [0.22, 0.875, 0],
  layout: { position: [0.1824, 0.0656, -0.0035], scale: 0.9877 },
  bounds: { min: [0, 0, -0.22], max: [0.44, 1.75, 0.22] },
};
