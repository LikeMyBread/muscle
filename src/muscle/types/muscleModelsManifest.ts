import manifestJson from '../models/manifest.json';

export type MuscleManifestMesh = {
  nodeId: string;
  triangleCount?: number;
};

export type MuscleManifestRegion = {
  source?: string;
  procedural?: boolean;
  glbUrl: string;
  meshes?: MuscleManifestMesh[];
};

export type MuscleModelsManifest = {
  version: number;
  license?: string;
  source?: string;
  sourceUrl?: string;
  attribution?: string;
  /** Content hash of committed GLBs — appended to loader URLs for cache busting. */
  assetRevision?: string;
  regions: Record<string, MuscleManifestRegion>;
};

export const muscleModelsManifest = manifestJson as MuscleModelsManifest;
