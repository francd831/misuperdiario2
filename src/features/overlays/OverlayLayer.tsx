import { useRef, useCallback, type ReactNode } from "react";
import type { OverlayItem, OverlayProject } from "@/core/media/overlays/overlayEngine";
import { updateTransform } from "@/core/media/overlays/overlayEngine";
import { usePack } from "@/core/packs/PackContext";
import { packLoader } from "@/core/packs/packLoader";

interface Props {
  overlays: OverlayProject;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (updated: OverlayProject) => void;
  children?: ReactNode; // media element (video/img/camera)
  interactive?: boolean; // default true
  className?: string;
}

/**
 * Renders overlay items on top of media content.
 * Handles single-pointer drag + two-pointer pinch/rotate.
 */
export function OverlayLayer({
  overlays,
  selectedId,
  onSelect,
  onChange,
  children,
  interactive = true,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activePack, stickers, frames } = usePack();

  // ─── Pointer state ────────────────────────────────
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragRef = useRef<{
    id: string;
    origX: number;
    origY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const pinchRef = useRef<{
    id: string;
    initDist: number;
    initScale: number;
    initAngle: number;
    initRot: number;
  } | null>(null);

  const patchOverlay = useCallback(
    (id: string, patch: Partial<OverlayItem["transform"]>) => {
      onChange(overlays.map((o) => (o.id === id ? updateTransform(o, patch) : o)));
    },
    [overlays, onChange],
  );

  // ─── Pointer handlers on individual items ─────────
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, item: OverlayItem) => {
      if (!interactive) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect(item.id);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointersRef.current.size === 1) {
        // single pointer → drag
        dragRef.current = {
          id: item.id,
          origX: item.transform.x,
          origY: item.transform.y,
          startX: e.clientX,
          startY: e.clientY,
        };
        pinchRef.current = null;
      } else if (pointersRef.current.size === 2) {
        // two pointers → pinch+rotate
        dragRef.current = null;
        const pts = Array.from(pointersRef.current.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        pinchRef.current = {
          id: item.id,
          initDist: Math.hypot(dx, dy),
          initScale: item.transform.scale,
          initAngle: Math.atan2(dy, dx),
          initRot: item.transform.rotation,
        };
      }
    },
    [interactive, onSelect],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || !containerRef.current) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (dragRef.current && pointersRef.current.size === 1) {
        const rect = containerRef.current.getBoundingClientRect();
        const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
        const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
        patchOverlay(dragRef.current.id, {
          x: Math.max(0, Math.min(100, dragRef.current.origX + dx)),
          y: Math.max(0, Math.min(100, dragRef.current.origY + dy)),
        });
      }

      if (pinchRef.current && pointersRef.current.size === 2) {
        const pts = Array.from(pointersRef.current.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const scaleRatio = dist / pinchRef.current.initDist;
        const rotDelta = ((angle - pinchRef.current.initAngle) * 180) / Math.PI;
        patchOverlay(pinchRef.current.id, {
          scale: Math.max(0.2, Math.min(5, pinchRef.current.initScale * scaleRatio)),
          rotation: pinchRef.current.initRot + rotDelta,
        });
      }
    },
    [interactive, patchOverlay],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size === 0) {
      dragRef.current = null;
      pinchRef.current = null;
    }
  }, []);

  // ─── Resolve asset to renderable ──────────────────
  const resolveAsset = (item: OverlayItem): ReactNode => {
    const { type, assetRef } = item;

    if (type === "sticker") {
      // Emoji?
      if (!assetRef.key.startsWith("stickers/")) {
        return <span className="text-3xl leading-none select-none">{assetRef.key}</span>;
      }
      const idx = parseInt(assetRef.key.replace("stickers/", ""), 10);
      const url = stickers[idx];
      if (url) return <img src={url} alt="" className="h-10 w-10 object-contain" draggable={false} />;
      return <span className="text-3xl leading-none select-none">⭐</span>;
    }

    if (type === "frame") {
      const idx = parseInt(assetRef.key.replace("frames/", ""), 10);
      const url = frames[idx];
      if (url) return <img src={url} alt="" className="h-full w-full object-contain" draggable={false} />;
      return null;
    }

    if (type === "text") {
      return (
        <span
          className="select-none font-bold whitespace-nowrap drop-shadow-md"
          style={{ color: item.textColor, fontSize: `${item.fontSize ?? 24}px` }}
        >
          {item.text || "Texto"}
        </span>
      );
    }

    // background – rendered as img covering area
    if (type === "background") {
      const url = activePack ? packLoader.getPackAssetUrl(activePack.id, assetRef.key) : undefined;
      if (url) return <img src={url} alt="" className="h-full w-full object-cover" draggable={false} />;
      return null;
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden touch-none ${className}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={() => interactive && onSelect(null)}
    >
      {/* Media content */}
      {children}

      {/* Frame overlay (always full-size, behind stickers) */}
      {overlays
        .filter((o) => o.type === "frame")
        .map((item) => (
          <div
            key={item.id}
            className={`absolute inset-0 pointer-events-none z-[5] ${
              interactive && selectedId === item.id ? "ring-2 ring-primary/50 rounded" : ""
            }`}
            style={{ pointerEvents: interactive ? "auto" : "none" }}
            onPointerDown={(e) => handlePointerDown(e, item)}
          >
            {resolveAsset(item)}
          </div>
        ))}

      {/* Background overlay (behind everything) */}
      {overlays
        .filter((o) => o.type === "background")
        .map((item) => (
          <div
            key={item.id}
            className="absolute inset-0 z-[1]"
            style={{ pointerEvents: interactive ? "auto" : "none" }}
            onPointerDown={(e) => handlePointerDown(e, item)}
          >
            {resolveAsset(item)}
          </div>
        ))}

      {/* Sticker & text overlays */}
      {overlays
        .filter((o) => o.type === "sticker" || o.type === "text")
        .map((item) => (
          <div
            key={item.id}
            className={`absolute cursor-grab active:cursor-grabbing transition-shadow ${
              interactive && selectedId === item.id
                ? "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                : ""
            }`}
            style={{
              left: `${item.transform.x}%`,
              top: `${item.transform.y}%`,
              transform: `translate(-50%, -50%) scale(${item.transform.scale}) rotate(${item.transform.rotation}deg)`,
              zIndex: item.zIndex + (selectedId === item.id ? 100 : 0),
              pointerEvents: interactive ? "auto" : "none",
            }}
            onPointerDown={(e) => handlePointerDown(e, item)}
          >
            {resolveAsset(item)}
          </div>
        ))}
    </div>
  );
}
