export interface StickerOverlay {
  id: string;
  kind: "sticker";
  packId: string;
  assetId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

export interface PackVisualAssetRef {
  packId: string;
  assetId: string;
}

export interface StructuredOverlayProject {
  stickers: StickerOverlay[];
  frame?: PackVisualAssetRef;
  background?: PackVisualAssetRef;
}

export type OverlayProject = StickerOverlay[] | StructuredOverlayProject;
