import { useEffect, useRef } from "react";
import starSprite from "../../assets/mascots/golden-star-sprites-32.webp";
import { MASCOT_VISIBILITY_EVENT, MASCOT_VISIBILITY_KEY } from "./FloatingMascot";

export type MapPoint = { x: number; y: number };

type Travel = {
  destinationId: string;
  path: MapPoint[];
  segment: number;
  mode: "walk" | "run";
};

type MapMascotProps = {
  profileId: string;
  sceneId: string;
  hub: MapPoint;
  routes: Record<string, MapPoint[]>;
  destinationId?: string;
  onArrive: (destinationId: string) => void;
};

function distance(a: MapPoint, b: MapPoint) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function storedDestination(profileId: string, sceneId: string) {
  return localStorage.getItem(`misuperdiario:map-mascot:${profileId}:${sceneId}`) ?? undefined;
}

function destinationKey(profileId: string, sceneId: string) {
  return `misuperdiario:map-mascot:${profileId}:${sceneId}`;
}

function positionKey(profileId: string, sceneId: string) {
  return `misuperdiario:map-mascot-position:${profileId}:${sceneId}`;
}

function storedPosition(profileId: string, sceneId: string): MapPoint | undefined {
  try {
    const value = JSON.parse(localStorage.getItem(positionKey(profileId, sceneId)) ?? "null");
    if (Number.isFinite(value?.x) && Number.isFinite(value?.y)) return value;
  } catch {
    // Ignore obsolete or malformed local preferences.
  }
  return undefined;
}

function uniquePath(points: MapPoint[]) {
  return points.filter((point, index) => index === 0 || distance(point, points[index - 1]) > .1);
}

export function MapMascot({ profileId, sceneId, hub, routes, destinationId, onArrive }: MapMascotProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);
  const position = useRef<MapPoint>({ ...hub });
  const travel = useRef<Travel>();
  const mode = useRef<"idle" | "walk" | "run" | "arrive">("idle");
  const pendingArrival = useRef<{ id: string; at: number }>();
  const currentDestination = useRef<string>();
  const drag = useRef<{ pointerId: number; startX: number; startY: number; moved: boolean }>();
  const suppressClick = useRef(false);
  const onArriveRef = useRef(onArrive);
  const visible = useRef(localStorage.getItem(MASCOT_VISIBILITY_KEY) !== "false");

  useEffect(() => { onArriveRef.current = onArrive; }, [onArrive]);

  useEffect(() => {
    const lastDestination = storedDestination(profileId, sceneId);
    const lastRoute = lastDestination ? routes[lastDestination] : undefined;
    const customPosition = storedPosition(profileId, sceneId);
    currentDestination.current = customPosition ? undefined : lastRoute ? lastDestination : undefined;
    position.current = customPosition ?? lastRoute?.at(-1) ?? hub;
    if (rootRef.current) {
      rootRef.current.style.left = `${position.current.x}%`;
      rootRef.current.style.top = `${position.current.y}%`;
    }
  }, [hub, profileId, routes, sceneId]);

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

  useEffect(() => {
    if (!destinationId || !routes[destinationId]) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const destinationPath = routes[destinationId];
    const end = destinationPath.at(-1) ?? hub;
    if (reducedMotion) {
      position.current = { ...end };
      currentDestination.current = destinationId;
      localStorage.setItem(destinationKey(profileId, sceneId), destinationId);
      localStorage.removeItem(positionKey(profileId, sceneId));
      if (rootRef.current) {
        rootRef.current.style.left = `${end.x}%`;
        rootRef.current.style.top = `${end.y}%`;
      }
      const timer = window.setTimeout(() => onArriveRef.current(destinationId), 120);
      return () => window.clearTimeout(timer);
    }

    if (currentDestination.current === destinationId || distance(position.current, end) < 1) {
      travel.current = undefined;
      mode.current = "arrive";
      pendingArrival.current = { id: destinationId, at: performance.now() + 420 };
      return;
    }

    const originRoute = currentDestination.current ? routes[currentDestination.current] : undefined;
    const routeBackToHub = originRoute
      ? [...originRoute].reverse().slice(1).concat({ ...hub })
      : [{ ...hub }];
    const path = uniquePath([{ ...position.current }, ...routeBackToHub, ...destinationPath]);
    const routeLength = path.slice(1).reduce((total, point, index) => total + distance(path[index], point), 0);
    travel.current = {
      destinationId,
      path,
      segment: 0,
      mode: routeLength > 62 ? "run" : "walk",
    };
    mode.current = travel.current.mode;
    pendingArrival.current = undefined;
  }, [destinationId, hub, routes]);

  useEffect(() => {
    let frameRequest = 0;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min(34, time - lastTime);
      lastTime = time;
      const activeTravel = travel.current;

      if (activeTravel && visible.current) {
        const next = activeTravel.path[activeTravel.segment + 1];
        if (next) {
          const remaining = distance(position.current, next);
          const speed = activeTravel.mode === "run" ? 42 : 28;
          const step = Math.min(remaining, speed * delta / 1000);
          if (remaining > 0) {
            const direction = next.x < position.current.x ? -1 : 1;
            rootRef.current?.style.setProperty("--map-mascot-direction", String(direction));
            position.current.x += (next.x - position.current.x) / remaining * step;
            position.current.y += (next.y - position.current.y) / remaining * step;
          }
          if (remaining <= .35) {
            position.current = { ...next };
            activeTravel.segment += 1;
            if (activeTravel.segment >= activeTravel.path.length - 1) {
              travel.current = undefined;
              mode.current = "arrive";
              pendingArrival.current = { id: activeTravel.destinationId, at: time + 520 };
              currentDestination.current = activeTravel.destinationId;
              localStorage.setItem(destinationKey(profileId, sceneId), activeTravel.destinationId);
              localStorage.removeItem(positionKey(profileId, sceneId));
            }
          }
        }
      }

      if (pendingArrival.current && time >= pendingArrival.current.at) {
        const arrived = pendingArrival.current.id;
        pendingArrival.current = undefined;
        mode.current = "idle";
        onArriveRef.current(arrived);
      }

      if (rootRef.current) {
        rootRef.current.style.left = `${position.current.x}%`;
        rootRef.current.style.top = `${position.current.y}%`;
      }

      if (spriteRef.current) {
        const row = mode.current === "run" ? 1 : mode.current === "idle" ? 2 : mode.current === "arrive" ? 3 : 0;
        const interval = mode.current === "run" ? 72 : mode.current === "walk" ? 108 : mode.current === "arrive" ? 92 : 310;
        const column = Math.floor(time / interval) % 8;
        spriteRef.current.style.backgroundPosition = `${column * 100 / 7}% ${row * 100 / 3}%`;
      }

      frameRequest = requestAnimationFrame(animate);
    };

    frameRequest = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRequest);
  }, [profileId, sceneId]);

  return (
    <button
      ref={rootRef}
      className="map-mascot"
      type="button"
      hidden={!visible.current}
      aria-label="Solete, guía del mapa"
      onPointerDown={(event) => {
        if (travel.current || pendingArrival.current) return;
        drag.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          moved: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const activeDrag = drag.current;
        if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
        if (Math.hypot(event.clientX - activeDrag.startX, event.clientY - activeDrag.startY) > 6) {
          activeDrag.moved = true;
        }
        if (!activeDrag.moved) return;
        const stage = event.currentTarget.parentElement?.getBoundingClientRect();
        if (!stage) return;
        position.current = {
          x: Math.max(5, Math.min(95, (event.clientX - stage.left) / stage.width * 100)),
          y: Math.max(12, Math.min(94, (event.clientY - stage.top) / stage.height * 100)),
        };
        currentDestination.current = undefined;
        mode.current = "walk";
      }}
      onPointerUp={(event) => {
        const activeDrag = drag.current;
        if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        drag.current = undefined;
        if (!activeDrag.moved) return;
        suppressClick.current = true;
        window.setTimeout(() => { suppressClick.current = false; }, 0);
        mode.current = "idle";
        localStorage.setItem(positionKey(profileId, sceneId), JSON.stringify(position.current));
        localStorage.removeItem(destinationKey(profileId, sceneId));
      }}
      onPointerCancel={() => {
        drag.current = undefined;
        mode.current = "idle";
      }}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        if (travel.current) return;
        mode.current = "arrive";
        window.setTimeout(() => { if (!travel.current) mode.current = "idle"; }, 760);
      }}
    >
      <span ref={spriteRef} className="map-mascot__sprite" style={{ backgroundImage: `url(${starSprite})` }} />
      <i className="map-mascot__shadow" aria-hidden="true" />
    </button>
  );
}
