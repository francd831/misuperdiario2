import type { PackAsset } from "../../core/packs/types";

interface AssetTrayProps {
  label: string;
  emptyTitle: string;
  emptyDescription: string;
  assets: PackAsset[];
  onSelect: (asset: PackAsset) => void;
  onClear?: () => void;
  clearLabel?: string;
}

export function AssetTray({ label, emptyTitle, emptyDescription, assets, onSelect, onClear, clearLabel = "Quitar" }: AssetTrayProps) {
  if (assets.length === 0) {
    return (
      <section className="status-panel">
        <h2>{emptyTitle}</h2>
        <p>{emptyDescription}</p>
      </section>
    );
  }

  return (
    <section className="sticker-tray" aria-label={label}>
      {onClear && (
        <button type="button" onClick={onClear}>
          {clearLabel}
        </button>
      )}
      {assets.map((asset) => (
        <button key={`${asset.packId}:${asset.id}`} type="button" onClick={() => onSelect(asset)}>
          <img src={asset.url} alt={asset.name} />
        </button>
      ))}
    </section>
  );
}
