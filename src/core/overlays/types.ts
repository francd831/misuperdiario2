import type { PackAssetKind } from "../packs/types";

export interface StickerOverlay {
  id: string;
  kind: "sticker";
  assetKind?: PackAssetKind;
  packId: string;
  assetId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

export interface FrameOverlay {
  id: string;
  kind: "frame";
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
  assetKind?: PackAssetKind;
}

export interface StructuredOverlayProject {
  stickers: StickerOverlay[];
  frame?: PackVisualAssetRef | FrameOverlay;
  filter?: PackVisualAssetRef;
  background?: PackVisualAssetRef;
}

export type OverlayProject = StickerOverlay[] | StructuredOverlayProject;
