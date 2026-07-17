import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { packLoader } from "../../core/packs/packLoader";
import type { PackAsset, PackWithAssets } from "../../core/packs/types";

type AnimatedMascotKind =
  | "star"
  | "cat"
  | "trex"
  | "football"
  | "basketball"
  | "astronaut"
  | "parrot"
  | "unicorn"
  | "owl"
  | "car"
  | "cupcake"
  | "paintbrush";

const spriteLoaders: Record<AnimatedMascotKind, () => Promise<string>> = {
  star: () => import("../../assets/mascots/golden-star-sprites-32.webp").then((module) => module.default),
  cat: () => import("../../assets/mascots/orange-cat-sprites-32-fixed.webp").then((module) => module.default),
  trex: () => import("../../assets/mascots/green-trex-sprites-32-fixed.webp").then((module) => module.default),
  football: () => import("../../assets/mascots/football-player-sprites-32.webp").then((module) => module.default),
  basketball: () => import("../../assets/mascots/basketball-player-sprites-32.webp").then((module) => module.default),
  astronaut: () => import("../../assets/mascots/astronaut-sprites-32.webp").then((module) => module.default),
  parrot: () => import("../../assets/mascots/pirate-parrot-sprites-32.webp").then((module) => module.default),
  unicorn: () => import("../../assets/mascots/unicorn-sprites-32.webp").then((module) => module.default),
  owl: () => import("../../assets/mascots/magic-owl-sprites-32.webp").then((module) => module.default),
  car: () => import("../../assets/mascots/racing-car-sprites-32.webp").then((module) => module.default),
  cupcake: () => import("../../assets/mascots/cupcake-sprites-32.webp").then((module) => module.default),
  paintbrush: () => import("../../assets/mascots/living-paintbrush-sprites-32.webp").then((module) => module.default),
};

export const MASCOT_VISIBILITY_KEY = "misuperdiario:mascot-visible";
export const MASCOT_VISIBILITY_EVENT = "misuperdiario:mascot-visibility";

const mascotByPack: Record<string, { asset: string; accessory?: string; label: string }> = {
  base: { asset: "sol", label: "Solete" },
  animalesDivertidos: { asset: "gato", label: "Gatito" },
  dinosaurios: { asset: "trex", label: "T-Rex" },
  futbol: { asset: "arbitro", accessory: "balon", label: "Futbolista" },
  baloncesto: { asset: "equipacion", accessory: "balon", label: "Jugador de baloncesto" },
  espacio: { asset: "astronauta", label: "Astronauta" },
  aventuraPirata: { asset: "loro", label: "Loro pirata" },
  reinoMagico: { asset: "dragon", label: "Dragón" },
  escuelaMagia: { asset: "buho", label: "Búho mágico" },
  superVelocidad: { asset: "coche", label: "Coche veloz" },
  dulcePasteleria: { asset: "cupcake", label: "Cupcake" },
  artePintura: { asset: "paleta", label: "Paleta artista" },
};

const animatedKindByPack: Record<string, AnimatedMascotKind> = {
  base: "star",
  animalesDivertidos: "cat",
  dinosaurios: "trex",
  futbol: "football",
  baloncesto: "basketball",
  espacio: "astronaut",
  aventuraPirata: "parrot",
  reinoMagico: "unicorn",
  escuelaMagia: "owl",
  superVelocidad: "car",
  dulcePasteleria: "cupcake",
  artePintura: "paintbrush",
};

function findAsset(pack: PackWithAssets, id?: string): PackAsset | undefined {
  return pack.stickers.find((asset) => asset.id === id) ?? pack.stickers[0];
}

function readStoredPosition(profileId: string) {
  try {
    const stored = localStorage.getItem(`misuperdiario:mascot-position:${profileId}`);
    if (!stored) return undefined;
    return JSON.parse(stored) as { x: number; y: number };
  } catch {
    return undefined;
  }
}

export function FloatingMascot({ packId, profileId }: { packId: string; profileId: string }) {
  const location = useLocation();
  const rootRef = useRef<HTMLButtonElement>(null);
  const visualRef = useRef<HTMLSpanElement>(null);
  const spriteFrameRef = useRef<HTMLSpanElement>(null);
  const position = useRef({ x: 18, y: 150 });
  const target = useRef({ x: 18, y: 150 });
  const drag = useRef<{ pointerId: number; offsetX: number; offsetY: number; startX: number; startY: number } | null>(null);
  const targetAt = useRef(0);
  const [reacting, setReacting] = useState(false);
  const [visible, setVisible] = useState(() => localStorage.getItem(MASCOT_VISIBILITY_KEY) !== "false");
  const [spriteUrl, setSpriteUrl] = useState<string>();
  const resting = location.pathname === "/daily-photo" || location.pathname === "/record/video" || location.pathname === "/record/audio";

  const mascot = useMemo(() => {
    const pack = packLoader.getPackWithAssets(packId) ?? packLoader.getPackWithAssets("base");
    if (!pack) return undefined;
    const config = mascotByPack[pack.manifest.id] ?? { asset: pack.stickers[0]?.id, label: pack.manifest.name };
    return {
      main: findAsset(pack, config.asset),
      accessory: config.accessory ? pack.stickers.find((asset) => asset.id === config.accessory) : undefined,
      label: config.label,
      animatedKind: animatedKindByPack[pack.manifest.id],
    };
  }, [packId]);

  useEffect(() => {
    let alive = true;
    setSpriteUrl(undefined);
    if (!mascot?.animatedKind) return () => { alive = false; };
    void spriteLoaders[mascot.animatedKind]().then((url) => {
      if (alive) setSpriteUrl(url);
    });
    return () => { alive = false; };
  }, [mascot?.animatedKind]);

  useEffect(() => {
    const updateVisibility = () => setVisible(localStorage.getItem(MASCOT_VISIBILITY_KEY) !== "false");
    window.addEventListener(MASCOT_VISIBILITY_EVENT, updateVisibility);
    window.addEventListener("storage", updateVisibility);
    return () => {
      window.removeEventListener(MASCOT_VISIBILITY_EVENT, updateVisibility);
      window.removeEventListener("storage", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const saved = readStoredPosition(profileId);
    const width = 104;
    const height = 116;
    const initial = saved
      ? { x: saved.x * Math.max(1, window.innerWidth - width), y: saved.y * Math.max(1, window.innerHeight - height - 96) }
      : { x: Math.max(12, window.innerWidth - width - 18), y: Math.min(190, window.innerHeight * .28) };
    position.current = initial;
    target.current = initial;
  }, [profileId]);

  useEffect(() => {
    if (!visible || !mascot?.main) return;
    let animationFrame = 0;
    let lastTime = performance.now();
    let travelMode: "idle" | "walk" | "run" | "jump" | "roar" | "teleport" = reacting && mascot.animatedKind === "owl" ? "teleport" : "idle";
    let jumpStarted = 0;
    let roarStarted = 0;
    let teleportStarted = performance.now();
    let teleported = false;
    let idleStarted = performance.now();
    const reactionStarted = performance.now();
    const allowAutonomousMotion = typeof window.matchMedia !== "function"
      || !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const bounds = () => ({ maxX: Math.max(8, window.innerWidth - 112), maxY: Math.max(90, window.innerHeight - 214) });
    const chooseTarget = (time: number) => {
      const { maxX, maxY } = bounds();
      target.current = { x: 8 + Math.random() * (maxX - 8), y: 82 + Math.random() * Math.max(8, maxY - 82) };
      const trick = Math.random();
      travelMode = mascot.animatedKind === "trex"
        ? (trick < .38 ? "run" : "walk")
        : mascot.animatedKind === "cat"
          ? trick < .28 ? "jump" : trick < .58 ? "run" : "walk"
          : trick < .42 ? "run" : "walk";
      jumpStarted = time;
    };

    const animate = (time: number) => {
      const delta = Math.min(32, time - lastTime);
      lastTime = time;
      if (!drag.current && allowAutonomousMotion && (!resting || travelMode === "teleport")) {
        if (travelMode === "idle" && time >= targetAt.current) chooseTarget(time);
        if (travelMode === "teleport") {
          const elapsed = time - teleportStarted;
          if (!teleported && elapsed >= 460) {
            const { maxX, maxY } = bounds();
            const next = { x: 8 + Math.random() * (maxX - 8), y: 82 + Math.random() * Math.max(8, maxY - 82) };
            position.current = next;
            target.current = next;
            teleported = true;
          }
          if (elapsed >= 960) {
            travelMode = "idle";
            idleStarted = time;
            targetAt.current = time + 900;
          }
        } else if (travelMode === "roar") {
          if (time - roarStarted >= 1150) {
            travelMode = "idle";
            idleStarted = time;
            targetAt.current = time + 260;
          }
        } else if (travelMode !== "idle") {
          const dx = target.current.x - position.current.x;
          const dy = target.current.y - position.current.y;
          const remaining = Math.hypot(dx, dy);
          const speed = travelMode === "run" ? 178 : travelMode === "jump" ? 108 : 62;
          const step = Math.min(remaining, speed * delta / 1000);
          if (remaining > 0) {
            position.current.x += dx / remaining * step;
            position.current.y += dy / remaining * step;
          }
          if (travelMode === "jump" && time - jumpStarted > 820) {
            travelMode = remaining > 300 ? "run" : "walk";
          }
          if (remaining <= 1.5) {
            position.current = { ...target.current };
            if (mascot.animatedKind === "owl" && Math.random() < .3) {
              travelMode = "teleport";
              teleportStarted = time;
              teleported = false;
            } else if (mascot.animatedKind === "trex" && Math.random() < .42) {
              travelMode = "roar";
              roarStarted = time;
            } else {
              travelMode = "idle";
              idleStarted = time;
              targetAt.current = mascot.animatedKind === "cat" && Math.random() < .38
                ? time + 2700
                : time + 1200 + Math.random() * 1500;
            }
          }
        }
      }
      const distance = Math.hypot(target.current.x - position.current.x, target.current.y - position.current.y);
      if (visualRef.current && !drag.current && distance > 3) {
        visualRef.current.style.setProperty("--mascot-direction", target.current.x < position.current.x ? "-1" : "1");
      }
      if (spriteFrameRef.current && mascot.animatedKind) {
        const jumping = travelMode === "jump";
        const idleFrame = Math.floor(Math.max(0, time - idleStarted) / 310) % 8;
        const reactionFrame = Math.min(7, Math.floor((time - reactionStarted) / 120));
        const teleportFrame = Math.min(7, Math.floor((time - teleportStarted) / 120));
        const frame = travelMode === "teleport"
          ? 24 + teleportFrame
          : reacting || travelMode === "roar" || jumping
            ? 24 + (reacting ? reactionFrame : Math.floor(time / 105) % 8)
            : travelMode === "run"
              ? 8 + Math.floor(time / 72) % 8
              : travelMode === "walk"
                ? Math.floor(time / 108) % 8
                : 16 + idleFrame;
        const column = frame % 8;
        const row = Math.floor(frame / 8);
        spriteFrameRef.current.style.backgroundPosition = `${column * 100 / 7}% ${row * 100 / 3}%`;
        const jumpProgress = jumping ? Math.min(1, (time - jumpStarted) / 820) : 0;
        spriteFrameRef.current.style.setProperty("--sprite-lift", `${jumping ? -Math.sin(jumpProgress * Math.PI) * 42 : 0}px`);
      }
      if (rootRef.current) rootRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
      animationFrame = requestAnimationFrame(animate);
    };
    const handlePageVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        return;
      }
      lastTime = performance.now();
      if (!animationFrame) animationFrame = requestAnimationFrame(animate);
    };
    targetAt.current = performance.now() + 700;
    document.addEventListener("visibilitychange", handlePageVisibility);
    if (!document.hidden) animationFrame = requestAnimationFrame(animate);
    return () => {
      document.removeEventListener("visibilitychange", handlePageVisibility);
      cancelAnimationFrame(animationFrame);
    };
  }, [mascot?.animatedKind, mascot?.main, reacting, resting, visible]);

  if (!visible || !mascot?.main) return null;

  return (
    <button
      ref={rootRef}
      className={`floating-mascot ${reacting ? "is-reacting" : ""} ${resting ? "is-resting" : ""}`}
      type="button"
      aria-label={`${mascot.label}. Puedes moverlo por la pantalla.`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          pointerId: event.pointerId,
          offsetX: event.clientX - position.current.x,
          offsetY: event.clientY - position.current.y,
          startX: event.clientX,
          startY: event.clientY,
        };
      }}
      onPointerMove={(event) => {
        const current = drag.current;
        if (!current || current.pointerId !== event.pointerId) return;
        const nextX = Math.max(8, Math.min(window.innerWidth - 112, event.clientX - current.offsetX));
        if (visualRef.current && Math.abs(nextX - position.current.x) > 1) {
          visualRef.current.style.setProperty("--mascot-direction", nextX < position.current.x ? "-1" : "1");
        }
        position.current = {
          x: nextX,
          y: Math.max(72, Math.min(window.innerHeight - 214, event.clientY - current.offsetY)),
        };
        target.current = position.current;
      }}
      onPointerUp={(event) => {
        const current = drag.current;
        if (!current) return;
        const wasTap = Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 7;
        drag.current = null;
        const maxX = Math.max(1, window.innerWidth - 112);
        const maxY = Math.max(1, window.innerHeight - 214);
        localStorage.setItem(`misuperdiario:mascot-position:${profileId}`, JSON.stringify({ x: position.current.x / maxX, y: position.current.y / maxY }));
        if (wasTap) {
          setReacting(false);
          requestAnimationFrame(() => setReacting(true));
          window.setTimeout(() => setReacting(false), 980);
        }
      }}
      onPointerCancel={() => { drag.current = null; }}
    >
      <span ref={visualRef} className={`floating-mascot__body ${mascot.animatedKind ? "is-animated-sprite" : ""}`}>
        {mascot.animatedKind && spriteUrl
          ? <span ref={spriteFrameRef} className="floating-mascot__sprite-frame" style={{ backgroundImage: `url(${spriteUrl})` }} />
          : <img src={mascot.main.url} alt="" draggable={false} />}
        <i className="floating-mascot__shadow" aria-hidden="true" />
      </span>
    </button>
  );
}
