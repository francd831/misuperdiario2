import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { usePack } from "@/core/packs/PackContext";
import { createOverlay, type OverlayItem, type OverlayProject } from "@/core/media/overlays/overlayEngine";
import { Sticker, Frame, Type, Trash2, X } from "lucide-react";

type Tab = "stickers" | "frames" | "backgrounds" | "text" | null;

const DEFAULT_EMOJIS = ["⭐", "❤️", "🎉", "🌈", "🦄", "🎵", "🌟", "🎀", "🔥", "💎", "😂", "🥰"];

const TEXT_FONTS = [
  { label: "Sans", value: "sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "'Courier New', monospace" },
  { label: "Comic", value: "'Comic Sans MS', cursive" },
  { label: "Impact", value: "Impact, sans-serif" },
  { label: "Cursiva", value: "'Brush Script MT', cursive" },
];

const TEXT_SIZES = [16, 20, 24, 32, 40, 56];

const TEXT_COLORS = [
  "#ffffff", "#000000", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4",
];

interface Props {
  selectedId: string | null;
  overlays: OverlayProject;
  onAdd: (item: OverlayItem) => void;
  onChange: (updated: OverlayProject) => void;
  onDelete: () => void;
}

interface DragState {
  type: "sticker" | "frame";
  key: string;
  imgSrc?: string; // URL for visual ghost
  emoji?: string;  // emoji text for ghost
  x: number;
  y: number;
}

function getDropTarget(): HTMLElement | null {
  return document.querySelector("[data-overlay-drop]");
}

function calcDropPosition(clientX: number, clientY: number): { x: number; y: number } | null {
  const el = getDropTarget();
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;
  if (x < 0 || x > 100 || y < 0 || y > 100) return null;
  return { x, y };
}

export function OverlayTray({ selectedId, overlays, onAdd, onChange, onDelete }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(null);
  const { stickers, frames, activePack } = usePack();
  const packId = activePack?.id ?? "base";
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  // Text editor state
  const [textInput, setTextInput] = useState("Texto");
  const [textFont, setTextFont] = useState(TEXT_FONTS[0].value);
  const [textSize, setTextSize] = useState(28);
  const [textColor, setTextColor] = useState("#ffffff");

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
    if (!textInput.trim()) return;
    onAdd(createOverlay("text", { packId, key: "text" }, {
      text: textInput,
      fontSize: textSize,
      textColor,
      fontFamily: textFont,
    }));
  };

  // ─── Drag handling ─────────────────────────────

  const startDrag = useCallback((
    e: React.PointerEvent,
    type: "sticker" | "frame",
    key: string,
    imgSrc?: string,
    emoji?: string,
  ) => {
    e.preventDefault();
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDragging.current = false;
    
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - dragStartPos.current!.x;
      const dy = ev.clientY - dragStartPos.current!.y;
      if (!isDragging.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        isDragging.current = true;
      }
      if (isDragging.current) {
        setDrag({ type, key, imgSrc, emoji, x: ev.clientX, y: ev.clientY });
      }
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);

      if (isDragging.current) {
        const pos = calcDropPosition(ev.clientX, ev.clientY);
        if (pos) {
          if (type === "sticker") {
            onAdd(createOverlay("sticker", { packId, key }, { x: pos.x, y: pos.y }));
          } else {
            onAdd(createOverlay("frame", { packId, key }, { x: pos.x, y: pos.y, scale: 1 }));
          }
        }
        setDrag(null);
      } else {
        // Was a tap, not a drag → add at center
        if (type === "sticker") handleAddSticker(key);
        else if (type === "frame") {
          const idx = parseInt(key.replace("frames/", ""), 10);
          handleAddFrame(idx);
        }
        setDrag(null);
      }
      isDragging.current = false;
      dragStartPos.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [packId, onAdd]);

  return (
    <>
      {/* Drag ghost */}
      {drag && createPortal(
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: drag.x,
            top: drag.y,
            transform: "translate(-50%, -50%) scale(1.2)",
          }}
        >
          {drag.emoji ? (
            <span className="text-4xl drop-shadow-lg">{drag.emoji}</span>
          ) : drag.imgSrc ? (
            <img
              src={drag.imgSrc}
              alt=""
              className="h-14 w-14 object-contain drop-shadow-lg"
            />
          ) : null}
        </div>,
        document.body,
      )}

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

            <div className="max-h-[22vh] overflow-y-auto px-2 py-2">
              {activeTab === "stickers" && (
                <div className="space-y-2">
                  {stickers.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {activePack?.name ?? "Pack"}
                      </p>
                      <div className="grid grid-cols-10 gap-0.5">
                        {stickers.map((url, i) => (
                          <button
                            key={i}
                            onPointerDown={(e) => startDrag(e, "sticker", `stickers/${i}`, url)}
                            className="flex aspect-square items-center justify-center rounded-md bg-secondary/60 hover:bg-secondary active:scale-90 overflow-hidden transition-all duration-150 p-0.5 touch-none select-none"
                          >
                            <img src={url} alt="" className="h-full w-full object-contain pointer-events-none" draggable={false} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Emojis
                    </p>
                    <div className="grid grid-cols-10 gap-1">
                      {DEFAULT_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onPointerDown={(e) => startDrag(e, "sticker", emoji, undefined, emoji)}
                          className="flex aspect-square items-center justify-center rounded-md bg-secondary/60 text-base hover:bg-secondary active:scale-90 transition-all duration-150 touch-none select-none"
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
                    <div className="grid grid-cols-6 gap-1">
                      {frames.map((frame, i) => {
                        const url = typeof frame === "string" ? frame : frame?.file;
                        return (
                          <button
                            key={i}
                            onPointerDown={(e) => startDrag(e, "frame", `frames/${i}`, url)}
                            className="flex aspect-[4/3] items-center justify-center rounded-lg bg-secondary/60 hover:bg-secondary active:scale-95 overflow-hidden transition-all duration-150 p-1.5 touch-none select-none"
                          >
                            <img src={url} alt="" className="h-full w-full object-contain pointer-events-none" draggable={false} />
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
                <div className="space-y-2 py-2">
                  {/* Text input + add button */}
                  <div className="flex gap-1.5 px-1">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Escribe tu texto…"
                      className="flex-1 rounded-lg bg-secondary/80 border border-border/50 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      style={{ fontFamily: textFont }}
                    />
                    <button
                      onClick={handleAddText}
                      disabled={!textInput.trim()}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40"
                    >
                      <Type className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Font picker */}
                  <div className="px-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Fuente</p>
                    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                      {TEXT_FONTS.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setTextFont(f.value)}
                          className={`shrink-0 rounded-md px-2.5 py-1 text-xs transition-all ${
                            textFont === f.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary/60 text-foreground hover:bg-secondary"
                          }`}
                          style={{ fontFamily: f.value }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size picker */}
                  <div className="px-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tamaño</p>
                    <div className="flex gap-1">
                      {TEXT_SIZES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setTextSize(s)}
                          className={`flex-1 rounded-md py-1 text-xs font-medium transition-all ${
                            textSize === s
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary/60 text-foreground hover:bg-secondary"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color picker */}
                  <div className="px-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Color</p>
                    <div className="flex gap-1.5">
                      {TEXT_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setTextColor(c)}
                          className={`h-6 w-6 rounded-full border-2 transition-all ${
                            textColor === c ? "border-primary scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-center">
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
    </>
  );
}
