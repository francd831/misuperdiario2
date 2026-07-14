import type { OverlayProject, PackVisualAssetRef, StickerOverlay, StructuredOverlayProject } from "./types";

export function normalizeOverlayProject(project?: OverlayProject): StructuredOverlayProject {
  if (!project) return { stickers: [] };
  if (Array.isArray(project)) return { stickers: project };
  return {
    stickers: project.stickers ?? [],
    frame: project.frame,
    background: project.background,
  };
}

export function addStickerOverlay(project: OverlayProject | undefined, sticker: Pick<StickerOverlay, "packId" | "assetId">) {
  const normalized = normalizeOverlayProject(project);
  return {
    ...normalized,
    stickers: [
      ...normalized.stickers,
      {
        id: crypto.randomUUID(),
        kind: "sticker" as const,
        packId: sticker.packId,
        assetId: sticker.assetId,
        x: 50,
        y: 50,
        scale: 1,
        rotation: 0,
        zIndex: normalized.stickers.length + 1,
      },
    ],
  };
}

export function setFrameOverlay(project: OverlayProject | undefined, frame?: PackVisualAssetRef) {
  return {
    ...normalizeOverlayProject(project),
    frame,
  };
}

export function clearOverlays(): StructuredOverlayProject {
  return { stickers: [] };
}
