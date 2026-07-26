import type { PackSceneBackgrounds } from "./sceneBackgrounds";
import type { PackWithAssets } from "./types";

export interface RemotePackCatalogEntry {
  id: string;
  name: string;
  description: string;
  version: string;
  sizeBytes: number;
  checksumSha256: string;
  manifestUrl: string;
  previewUrl: string;
  archiveUrl: string;
  priceStars?: number;
  free?: boolean;
}

export interface RemotePackCatalog {
  schemaVersion: 1;
  generatedAt: string;
  packs: RemotePackCatalogEntry[];
}

export interface RemoteDistributionManifest {
  schemaVersion: 1;
  id: string;
  name: string;
  description: string;
  version: string;
  minimumAppVersion?: string;
  content: {
    packManifest: string;
    preview: string;
    assetsRoot: string;
    scenes: PackSceneBackgrounds & { home: string };
    profileDoor: string;
    mascotSprite: string;
  };
}

export interface PackRuntimeResources {
  home?: string;
  scenes?: Partial<PackSceneBackgrounds>;
  profileDoor?: string;
  mascotSprite?: string;
}

export interface InstalledRemotePack {
  id: string;
  version: string;
  installedAt: string;
  distribution: RemoteDistributionManifest;
  pack: PackWithAssets;
  resources: PackRuntimeResources;
}

