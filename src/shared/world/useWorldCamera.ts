import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type WorldPoint = { x: number; y: number };

type WorldTap = WorldPoint & {
  clientX: number;
  clientY: number;
};

type UseWorldCameraOptions = {
  worldKey: string;
  aspectRatio: number;
  baseHeight?: number;
  heightMultiplier?: number;
  widthMultiplier?: number;
  minimumZoom?: number;
  maximumZoom?: number;
  initialFocus?: WorldPoint;
  onSceneTap?: (tap: WorldTap) => void;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
  moved: boolean;
  interactive: boolean;
};

const DRAG_THRESHOLD = 6;

export function useWorldCamera({
  worldKey,
  aspectRatio,
  baseHeight = 980,
  heightMultiplier = 1.5,
  widthMultiplier = 1.9,
  minimumZoom = .25,
  maximumZoom = 1.42,
  initialFocus = { x: 50, y: 50 },
  onSceneTap,
}: UseWorldCameraOptions) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const worldBaseSize = useRef({ width: 1900, height: baseHeight });
  const worldZoom = useRef(1);
  const worldMinZoom = useRef(minimumZoom);
  const drag = useRef<DragState>();
  const activePointers = useRef(new Map<number, WorldPoint>());
  const pinch = useRef<{ distance: number; zoom: number; anchorX: number; anchorY: number }>();
  const suppressSceneClick = useRef(false);
  const tapHandler = useRef(onSceneTap);
  const [isDragging, setIsDragging] = useState(false);

  tapHandler.current = onSceneTap;

  const applySceneSize = useCallback((resetZoom = false) => {
    const viewport = viewportRef.current;
    const scene = sceneRef.current;
    if (!viewport || !scene) return;
    const height = Math.max(viewport.clientHeight * heightMultiplier, baseHeight);
    const width = Math.max(viewport.clientWidth * widthMultiplier, height * aspectRatio);
    worldBaseSize.current = { width, height };
    const fitZoom = Math.max(minimumZoom, Math.min(
      viewport.clientWidth / width,
      viewport.clientHeight / height,
    ));
    worldMinZoom.current = fitZoom;
    worldZoom.current = resetZoom ? fitZoom : Math.max(fitZoom, worldZoom.current);
    scene.style.width = `${Math.max(viewport.clientWidth, width * worldZoom.current)}px`;
    scene.style.height = `${Math.max(viewport.clientHeight, height * worldZoom.current)}px`;
  }, [aspectRatio, baseHeight, heightMultiplier, minimumZoom, widthMultiplier]);

  const focusAt = useCallback(({ x, y }: WorldPoint, behavior: ScrollBehavior = "smooth") => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({
      left: viewport.scrollWidth * x / 100 - viewport.clientWidth / 2,
      top: viewport.scrollHeight * y / 100 - viewport.clientHeight / 2,
      behavior,
    });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !sceneRef.current) return;
    const positionWorld = () => {
      applySceneSize(true);
      focusAt({ x: initialFocus.x, y: initialFocus.y }, "auto");
    };
    const resizeWorld = () => applySceneSize(false);
    const frame = window.requestAnimationFrame(positionWorld);
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(resizeWorld);
    observer?.observe(viewport);
    window.addEventListener("resize", resizeWorld);
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resizeWorld);
    };
  }, [worldKey, applySceneSize, focusAt, initialFocus.x, initialFocus.y]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    suppressSceneClick.current = false;
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    viewport.setPointerCapture(event.pointerId);
    setIsDragging(true);
    if (activePointers.current.size === 1) {
      drag.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        moved: false,
        interactive: Boolean((event.target as HTMLElement).closest("a, button, input, textarea, select")),
      };
      return;
    }
    const [first, second] = [...activePointers.current.values()];
    const rect = viewport.getBoundingClientRect();
    const centerX = (first.x + second.x) / 2 - rect.left;
    const centerY = (first.y + second.y) / 2 - rect.top;
    pinch.current = {
      distance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
      zoom: worldZoom.current,
      anchorX: (viewport.scrollLeft + centerX) / Math.max(1, viewport.scrollWidth),
      anchorY: (viewport.scrollTop + centerY) / Math.max(1, viewport.scrollHeight),
    };
    suppressSceneClick.current = true;
    if (drag.current) drag.current.moved = true;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const scene = sceneRef.current;
    if (!viewport || !scene || !activePointers.current.has(event.pointerId)) return;
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch.current && activePointers.current.size >= 2) {
      const [first, second] = [...activePointers.current.values()];
      const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
      const nextZoom = Math.max(worldMinZoom.current, Math.min(maximumZoom, pinch.current.zoom * distance / pinch.current.distance));
      const rect = viewport.getBoundingClientRect();
      const centerX = (first.x + second.x) / 2 - rect.left;
      const centerY = (first.y + second.y) / 2 - rect.top;
      worldZoom.current = nextZoom;
      scene.style.width = `${Math.max(viewport.clientWidth, worldBaseSize.current.width * nextZoom)}px`;
      scene.style.height = `${Math.max(viewport.clientHeight, worldBaseSize.current.height * nextZoom)}px`;
      viewport.scrollLeft = pinch.current.anchorX * viewport.scrollWidth - centerX;
      viewport.scrollTop = pinch.current.anchorY * viewport.scrollHeight - centerY;
      return;
    }
    const activeDrag = drag.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    const movementX = event.clientX - activeDrag.startX;
    const movementY = event.clientY - activeDrag.startY;
    if (Math.hypot(movementX, movementY) > DRAG_THRESHOLD) {
      activeDrag.moved = true;
      suppressSceneClick.current = true;
    }
    viewport.scrollLeft = activeDrag.scrollLeft - movementX;
    viewport.scrollTop = activeDrag.scrollTop - movementY;
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const activeDrag = drag.current;
    if (viewport?.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    const wasPinching = Boolean(pinch.current);
    activePointers.current.delete(event.pointerId);
    pinch.current = undefined;
    const remaining = [...activePointers.current.entries()][0];
    if (remaining && viewport) {
      const [pointerId, point] = remaining;
      drag.current = { pointerId, startX: point.x, startY: point.y, scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop, moved: true, interactive: false };
    } else {
      drag.current = undefined;
      setIsDragging(false);
    }
    if (!wasPinching && !activeDrag?.moved && !activeDrag?.interactive) {
      const scene = sceneRef.current?.getBoundingClientRect();
      if (scene) {
        tapHandler.current?.({
          x: (event.clientX - scene.left) / scene.width * 100,
          y: (event.clientY - scene.top) / scene.height * 100,
          clientX: event.clientX,
          clientY: event.clientY,
        });
      }
    }
  };

  const onClickCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!suppressSceneClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressSceneClick.current = false;
  };

  const panBy = (x: number, y = 0) => viewportRef.current?.scrollBy({ left: x, top: y, behavior: "smooth" });

  return {
    viewportRef,
    sceneRef,
    isDragging,
    focusAt,
    panBy,
    viewportHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onClickCapture,
    },
  };
}
