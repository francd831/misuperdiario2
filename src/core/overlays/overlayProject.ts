import type { FrameOverlay, OverlayProject, PackVisualAssetRef, StickerOverlay, StructuredOverlayProject } from "./types";

function normalizeFrame(frame?: PackVisualAssetRef | FrameOverlay): FrameOverlay | undefined {
  if (!frame) return undefined;
  if ("kind" in frame && frame.kind === "frame") return frame;
  return {
    id: crypto.randomUUID(),
    kind: "frame",
    packId: frame.packId,
    assetId: frame.assetId,
    x: 50,
    y: 50,
    scale: 1,
    rotation: 0,
    zIndex: 100,
  };
}

export function normalizeOverlayProject(project?: OverlayProject): StructuredOverlayProject {
  if (!project) return { stickers: [] };
  if (Array.isArray(project)) return { stickers: project };
  return {
    stickers: project.stickers ?? [],
    frame: normalizeFrame(project.frame),
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
    frame: normalizeFrame(frame),
  };
}

export function updateStickerOverlay(project: OverlayProject | undefined, overlayId: string, patch: Partial<StickerOverlay>) {
  const normalized = normalizeOverlayProject(project);
  return {
    ...normalized,
    stickers: normalized.stickers.map((overlay) => (overlay.id === overlayId ? { ...overlay, ...patch } : overlay)),
  };
}

export function removeStickerOverlay(project: OverlayProject | undefined, overlayId: string) {
  const normalized = normalizeOverlayProject(project);
  return {
    ...normalized,
    stickers: normalized.stickers.filter((overlay) => overlay.id !== overlayId),
  };
}

export function updateFrameOverlay(project: OverlayProject | undefined, patch: Partial<FrameOverlay>) {
  const normalized = normalizeOverlayProject(project);
  if (!normalized.frame) return normalized;
  return {
    ...normalized,
    frame: { ...normalizeFrame(normalized.frame)!, ...patch },
  };
}

export function clearOverlays(): StructuredOverlayProject {
  return { stickers: [] };
}
