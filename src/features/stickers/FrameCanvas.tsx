import { normalizeOverlayProject } from "../../core/overlays/overlayProject";
import type { OverlayProject } from "../../core/overlays/types";
import type { PackWithAssets } from "../../core/packs/types";

interface FrameCanvasProps {
  overlays?: OverlayProject;
  packs: PackWithAssets[];
}

export function FrameCanvas({ overlays, packs }: FrameCanvasProps) {
  const frame = normalizeOverlayProject(overlays).frame;
  if (!frame) return null;

  const asset = packs.find((pack) => pack.manifest.id === frame.packId)?.frames.find((item) => item.id === frame.assetId);
  if (!asset) return null;

  return (
    <img
      aria-hidden="true"
      alt=""
      src={asset.url}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        pointerEvents: "none",
      }}
    />
  );
}
