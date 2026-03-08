import { useRef, useCallback, type ReactNode } from "react";
import type { OverlayItem, OverlayProject } from "@/core/media/overlays/overlayEngine";
import { updateTransform } from "@/core/media/overlays/overlayEngine";
import { usePack } from "@/core/packs/PackContext";
import { packLoader } from "@/core/packs/packLoader";
import { parseAnimatedKey, AnimatedSticker } from "@/features/stickers/AnimatedSticker";
import { parseAnimatedFrameKey, AnimatedFrame } from "@/features/frames/AnimatedFrame";

interface Props {
  overlays: OverlayProject;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (updated: OverlayProject) => void;
  children?: ReactNode;
  interactive?: boolean;
  className?: string;
}

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

  // All pointer state tracked at container level to support multi-touch
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const activeIdRef = useRef<string | null>(null);
  const didDragRef = useRef(false);
  const dragRef = useRef<{
    origX: number;
    origY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const pinchRef = useRef<{
    initDist: number;
    initScale: number;
    initAngle: number;
    initRot: number;
  } | null>(null);

  const getItem = useCallback(
    (id: string | null) => (id ? overlays.find((o) => o.id === id) : undefined),
    [overlays],
  );

  const patchOverlay = useCallback(
    (id: string, patch: Partial<OverlayItem["transform"]>) => {
      onChange(overlays.map((o) => (o.id === id ? updateTransform(o, patch) : o)));
    },
    [overlays, onChange],
  );

  // Initiate pinch from current two pointers
  const initPinch = useCallback(() => {
    const item = getItem(activeIdRef.current);
    if (!item || pointersRef.current.size < 2) return;
    const pts = Array.from(pointersRef.current.values());
    const dx = pts[1].x - pts[0].x;
    const dy = pts[1].y - pts[0].y;
    pinchRef.current = {
      initDist: Math.hypot(dx, dy) || 1,
      initScale: item.transform.scale,
      initAngle: Math.atan2(dy, dx),
      initRot: item.transform.rotation,
    };
    dragRef.current = null;
  }, [getItem]);

  // Called when a sticker/text element is touched
  const handleItemPointerDown = useCallback(
    (e: React.PointerEvent, item: OverlayItem) => {
      if (!interactive) return;
      e.preventDefault();
      e.stopPropagation();

      onSelect(item.id);
      activeIdRef.current = item.id;
      didDragRef.current = false;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);

      if (pointersRef.current.size === 1) {
        dragRef.current = {
          origX: item.transform.x,
          origY: item.transform.y,
          startX: e.clientX,
          startY: e.clientY,
        };
        pinchRef.current = null;
      } else if (pointersRef.current.size === 2) {
        initPinch();
      }
    },
    [interactive, onSelect, initPinch],
  );

  // Container-level pointer down captures second finger even if it lands outside the sticker
  const handleContainerPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive) return;
      // Only track if we already have an active overlay (first finger is on it)
      if (activeIdRef.current && pointersRef.current.size >= 1) {
        e.preventDefault();
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointersRef.current.size === 2) {
          initPinch();
        }
      }
    },
    [interactive, initPinch],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || !containerRef.current || !activeIdRef.current) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (dragRef.current && pointersRef.current.size === 1) {
        const rect = containerRef.current.getBoundingClientRect();
        const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
        const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) didDragRef.current = true;
        patchOverlay(activeIdRef.current, {
          x: Math.max(0, Math.min(100, dragRef.current.origX + dx)),
          y: Math.max(0, Math.min(100, dragRef.current.origY + dy)),
        });
      }

      if (pinchRef.current && pointersRef.current.size === 2) {
        didDragRef.current = true;
        const pts = Array.from(pointersRef.current.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const scaleRatio = dist / pinchRef.current.initDist;
        const rotDelta = ((angle - pinchRef.current.initAngle) * 180) / Math.PI;
        patchOverlay(activeIdRef.current, {
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
      activeIdRef.current = null;
    } else if (pointersRef.current.size === 1 && activeIdRef.current) {
      // Went from 2 fingers back to 1 → resume drag from current position
      const item = overlays.find((o) => o.id === activeIdRef.current);
      if (item) {
        const pt = Array.from(pointersRef.current.values())[0];
        dragRef.current = {
          origX: item.transform.x,
          origY: item.transform.y,
          startX: pt.x,
          startY: pt.y,
        };
        pinchRef.current = null;
      }
    }
  }, [overlays]);

  const resolveAsset = (item: OverlayItem): ReactNode => {
    const { type, assetRef } = item;

    if (type === "sticker") {
      // Check for animated sticker
      const animated = parseAnimatedKey(assetRef.key);
      if (animated) {
        return <AnimatedSticker emoji={animated.emoji} animation={animated.animation} size="lg" />;
      }
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
      const frame = frames[idx];
      const url = typeof frame === "string" ? frame : frame?.file;
      if (url) return <img src={url} alt="" className="h-full w-full object-contain" draggable={false} />;
      return null;
    }

    if (type === "text") {
      return (
        <span
          className="select-none font-bold whitespace-nowrap drop-shadow-md"
          style={{
            color: item.textColor,
            fontSize: `${item.fontSize ?? 24}px`,
            fontFamily: item.fontFamily ?? "sans-serif",
          }}
        >
          {item.text || "Texto"}
        </span>
      );
    }

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
      data-overlay-drop="true"
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={(e) => {
        if (!interactive) return;
        if (didDragRef.current) { didDragRef.current = false; return; }
        onSelect(null);
      }}
    >
      {/* Transparent overlay to capture touch on video/media elements */}
      {interactive && overlays.length > 0 && (
        <div className="absolute inset-0 z-[2]" style={{ pointerEvents: selectedId ? "auto" : "none" }} />
      )}
      {children}

      {/* Frame overlay – positioned like stickers so they can be moved/scaled/rotated */}
      {overlays
        .filter((o) => o.type === "frame")
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
              width: "100%",
              height: "100%",
              transform: `translate(-50%, -50%) scale(${item.transform.scale}) rotate(${item.transform.rotation}deg)`,
              zIndex: 5 + (selectedId === item.id ? 100 : 0),
              pointerEvents: interactive ? "auto" : "none",
            }}
            onPointerDown={(e) => handleItemPointerDown(e, item)}
            onClick={(e) => e.stopPropagation()}
          >
            {resolveAsset(item)}
          </div>
        ))}

      {/* Background overlay */}
      {overlays
        .filter((o) => o.type === "background")
        .map((item) => (
          <div
            key={item.id}
            className="absolute inset-0 z-[1]"
            style={{ pointerEvents: interactive ? "auto" : "none" }}
            onPointerDown={(e) => handleItemPointerDown(e, item)}
            onClick={(e) => e.stopPropagation()}
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
            onPointerDown={(e) => handleItemPointerDown(e, item)}
            onClick={(e) => e.stopPropagation()}
          >
            {resolveAsset(item)}
          </div>
        ))}
    </div>
  );
}
