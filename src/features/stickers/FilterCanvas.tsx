import { normalizeOverlayProject } from "../../core/overlays/overlayProject";
import type { OverlayProject } from "../../core/overlays/types";
import type { PackWithAssets } from "../../core/packs/types";

interface FilterCanvasProps {
  overlays?: OverlayProject;
  packs: PackWithAssets[];
}

export function FilterCanvas({ overlays, packs }: FilterCanvasProps) {
  const filter = normalizeOverlayProject(overlays).filter;
  if (!filter) return null;

  const asset = packs.find((pack) => pack.manifest.id === filter.packId)?.filters.find((item) => item.id === filter.assetId);
  if (!asset) return null;

  return (
    <img
      aria-hidden="true"
      alt=""
      src={asset.url}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: 0.45,
        mixBlendMode: "soft-light",
        pointerEvents: "none",
      }}
    />
  );
}
