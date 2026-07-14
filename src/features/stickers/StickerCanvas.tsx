import type { OverlayProject, StickerOverlay } from "../../core/overlays/types";
import { normalizeOverlayProject } from "../../core/overlays/overlayProject";
import type { PackWithAssets } from "../../core/packs/types";
import { OverlayControls } from "./OverlayControls";

interface StickerCanvasProps {
  overlays: OverlayProject;
  packs: PackWithAssets[];
  editable?: boolean;
  selectedId?: string;
  onSelect?: (overlayId: string) => void;
  onUpdate?: (overlayId: string, patch: Partial<StickerOverlay>) => void;
  onRemove?: (overlayId: string) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function StickerCanvas({ overlays, packs, editable = false, selectedId, onSelect, onUpdate, onRemove }: StickerCanvasProps) {
  const stickers = normalizeOverlayProject(overlays).stickers;
  if (stickers.length === 0) return null;

  function resolveSticker(packId: string, assetId: string) {
    return packs.find((pack) => pack.manifest.id === packId)?.stickers.find((sticker) => sticker.id === assetId);
  }

  return (
    <div className="sticker-canvas" aria-hidden={!editable} style={{ pointerEvents: editable ? "auto" : undefined }}>
      {stickers.map((overlay) => {
        const sticker = resolveSticker(overlay.packId, overlay.assetId);
        if (!sticker) return null;
        const selected = editable && selectedId === overlay.id;
        const transform = `translate(-50%, -50%) scale(${overlay.scale}) rotate(${overlay.rotation}deg)`;

        function updateSticker(patch: Partial<StickerOverlay>) {
          onUpdate?.(overlay.id, patch);
        }

        return (
          <span
            key={overlay.id}
            style={{
              position: "absolute",
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              transform,
              zIndex: overlay.zIndex,
              outline: selected ? "3px solid rgba(255,255,255,0.95)" : undefined,
              borderRadius: selected ? 12 : undefined,
              pointerEvents: editable ? "auto" : "none",
            }}
          >
            <button
              type="button"
              aria-label={`Editar sticker ${sticker.name}`}
              onClick={() => onSelect?.(overlay.id)}
              style={{
                all: "unset",
                cursor: editable ? "pointer" : "default",
                display: "block",
              }}
            >
              <img src={sticker.url} alt="" style={{ display: "block", position: "static" }} />
            </button>
            {selected && (
              <OverlayControls
                label={`Controles de ${sticker.name}`}
                onMove={(deltaX, deltaY) =>
                  updateSticker({
                    x: clamp(overlay.x + deltaX, 0, 100),
                    y: clamp(overlay.y + deltaY, 0, 100),
                  })
                }
                onRotate={(delta) => updateSticker({ rotation: overlay.rotation + delta })}
                onScale={(delta) => updateSticker({ scale: clamp(Number((overlay.scale + delta).toFixed(2)), 0.2, 3) })}
                onRemove={() => onRemove?.(overlay.id)}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
