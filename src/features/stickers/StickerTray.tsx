import type { PackAsset } from "../../core/packs/types";
import { AssetTray } from "./AssetTray";

interface StickerTrayProps {
  stickers: PackAsset[];
  onSelect: (sticker: PackAsset) => void;
}

export function StickerTray({ stickers, onSelect }: StickerTrayProps) {
  return (
    <AssetTray
      label="Stickers del pack activo"
      emptyTitle="Sin stickers"
      emptyDescription="El pack activo no tiene stickers disponibles."
      assets={stickers}
      onSelect={onSelect}
    />
  );
}
