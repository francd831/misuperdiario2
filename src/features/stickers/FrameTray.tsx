import type { PackAsset } from "../../core/packs/types";

interface FrameTrayProps {
  frames: PackAsset[];
  onSelect: (frame: PackAsset) => void;
  onClear?: () => void;
}

export function FrameTray({ frames, onSelect, onClear }: FrameTrayProps) {
  if (frames.length === 0) {
    return (
      <section className="status-panel">
        <h2>Sin marcos</h2>
        <p>El pack activo no tiene marcos disponibles.</p>
      </section>
    );
  }

  return (
    <section className="sticker-tray" aria-label="Marcos del pack activo">
      {onClear && (
        <button type="button" onClick={onClear}>
          Sin marco
        </button>
      )}
      {frames.map((frame) => (
        <button key={`${frame.packId}:${frame.id}`} type="button" onClick={() => onSelect(frame)}>
          <img src={frame.url} alt={frame.name} />
        </button>
      ))}
    </section>
  );
}
