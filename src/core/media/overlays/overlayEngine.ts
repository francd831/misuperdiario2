/**
 * Overlay Engine – unified model & helpers for stickers, frames, backgrounds, text.
 */

export type OverlayType = "sticker" | "frame" | "background" | "text" | "effect";

export interface OverlayAssetRef {
  packId: string;
  key: string; // e.g. "stickers/3", "frames/border-gold", emoji literal for emoji stickers
}

export interface OverlayTransform {
  x: number; // % from left
  y: number; // % from top
  scale: number;
  rotation: number; // degrees
}

export interface OverlayItem {
  id: string;
  type: OverlayType;
  assetRef: OverlayAssetRef;
  transform: OverlayTransform;
  zIndex: number;
  /** For text overlays */
  text?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  /** Video-only: time range (seconds). Undefined = full clip */
  startTime?: number;
  endTime?: number;
}

/** Convenience: the persisted array for an entry/photo */
export type OverlayProject = OverlayItem[];

// ─── Helpers ───────────────────────────────────────────

let _counter = 0;
function uid(): string {
  return `ov-${Date.now()}-${++_counter}`;
}

export function createOverlay(
  type: OverlayType,
  assetRef: OverlayAssetRef,
  partial?: Partial<OverlayTransform & { zIndex: number; text: string; textColor: string; fontSize: number; fontFamily: string }>,
): OverlayItem {
  return {
    id: uid(),
    type,
    assetRef,
    transform: {
      x: partial?.x ?? 50,
      y: partial?.y ?? 50,
      scale: partial?.scale ?? 1,
      rotation: partial?.rotation ?? 0,
    },
    zIndex: partial?.zIndex ?? 10,
    text: partial?.text,
    textColor: partial?.textColor ?? "#ffffff",
    fontSize: partial?.fontSize ?? 24,
    fontFamily: partial?.fontFamily ?? "sans-serif",
  };
}

export function updateTransform(
  item: OverlayItem,
  patch: Partial<OverlayTransform>,
): OverlayItem {
  return { ...item, transform: { ...item.transform, ...patch } };
}

export function removeById(project: OverlayProject, id: string): OverlayProject {
  return project.filter((o) => o.id !== id);
}

/** Convert legacy StickerOverlay[] → OverlayProject */
export function migrateLegacyOverlays(
  legacy: Array<{ stickerId: string; x: number; y: number; scale: number; rotation: number }>,
  packId: string,
): OverlayProject {
  return legacy.map((s) => {
    const isPackSticker = s.stickerId.startsWith("pack-sticker-");
    const key = isPackSticker ? `stickers/${s.stickerId.replace("pack-sticker-", "")}` : s.stickerId;
    return createOverlay("sticker", { packId, key }, {
      x: s.x,
      y: s.y,
      scale: s.scale,
      rotation: s.rotation,
    });
  });
}
