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

export function MapMascot({ profileId, sceneId, hub, routes, destinationId, onArrive }: MapMascotProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);
  const position = useRef<MapPoint>({ ...hub });
  const travel = useRef<Travel>();
  const mode = useRef<"idle" | "walk" | "run" | "arrive">("idle");
  const pendingArrival = useRef<{ id: string; at: number }>();
  const onArriveRef = useRef(onArrive);
  const visible = useRef(localStorage.getItem(MASCOT_VISIBILITY_KEY) !== "false");

  useEffect(() => { onArriveRef.current = onArrive; }, [onArrive]);

  useEffect(() => {
    const lastDestination = storedDestination(profileId, sceneId);
    const lastRoute = lastDestination ? routes[lastDestination] : undefined;
    position.current = lastRoute?.at(-1) ?? hub;
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
      if (rootRef.current) {
        rootRef.current.style.left = `${end.x}%`;
        rootRef.current.style.top = `${end.y}%`;
      }
      const timer = window.setTimeout(() => onArriveRef.current(destinationId), 120);
      return () => window.clearTimeout(timer);
    }

    const path = [{ ...position.current }, { ...hub }, ...destinationPath];
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
              localStorage.setItem(`misuperdiario:map-mascot:${profileId}:${sceneId}`, activeTravel.destinationId);
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
      onClick={() => {
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
