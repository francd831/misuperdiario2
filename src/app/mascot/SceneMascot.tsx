import { useEffect, useRef } from "react";
import starSprite from "../../assets/mascots/golden-star-sprites-32.webp";
import { MASCOT_VISIBILITY_EVENT, MASCOT_VISIBILITY_KEY } from "./FloatingMascot";
import type { MapPoint } from "./MapMascot";

type SceneMascotProps = {
  profileId: string;
  sceneId: string;
  path: MapPoint[];
};

function positionKey(profileId: string, sceneId: string) {
  return `misuperdiario:scene-mascot:${profileId}:${sceneId}`;
}

function distance(a: MapPoint, b: MapPoint) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function nearestPointOnPath(point: MapPoint, path: MapPoint[]) {
  let nearest = path[0];
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < path.length; index += 1) {
    const start = path[index];
    const end = path[(index + 1) % path.length];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    const progress = lengthSquared ? Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared)) : 0;
    const candidate = { x: start.x + dx * progress, y: start.y + dy * progress };
    const candidateDistance = distance(point, candidate);
    if (candidateDistance < nearestDistance) {
      nearest = candidate;
      nearestDistance = candidateDistance;
    }
  }
  return nearest;
}

function storedPosition(profileId: string, sceneId: string, fallback: MapPoint) {
  try {
    const value = JSON.parse(localStorage.getItem(positionKey(profileId, sceneId)) ?? "null");
    if (Number.isFinite(value?.x) && Number.isFinite(value?.y)) return value as MapPoint;
  } catch {
    // Ignore malformed local preferences.
  }
  return fallback;
}

export function SceneMascot({ profileId, sceneId, path }: SceneMascotProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);
  const position = useRef(nearestPointOnPath(storedPosition(profileId, sceneId, path[0]), path));
  const targetIndex = useRef(1);
  const dragging = useRef<{ pointerId: number; moved: boolean; startX: number; startY: number }>();
  const idleUntil = useRef(performance.now() + 1400);
  const visible = useRef(localStorage.getItem(MASCOT_VISIBILITY_KEY) !== "false");

  useEffect(() => {
    let request = 0;
    let previous = performance.now();
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const animate = (time: number) => {
      const delta = Math.min(34, time - previous);
      previous = time;
      if (!dragging.current && !reducedMotion && visible.current && time >= idleUntil.current) {
        const target = path[targetIndex.current];
        const remaining = distance(position.current, target);
        const step = Math.min(remaining, 8.5 * delta / 1000);
        if (remaining > .01) {
          const direction = target.x < position.current.x ? -1 : 1;
          rootRef.current?.style.setProperty("--map-mascot-direction", String(direction));
          position.current.x += (target.x - position.current.x) / remaining * step;
          position.current.y += (target.y - position.current.y) / remaining * step;
        }
        if (remaining < .25) {
          position.current = { ...target };
          targetIndex.current = (targetIndex.current + 1) % path.length;
          idleUntil.current = time + 900 + Math.random() * 1800;
        }
      }

      if (rootRef.current) {
        rootRef.current.style.left = `${position.current.x}%`;
        rootRef.current.style.top = `${position.current.y}%`;
      }
      if (spriteRef.current) {
        const moving = !dragging.current && time >= idleUntil.current && !reducedMotion;
        const row = moving ? 0 : 2;
        const column = Math.floor(time / (moving ? 118 : 330)) % 8;
        spriteRef.current.style.backgroundPosition = `${column * 100 / 7}% ${row * 100 / 3}%`;
      }
      request = requestAnimationFrame(animate);
    };
    request = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(request);
  }, [path]);

  useEffect(() => {
    const updateVisibility = () => {
      visible.current = localStorage.getItem(MASCOT_VISIBILITY_KEY) !== "false";
      if (rootRef.current) rootRef.current.hidden = !visible.current;
    };
    window.addEventListener(MASCOT_VISIBILITY_EVENT, updateVisibility);
    window.addEventListener("storage", updateVisibility);
    return () => {
      window.removeEventListener(MASCOT_VISIBILITY_EVENT, updateVisibility);
      window.removeEventListener("storage", updateVisibility);
    };
  }, []);

  return (
    <button
      ref={rootRef}
      className="scene-mascot"
      type="button"
      hidden={!visible.current}
      aria-label="Mover a Solete"
      onPointerDown={(event) => {
        dragging.current = { pointerId: event.pointerId, moved: false, startX: event.clientX, startY: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const drag = dragging.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 5) drag.moved = true;
        if (!drag.moved) return;
        const stage = event.currentTarget.parentElement?.getBoundingClientRect();
        if (!stage) return;
        const pointer = { x: (event.clientX - stage.left) / stage.width * 100, y: (event.clientY - stage.top) / stage.height * 100 };
        position.current = nearestPointOnPath(pointer, path);
      }}
      onPointerUp={(event) => {
        const drag = dragging.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        dragging.current = undefined;
        idleUntil.current = performance.now() + 1800;
        localStorage.setItem(positionKey(profileId, sceneId), JSON.stringify(position.current));
        const nearestIndex = path.reduce((best, point, index) => distance(position.current, point) < distance(position.current, path[best]) ? index : best, 0);
        targetIndex.current = (nearestIndex + 1) % path.length;
      }}
      onPointerCancel={() => { dragging.current = undefined; }}
    >
      <span ref={spriteRef} className="scene-mascot__sprite" style={{ backgroundImage: `url(${starSprite})` }} />
      <i className="scene-mascot__shadow" aria-hidden="true" />
    </button>
  );
}
