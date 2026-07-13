import type { OverlayProject } from "../../core/overlays/types";
import type { PackWithAssets } from "../../core/packs/types";

interface StickerCanvasProps {
  overlays: OverlayProject;
  packs: PackWithAssets[];
}

export function StickerCanvas({ overlays, packs }: StickerCanvasProps) {
  if (overlays.length === 0) return null;

  function resolveSticker(packId: string, assetId: string) {
    return packs.find((pack) => pack.manifest.id === packId)?.stickers.find((sticker) => sticker.id === assetId);
  }

  return (
    <div className="sticker-canvas" aria-hidden="true">
      {overlays.map((overlay) => {
        const sticker = resolveSticker(overlay.packId, overlay.assetId);
        if (!sticker) return null;
        return (
          <img
            key={overlay.id}
            src={sticker.url}
            alt=""
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              transform: `translate(-50%, -50%) scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
              zIndex: overlay.zIndex,
            }}
          />
        );
      })}
    </div>
  );
}
