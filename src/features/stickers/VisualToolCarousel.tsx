import { Frame, MessageCircle, ScanFace, Sparkles, Stamp, Sticker, WandSparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { PackAsset, PackWithAssets } from "../../core/packs/types";

type ToolId = "stickers" | "frames" | "filters" | "speechBubbles" | "stamps" | "masks" | "effects";

interface VisualToolCarouselProps {
  pack?: PackWithAssets;
  onSticker: (asset: PackAsset) => void;
  onFrame: (asset: PackAsset) => void;
  onFilter: (asset: PackAsset) => void;
  onVisual: (asset: PackAsset, kind: "speechBubbles" | "stamps" | "masks" | "effects") => void;
  onClearFrame: () => void;
  onClearFilter: () => void;
  onClose?: () => void;
}

const tools = [
  { id: "stickers", label: "Stickers", icon: Sticker },
  { id: "frames", label: "Marcos", icon: Frame },
  { id: "filters", label: "Filtros", icon: WandSparkles },
  { id: "speechBubbles", label: "Bocadillos", icon: MessageCircle },
  { id: "stamps", label: "Sellos", icon: Stamp },
  { id: "masks", label: "Máscaras", icon: ScanFace },
  { id: "effects", label: "Efectos", icon: Sparkles },
] satisfies Array<{ id: ToolId; label: string; icon: typeof Sticker }>;

export function VisualToolCarousel(props: VisualToolCarouselProps) {
  const [active, setActive] = useState<ToolId>("stickers");
  const assets = props.pack?.[active] ?? [];

  useEffect(() => {
    if (!props.onClose) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") props.onClose?.();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [props.onClose]);

  function select(asset: PackAsset) {
    if (active === "stickers") props.onSticker(asset);
    else if (active === "frames") props.onFrame(asset);
    else if (active === "filters") props.onFilter(asset);
    else props.onVisual(asset, active);
  }

  return (
    <section className="visual-tools" aria-label="Herramientas de edición visual">
      {props.onClose && (
        <div className="visual-tools__header">
          <strong>Personalizar</strong>
          <button type="button" onClick={props.onClose} aria-label="Cerrar herramientas"><X size={20} /></button>
        </div>
      )}
      <nav className="visual-tools__tabs" aria-label="Tipos de decoración">
        {tools.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" className={active === id ? "is-active" : ""} onClick={() => setActive(id)} aria-pressed={active === id}>
            <Icon size={19} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="visual-tools__assets" aria-label={tools.find((tool) => tool.id === active)?.label}>
        {(active === "frames" || active === "filters") && (
          <button className="visual-tools__clear" type="button" onClick={active === "frames" ? props.onClearFrame : props.onClearFilter}>
            <span>×</span><small>Ninguno</small>
          </button>
        )}
        {assets.map((asset) => (
          <button key={`${asset.packId}:${asset.id}`} type="button" onClick={() => select(asset)} title={asset.name}>
            <img src={asset.url} alt={asset.name} /><small>{asset.name}</small>
          </button>
        ))}
        {assets.length === 0 && <p>No hay recursos en esta categoría.</p>}
      </div>
      <p className="visual-tools__hint">Arrastra para mover · pellizca para ampliar y girar</p>
    </section>
  );
}
