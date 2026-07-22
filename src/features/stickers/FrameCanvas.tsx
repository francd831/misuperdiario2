import { normalizeOverlayProject } from "../../core/overlays/overlayProject";
import type { FrameOverlay, OverlayProject } from "../../core/overlays/types";
import type { PackWithAssets } from "../../core/packs/types";
import { OverlayControls } from "./OverlayControls";
import { useOverlayGestures } from "./useOverlayGestures";

interface FrameCanvasProps {
  overlays?: OverlayProject;
  packs: PackWithAssets[];
  editable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onUpdate?: (patch: Partial<FrameOverlay>) => void;
  onRemove?: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function FrameCanvas({ overlays, packs, editable = false, selected = false, onSelect, onUpdate, onRemove }: FrameCanvasProps) {
  const frame = normalizeOverlayProject(overlays).frame;
  const gestures = useOverlayGestures({
    x: frame?.x ?? 50,
    y: frame?.y ?? 50,
    scale: frame?.scale ?? 1,
    rotation: frame?.rotation ?? 0,
    minScale: .5, maxScale: 2, onSelect, onUpdate: (patch) => onUpdate?.(patch),
  });
  if (!frame) return null;

  const asset = packs.find((pack) => pack.manifest.id === frame.packId)?.frames.find((item) => item.id === frame.assetId);
  if (!asset) return null;

  return (
    <span
      {...(editable ? gestures : {})}
      aria-hidden={!editable}
      style={{
        position: "absolute",
        left: `${frame.x}%`,
        top: `${frame.y}%`,
        transform: `translate(-50%, -50%) scale(${frame.scale}) rotate(${frame.rotation}deg)`,
        zIndex: frame.zIndex,
        width: "100%",
        height: "100%",
        pointerEvents: editable && selected ? "auto" : "none",
        touchAction: "none",
        cursor: editable ? "grab" : "default",
        outline: selected ? "3px solid rgba(255,255,255,0.95)" : undefined,
        borderRadius: selected ? 14 : undefined,
      }}
    >
      <button
        type="button"
        aria-label={`Editar marco ${asset.name}`}
        onClick={onSelect}
        style={{
          all: "unset",
          cursor: editable && selected ? "pointer" : "default",
          display: "block",
          width: "100%",
          height: "100%",
        }}
      >
        <img
          alt=""
          src={asset.url}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            pointerEvents: "none",
          }}
        />
      </button>
      {editable && selected && (
        <OverlayControls
          label={`Controles de ${asset.name}`}
          onMove={(deltaX, deltaY) =>
            onUpdate?.({
              x: clamp(frame.x + deltaX, 0, 100),
              y: clamp(frame.y + deltaY, 0, 100),
            })
          }
          onRotate={(delta) => onUpdate?.({ rotation: frame.rotation + delta })}
          onScale={(delta) => onUpdate?.({ scale: clamp(Number((frame.scale + delta).toFixed(2)), 0.5, 2) })}
          onRemove={() => onRemove?.()}
        />
      )}
    </span>
  );
}
