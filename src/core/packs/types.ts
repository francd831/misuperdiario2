export interface PackTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  [key: string]: string;
}

export interface PackManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  free?: boolean;
  priceStars?: number;
  theme: PackTheme;
  stickers?: string[] | { autoLoad?: boolean; folder?: string };
  frames?: string[] | { autoLoad?: boolean; folder?: string };
  filters?: string[] | { autoLoad?: boolean; folder?: string };
  speechBubbles?: string[] | { autoLoad?: boolean; folder?: string };
  stamps?: string[] | { autoLoad?: boolean; folder?: string };
  masks?: string[] | { autoLoad?: boolean; folder?: string };
  effects?: string[] | { autoLoad?: boolean; folder?: string };
  preview?: string;
}

export interface PackAsset {
  id: string;
  packId: string;
  name: string;
  url: string;
}

export interface PackWithAssets {
  manifest: PackManifest;
  previewUrl?: string;
  stickers: PackAsset[];
  frames: PackAsset[];
  filters: PackAsset[];
  speechBubbles: PackAsset[];
  stamps: PackAsset[];
  masks: PackAsset[];
  effects: PackAsset[];
}

export interface PackEntitlement {
  id: string;
  profileId: string;
  packId: string;
  unlockedAt: string;
  source: "free" | "purchase" | "admin" | "import";
}
