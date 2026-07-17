import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

interface TransformValues {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface GestureOptions extends TransformValues {
  minScale: number;
  maxScale: number;
  onSelect?: () => void;
  onUpdate: (patch: Partial<TransformValues>) => void;
}

interface PointerPosition { x: number; y: number }

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function distance(a: PointerPosition, b: PointerPosition) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function angle(a: PointerPosition, b: PointerPosition) {
  return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
}

function midpoint(a: PointerPosition, b: PointerPosition) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function useOverlayGestures(options: GestureOptions) {
  const pointers = useRef(new Map<number, PointerPosition>());
  const current = useRef<TransformValues>(options);
  const origin = useRef({ values: current.current, point: { x: 0, y: 0 }, distance: 1, angle: 0 });
  current.current = options;

  function begin(element: HTMLElement) {
    const points = [...pointers.current.values()];
    if (points.length === 1) {
      origin.current = { values: { ...current.current }, point: points[0], distance: 1, angle: 0 };
    } else if (points.length >= 2) {
      origin.current = {
        values: { ...current.current },
        point: midpoint(points[0], points[1]),
        distance: Math.max(distance(points[0], points[1]), 1),
        angle: angle(points[0], points[1]),
      };
    }
    element.style.cursor = "grabbing";
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("[data-overlay-controls]")) return;
    event.preventDefault();
    event.stopPropagation();
    options.onSelect?.();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    begin(event.currentTarget);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    event.preventDefault();
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];
    const bounds = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!bounds) return;

    if (points.length === 1) {
      options.onUpdate({
        x: clamp(origin.current.values.x + (points[0].x - origin.current.point.x) / bounds.width * 100, 0, 100),
        y: clamp(origin.current.values.y + (points[0].y - origin.current.point.y) / bounds.height * 100, 0, 100),
      });
    } else {
      const center = midpoint(points[0], points[1]);
      options.onUpdate({
        x: clamp(origin.current.values.x + (center.x - origin.current.point.x) / bounds.width * 100, 0, 100),
        y: clamp(origin.current.values.y + (center.y - origin.current.point.y) / bounds.height * 100, 0, 100),
        scale: clamp(origin.current.values.scale * distance(points[0], points[1]) / origin.current.distance, options.minScale, options.maxScale),
        rotation: origin.current.values.rotation + angle(points[0], points[1]) - origin.current.angle,
      });
    }
  }

  function onPointerUp(event: ReactPointerEvent<HTMLElement>) {
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (pointers.current.size) begin(event.currentTarget);
    else event.currentTarget.style.cursor = "grab";
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}
