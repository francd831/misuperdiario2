import { useState } from "react";
import { usePack } from "@/core/packs/PackContext";
import { createOverlay, type OverlayItem } from "@/core/media/overlays/overlayEngine";
import { Sticker, Frame, ImageIcon, Type, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "stickers" | "frames" | "backgrounds" | "text";

const DEFAULT_EMOJIS = ["⭐", "❤️", "🎉", "🌈", "🦄", "🎵", "🌟", "🎀", "🔥", "💎", "😂", "🥰"];

interface Props {
  selectedId: string | null;
  onAdd: (item: OverlayItem) => void;
  onDelete: () => void;
  /** Whether to start collapsed */
  collapsed?: boolean;
}

export function OverlayTray({ selectedId, onAdd, onDelete, collapsed: initialCollapsed }: Props) {
  const [collapsed, setCollapsed] = useState(initialCollapsed ?? true);
  const [tab, setTab] = useState<Tab>("stickers");
  const { stickers, frames, activePack } = usePack();

  const packId = activePack?.id ?? "base";

  const tabs: { id: Tab; icon: typeof Sticker; label: string }[] = [
    { id: "stickers", icon: Sticker, label: "Stickers" },
    { id: "frames", icon: Frame, label: "Marcos" },
    { id: "backgrounds", icon: ImageIcon, label: "Fondos" },
    { id: "text", icon: Type, label: "Texto" },
  ];

  const handleAddSticker = (key: string) => {
    onAdd(createOverlay("sticker", { packId, key }));
  };

  const handleAddFrame = (idx: number) => {
    onAdd(createOverlay("frame", { packId, key: `frames/${idx}` }, { x: 50, y: 50, scale: 1 }));
  };

  const handleAddText = () => {
    onAdd(createOverlay("text", { packId, key: "text" }, { text: "Texto", fontSize: 28 }));
  };

  return (
    <div className="relative z-30 flex flex-col bg-background/95 backdrop-blur-md border-t border-border rounded-t-2xl transition-all">
      {/* Toggle bar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center gap-2 py-2.5 text-xs text-muted-foreground active:bg-muted/50 transition-colors"
      >
        {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {collapsed ? "Abrir editor" : "Cerrar"}
      </button>

      {!collapsed && (
        <div className="px-3 pb-4 space-y-2">
          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Delete selected */}
          {selectedId && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 w-full"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" /> Eliminar seleccionado
            </Button>
          )}

          {/* Content area – scrollable like a keyboard */}
          <div className="max-h-[35vh] overflow-y-auto">
            {/* Stickers tab */}
            {tab === "stickers" && (
              <div className="space-y-3">
                {stickers.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Pack</p>
                    <div className="grid grid-cols-6 gap-1.5">
                      {stickers.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddSticker(`stickers/${i}`)}
                          className="flex aspect-square items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 overflow-hidden transition-colors"
                        >
                          <img src={url} alt="" className="h-7 w-7 object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Emojis</p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {DEFAULT_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleAddSticker(emoji)}
                        className="flex aspect-square items-center justify-center rounded-lg bg-secondary text-xl hover:bg-secondary/80 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Frames tab */}
            {tab === "frames" && (
              <div>
                {frames.length > 0 ? (
                  <div className="grid grid-cols-4 gap-1.5">
                    {frames.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddFrame(i)}
                        className="flex aspect-square items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 overflow-hidden transition-colors"
                      >
                        <img src={url} alt="" className="h-12 w-12 object-contain" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    Este pack no incluye marcos
                  </p>
                )}
              </div>
            )}

            {/* Backgrounds tab */}
            {tab === "backgrounds" && (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Próximamente – fondos temáticos
              </p>
            )}

            {/* Text tab */}
            {tab === "text" && (
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={handleAddText} className="gap-1.5">
                  <Type className="h-3.5 w-3.5" /> Añadir texto
                </Button>
                <p className="text-[10px] text-muted-foreground">
                  Toca para añadir, luego arrastra y pellizca para editar
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
