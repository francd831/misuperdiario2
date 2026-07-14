import type { PackAsset } from "../../core/packs/types";
import { AssetTray } from "./AssetTray";

interface FrameTrayProps {
  frames: PackAsset[];
  onSelect: (frame: PackAsset) => void;
  onClear?: () => void;
}

export function FrameTray({ frames, onSelect, onClear }: FrameTrayProps) {
  return (
    <AssetTray
      label="Marcos del pack activo"
      emptyTitle="Sin marcos"
      emptyDescription="El pack activo no tiene marcos disponibles."
      assets={frames}
      onSelect={onSelect}
      onClear={onClear}
      clearLabel="Sin marco"
    />
  );
}
