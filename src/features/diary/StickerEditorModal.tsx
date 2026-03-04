import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { stickerService, type StickerConfig } from "@/core/media/stickers/stickerService";
import type { StickerOverlay } from "@/core/storage/indexeddb";
import type { ExtendedEntry } from "./types";

interface Props {
  entry: ExtendedEntry;
  onClose: () => void;
  onSave: (overlays: StickerOverlay[]) => void;
}

export function StickerEditorModal({ entry, onClose, onSave }: Props) {
  const [overlays, setOverlays] = useState<StickerOverlay[]>(entry.stickerOverlays ?? []);
  const [stickers, setStickers] = useState<StickerConfig[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);

  useEffect(() => {
    stickerService.getAvailableStickers().then(setStickers);
  }, []);

  const addSticker = (stickerId: string) => {
    setOverlays((prev) => [
      ...prev,
      stickerService.createOverlay(stickerId, 50, 50, 1, 0),
    ]);
  };

  const removeSticker = (index: number) => {
    setOverlays((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging == null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOverlays((prev) =>
      prev.map((o, i) => (i === dragging ? { ...o, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : o))
    );
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editor de stickers</DialogTitle>
        </DialogHeader>

        {/* Canvas */}
        <div
          className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted"
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDragging(null)}
        >
          {overlays.map((o, i) => (
            <div
              key={i}
              className="absolute cursor-grab select-none text-3xl active:cursor-grabbing"
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                transform: `translate(-50%, -50%) scale(${o.scale}) rotate(${o.rotation}deg)`,
              }}
              onPointerDown={(e) => { e.preventDefault(); setDragging(i); }}
              onDoubleClick={() => removeSticker(i)}
            >
              ⭐
            </div>
          ))}
        </div>

        {/* Sticker picker */}
        <div className="flex flex-wrap gap-2">
          {stickers.length > 0 ? (
            stickers.map((s) => (
              <button
                key={s.stickerId}
                onClick={() => addSticker(s.stickerId)}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-2xl hover:bg-secondary/80"
              >
                ⭐
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No hay stickers disponibles en este pack</p>
          )}
          {/* Default stickers */}
          {["⭐", "❤️", "🎉", "🌈", "🦄", "🎵"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => addSticker(emoji)}
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-2xl hover:bg-secondary/80"
            >
              {emoji}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">Arrastra para mover · Doble toque para eliminar</p>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={() => onSave(overlays)}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
