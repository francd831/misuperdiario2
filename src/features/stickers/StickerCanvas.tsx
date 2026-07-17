import type { OverlayProject, StickerOverlay } from "../../core/overlays/types";
import { normalizeOverlayProject } from "../../core/overlays/overlayProject";
import type { PackAsset, PackAssetKind, PackWithAssets } from "../../core/packs/types";
import { OverlayControls } from "./OverlayControls";
import { useOverlayGestures } from "./useOverlayGestures";

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

interface EditableStickerProps {
  overlay: StickerOverlay;
  asset: PackAsset;
  editable: boolean;
  selected: boolean;
  onSelect?: (overlayId: string) => void;
  onUpdate?: (overlayId: string, patch: Partial<StickerOverlay>) => void;
  onRemove?: (overlayId: string) => void;
}

function EditableSticker({ overlay, asset, editable, selected, onSelect, onUpdate, onRemove }: EditableStickerProps) {
  const updateSticker = (patch: Partial<StickerOverlay>) => onUpdate?.(overlay.id, patch);
  const gestures = useOverlayGestures({
    x: overlay.x,
    y: overlay.y,
    scale: overlay.scale,
    rotation: overlay.rotation,
    minScale: .2,
    maxScale: 3,
    onSelect: () => onSelect?.(overlay.id),
    onUpdate: updateSticker,
  });

  return (
    <span
      {...(editable ? gestures : {})}
      style={{
        position: "absolute",
        left: `${overlay.x}%`,
        top: `${overlay.y}%`,
        transform: `translate(-50%, -50%) scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
        zIndex: overlay.zIndex,
        outline: selected ? "3px solid rgba(255,255,255,0.95)" : undefined,
        borderRadius: selected ? 12 : undefined,
        pointerEvents: editable ? "auto" : "none",
        touchAction: "none",
        cursor: editable ? "grab" : "default",
        userSelect: "none",
      }}
    >
      <button type="button" aria-label={`Editar elemento ${asset.name}`} onClick={() => onSelect?.(overlay.id)} style={{ all: "unset", cursor: "inherit", display: "block" }}>
        <img src={asset.url} alt="" draggable={false} style={{ display: "block", position: "static", pointerEvents: "none" }} />
      </button>
      {selected && (
        <OverlayControls
          label={`Controles de ${asset.name}`}
          onMove={(deltaX, deltaY) => updateSticker({ x: clamp(overlay.x + deltaX, 0, 100), y: clamp(overlay.y + deltaY, 0, 100) })}
          onRotate={(delta) => updateSticker({ rotation: overlay.rotation + delta })}
          onScale={(delta) => updateSticker({ scale: clamp(Number((overlay.scale + delta).toFixed(2)), .2, 3) })}
          onRemove={() => onRemove?.(overlay.id)}
        />
      )}
    </span>
  );
}

export function StickerCanvas({ overlays, packs, editable = false, selectedId, onSelect, onUpdate, onRemove }: StickerCanvasProps) {
  const stickers = normalizeOverlayProject(overlays).stickers;
  if (stickers.length === 0) return null;

  function resolveAsset(packId: string, assetId: string, assetKind: PackAssetKind = "stickers"): PackAsset | undefined {
    const pack = packs.find((item) => item.manifest.id === packId);
    if (!pack) return undefined;
    return pack[assetKind].find((asset) => asset.id === assetId) ?? pack.stickers.find((asset) => asset.id === assetId);
  }

  return (
    <div className="sticker-canvas" aria-hidden={!editable} style={{ pointerEvents: editable ? "auto" : undefined }}>
      {stickers.map((overlay) => {
        const asset = resolveAsset(overlay.packId, overlay.assetId, overlay.assetKind);
        if (!asset) return null;
        const selected = editable && selectedId === overlay.id;
        return (
          <EditableSticker
            key={overlay.id}
            overlay={overlay} asset={asset} editable={editable} selected={selected}
            onSelect={onSelect} onUpdate={onUpdate} onRemove={onRemove}
          />
        );
      })}
    </div>
  );
}
