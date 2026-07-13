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

export type OverlayProject = StickerOverlay[];
