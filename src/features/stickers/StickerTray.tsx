import type { PackAsset } from "../../core/packs/types";

interface StickerTrayProps {
  stickers: PackAsset[];
  onSelect: (sticker: PackAsset) => void;
}

export function StickerTray({ stickers, onSelect }: StickerTrayProps) {
  if (stickers.length === 0) {
    return (
      <section className="status-panel">
        <h2>Sin stickers</h2>
        <p>El pack activo no tiene stickers disponibles.</p>
      </section>
    );
  }

  return (
    <section className="sticker-tray" aria-label="Stickers del pack activo">
      {stickers.map((sticker) => (
        <button key={`${sticker.packId}:${sticker.id}`} type="button" onClick={() => onSelect(sticker)}>
          <img src={sticker.url} alt={sticker.name} />
        </button>
      ))}
    </section>
  );
}
