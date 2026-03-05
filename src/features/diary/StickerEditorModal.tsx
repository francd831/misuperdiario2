import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePack } from "@/core/packs/PackContext";
import { stickerService } from "@/core/media/stickers/stickerService";
import type { StickerOverlay } from "@/core/storage/indexeddb";
import type { ExtendedEntry } from "./types";
import { RotateCw, ZoomIn, Trash2 } from "lucide-react";

interface Props {
  entry: ExtendedEntry;
  /** If provided, renders stickers over this image and allows canvas export */
  photoBlob?: Blob;
  onClose: () => void;
  onSave: (overlays: StickerOverlay[], renderedBlob?: Blob) => void;
}

const DEFAULT_EMOJIS = ["⭐", "❤️", "🎉", "🌈", "🦄", "🎵", "🌟", "🎀", "🔥", "💎"];

export function StickerEditorModal({ entry, photoBlob, onClose, onSave }: Props) {
  const [overlays, setOverlays] = useState<StickerOverlay[]>(entry.stickerOverlays ?? []);
  const [selected, setSelected] = useState<number | null>(null);
  const { stickers } = usePack();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragRef = useRef<{ idx: number; startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Photo preview URL
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  useEffect(() => {
    if (photoBlob) {
      const url = URL.createObjectURL(photoBlob);
      setPhotoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [photoBlob]);

  const updateOverlay = useCallback((idx: number, patch: Partial<StickerOverlay>) => {
    setOverlays(prev => prev.map((o, i) => i === idx ? { ...o, ...patch } : o));
  }, []);

  const addSticker = (stickerId: string) => {
    const newOverlay = stickerService.createOverlay(stickerId, 50, 50, 1, 0);
    setOverlays(prev => [...prev, newOverlay]);
    setSelected(overlays.length);
  };

  const removeSticker = (idx: number) => {
    setOverlays(prev => prev.filter((_, i) => i !== idx));
    setSelected(null);
  };

  // Pointer handlers for drag
  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(idx);
    const rect = canvasRef.current!.getBoundingClientRect();
    dragRef.current = {
      idx,
      startX: e.clientX,
      startY: e.clientY,
      origX: overlays[idx].x,
      origY: overlays[idx].y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    const x = Math.max(0, Math.min(100, dragRef.current.origX + dx));
    const y = Math.max(0, Math.min(100, dragRef.current.origY + dy));
    updateOverlay(dragRef.current.idx, { x, y });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  // Render sticker content (emoji text or pack image URL)
  const renderStickerContent = (stickerId: string) => {
    // If it looks like an emoji (short, no dashes with "pack")
    if (!stickerId.startsWith("pack-sticker-")) {
      return <span className="text-3xl leading-none select-none">{stickerId}</span>;
    }
    // Pack sticker — resolve from context
    const idx = parseInt(stickerId.replace("pack-sticker-", ""), 10);
    const url = stickers[idx];
    if (url) {
      return <img src={url} alt="sticker" className="h-10 w-10 object-contain pointer-events-none" draggable={false} />;
    }
    return <span className="text-3xl leading-none select-none">⭐</span>;
  };

  // Canvas export for photos
  const exportCanvas = useCallback(async (): Promise<Blob | undefined> => {
    if (!photoBlob || !canvasRef.current) return undefined;
    const canvas = document.createElement("canvas");
    const img = new Image();
    const url = URL.createObjectURL(photoBlob);

    return new Promise<Blob | undefined>((resolve) => {
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        // Draw each overlay
        for (const o of overlays) {
          const px = (o.x / 100) * canvas.width;
          const py = (o.y / 100) * canvas.height;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate((o.rotation * Math.PI) / 180);
          ctx.scale(o.scale, o.scale);
          // Draw emoji text
          const fontSize = Math.round(canvas.width * 0.06);
          ctx.font = `${fontSize}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          // For pack stickers we can't easily render images synchronously,
          // so we render the stickerId text (emoji) for now
          if (!o.stickerId.startsWith("pack-sticker-")) {
            ctx.fillText(o.stickerId, 0, 0);
          } else {
            ctx.fillText("⭐", 0, 0);
          }
          ctx.restore();
        }

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          resolve(blob ?? undefined);
        }, "image/jpeg", 0.92);
      };
      img.src = url;
    });
  }, [photoBlob, overlays]);

  const handleSave = async () => {
    let renderedBlob: Blob | undefined;
    if (photoBlob) {
      renderedBlob = await exportCanvas();
    }
    onSave(overlays, renderedBlob);
  };

  const selectedOverlay = selected !== null ? overlays[selected] : null;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle>Editor de stickers</DialogTitle>
        </DialogHeader>

        {/* Canvas area */}
        <div
          ref={canvasRef}
          className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => setSelected(null)}
        >
          {/* Background: photo or neutral */}
          {photoUrl && (
            <img src={photoUrl} alt="preview" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          )}

          {/* Overlay stickers */}
          {overlays.map((o, i) => (
            <div
              key={i}
              className={`absolute cursor-grab active:cursor-grabbing ${selected === i ? "ring-2 ring-primary ring-offset-1 rounded" : ""}`}
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                transform: `translate(-50%, -50%) scale(${o.scale}) rotate(${o.rotation}deg)`,
                zIndex: selected === i ? 50 : 10,
              }}
              onPointerDown={(e) => handlePointerDown(e, i)}
            >
              {renderStickerContent(o.stickerId)}
            </div>
          ))}
        </div>

        {/* Controls for selected sticker */}
        {selectedOverlay && selected !== null && (
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sticker seleccionado</span>
              <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => removeSticker(selected)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
              <Slider
                min={0.3}
                max={3}
                step={0.1}
                value={[selectedOverlay.scale]}
                onValueChange={([v]) => updateOverlay(selected, { scale: v })}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">{selectedOverlay.scale.toFixed(1)}×</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCw className="h-4 w-4 text-muted-foreground shrink-0" />
              <Slider
                min={-180}
                max={180}
                step={5}
                value={[selectedOverlay.rotation]}
                onValueChange={([v]) => updateOverlay(selected, { rotation: v })}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">{selectedOverlay.rotation}°</span>
            </div>
          </div>
        )}

        {/* Pack stickers */}
        {stickers.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Stickers del pack</p>
            <div className="flex flex-wrap gap-2">
              {stickers.map((url, i) => (
                <button
                  key={i}
                  onClick={() => addSticker(`pack-sticker-${i}`)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 overflow-hidden transition-colors"
                >
                  <img src={url} alt="sticker" className="h-8 w-8 object-contain" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Emoji stickers */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Emojis</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addSticker(emoji)}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-xl hover:bg-secondary/80 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Arrastra para mover · Toca para seleccionar · Usa los controles para escalar y rotar</p>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={handleSave}>
            {photoBlob ? "Guardar con stickers" : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
