import { useState } from "react";
import { usePack } from "@/core/packs/PackContext";
import { createOverlay, type OverlayItem, type OverlayProject } from "@/core/media/overlays/overlayEngine";
import { Sticker, Frame, Type, Trash2, X } from "lucide-react";

type Tab = "stickers" | "frames" | "backgrounds" | "text" | null;

const DEFAULT_EMOJIS = ["⭐", "❤️", "🎉", "🌈", "🦄", "🎵", "🌟", "🎀", "🔥", "💎", "😂", "🥰"];

interface Props {
  selectedId: string | null;
  overlays: OverlayProject;
  onAdd: (item: OverlayItem) => void;
  onChange: (updated: OverlayProject) => void;
  onDelete: () => void;
}

export function OverlayTray({ selectedId, overlays, onAdd, onChange, onDelete }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(null);
  const { stickers, frames, activePack } = usePack();
  const packId = activePack?.id ?? "base";

  

  const tools = [
    { id: "stickers" as const, icon: Sticker, label: "Stickers" },
    { id: "frames" as const, icon: Frame, label: "Marcos" },
    { id: "text" as const, icon: Type, label: "Texto" },
  ];

  const toggleTab = (id: Tab) => setActiveTab((prev) => (prev === id ? null : id));

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
    <div className="relative z-30 flex flex-col">
      {/* Expanded panel - slides up from toolbar */}
      {activeTab && (
        <div className="bg-card/95 backdrop-blur-xl border-t border-border animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
            <span className="text-sm font-semibold text-foreground">
              {tools.find((t) => t.id === activeTab)?.label ?? ""}
            </span>
            <button
              onClick={() => setActiveTab(null)}
              className="rounded-full p-1 hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="max-h-[32vh] overflow-y-auto px-3 py-3">
            {activeTab === "stickers" && (
              <div className="space-y-3">
                {stickers.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {activePack?.name ?? "Pack"}
                    </p>
                    <div className="grid grid-cols-6 gap-1.5">
                      {stickers.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddSticker(`stickers/${i}`)}
                          className="flex aspect-square items-center justify-center rounded-lg bg-secondary/60 hover:bg-secondary active:scale-90 overflow-hidden transition-all duration-150 p-1"
                        >
                          <img src={url} alt="" className="h-full w-full object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Emojis
                  </p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {DEFAULT_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleAddSticker(emoji)}
                        className="flex aspect-square items-center justify-center rounded-lg bg-secondary/60 text-xl hover:bg-secondary active:scale-90 transition-all duration-150"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "frames" && (
              <div>
                {frames.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {frames.map((frame, i) => {
                      const url = typeof frame === "string" ? frame : frame?.file;
                      return (
                        <button
                          key={i}
                          onClick={() => handleAddFrame(i)}
                          className="flex aspect-[4/3] items-center justify-center rounded-xl bg-secondary/60 hover:bg-secondary active:scale-95 overflow-hidden transition-all duration-150 p-2"
                        >
                          <img src={url} alt="" className="h-full w-full object-contain" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    Este pack no incluye marcos
                  </p>
                )}
              </div>
            )}

            {activeTab === "text" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <button
                  onClick={handleAddText}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all duration-150"
                >
                  <Type className="h-4 w-4" />
                  Añadir texto
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  Arrastra y pellizca para mover, escalar y rotar
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Always-visible toolbar */}
      <div className="flex items-center justify-around bg-card/95 backdrop-blur-xl border-t border-border px-2 py-1.5">
        {tools.map((tool) => {
          const isActive = activeTab === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => toggleTab(tool.id)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 transition-all duration-150 ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tool.icon className={`h-5 w-5 transition-transform duration-150 ${isActive ? "scale-110" : ""}`} />
              <span className="text-[10px] font-medium">{tool.label}</span>
            </button>
          );
        })}

        {selectedId && (
          <button
            onClick={onDelete}
            className="flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-destructive hover:bg-destructive/10 transition-all duration-150 animate-in fade-in zoom-in-90 duration-150"
          >
            <Trash2 className="h-5 w-5" />
            <span className="text-[10px] font-medium">Borrar</span>
          </button>
        )}
      </div>
    </div>
  );
}
