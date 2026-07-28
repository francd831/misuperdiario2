import { ChevronLeft, ChevronRight, Download, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import giantCreativeRoom from "../../assets/home/giant-creative-room-world-v5-no-chest.png";
import starSprite from "../../assets/mascots/golden-star-sprites-32.webp";
import { loadPackMascotSprite, MASCOT_VISIBILITY_EVENT, MASCOT_VISIBILITY_KEY } from "../../app/mascot/FloatingMascot";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { walletService } from "../../core/wallet/walletService";
import { useWorldCamera } from "../../shared/world/useWorldCamera";
import { useRemotePacks } from "../../core/packs/RemotePackContext";

// La geometría de cada mundo sigue en la aplicación; su ilustración se descarga.
const cityOfChampionsWorld = giantCreativeRoom;
const valleyOfPawprintsWorld = giantCreativeRoom;
const valleyOfErasWorld = giantCreativeRoom;
const artWorld = giantCreativeRoom;
const pirateWorld = giantCreativeRoom;
const basketballWorld = giantCreativeRoom;
const pastryWorld = giantCreativeRoom;
const magicSchoolWorld = giantCreativeRoom;
const spaceWorld = giantCreativeRoom;
const footballConceptWorld = giantCreativeRoom;
const magicKingdomWorld = giantCreativeRoom;
const speedWorld = giantCreativeRoom;

const destinations = [
  { id: "video", to: "/record/video", title: "Cine de los recuerdos", short: "Vídeo", x: 14.5, y: 29 },
  { id: "voice", to: "/record/audio", title: "Estudio de voz", short: "Voz", x: 22, y: 63 },
  { id: "write", to: "/record/text", title: "Mesa de historias", short: "Escribir", x: 49, y: 45 },
  { id: "photo", to: "/daily-photo", title: "Rincón de fotos", short: "Foto", x: 82, y: 65 },
  { id: "store", to: "/store", title: "Kiosco de mundos", short: "Tienda", x: 89, y: 32 },
  { id: "diary", to: "/diary", title: "Librería de recuerdos", short: "Historial", x: 70.5, y: 27 },
] as const;

const animalDestinations: Record<(typeof destinations)[number]["id"], { title: string; short: string; x: number; y: number }> = {
  video: { title: "Cine del Gran Roble", short: "Vídeo", x: 18.5, y: 27 },
  voice: { title: "Cueva de los Rugidos", short: "Voz", x: 18, y: 68 },
  write: { title: "Cabaña del Explorador", short: "Escribir", x: 47, y: 56 },
  photo: { title: "Mirador del Safari", short: "Foto", x: 76, y: 66 },
  store: { title: "Mercado del Bosque", short: "Tienda", x: 90, y: 43 },
  diary: { title: "Museo de las Huellas", short: "Historial", x: 70, y: 24 },
};

const dinosaurDestinations: Record<(typeof destinations)[number]["id"], { title: string; short: string; x: number; y: number }> = {
  video: { title: "Cueva del Cine", short: "Vídeo", x: 15, y: 31 },
  voice: { title: "Anfiteatro de los Rugidos", short: "Voz", x: 37.5, y: 58 },
  write: { title: "Árbol de las Historias", short: "Escribir", x: 50, y: 37 },
  photo: { title: "Mirador de las Fotos", short: "Foto", x: 78, y: 25 },
  store: { title: "Mercado de Mundos", short: "Tienda", x: 15, y: 78 },
  diary: { title: "Recuerdos Fósiles", short: "Historial", x: 81, y: 51 },
};

const footballDestinations: Record<(typeof destinations)[number]["id"], { title: string; short: string; x: number; y: number }> = {
  video: { title: "Estadio de Jugadas", short: "Vídeo", x: 13, y: 23 },
  voice: { title: "Cabina de Comentaristas", short: "Voz", x: 37, y: 20 },
  write: { title: "Pizarra de Historias", short: "Escribir", x: 61, y: 24 },
  photo: { title: "Foto de Campeones", short: "Foto", x: 84, y: 25 },
  store: { title: "Tienda de Equipaciones", short: "Tienda", x: 47, y: 66 },
  diary: { title: "Museo del Club", short: "Historial", x: 17, y: 64 },
};

type DestinationId = (typeof destinations)[number]["id"];
type WorldZone = { title: string; x: number; y: number };
type ConceptWorld = {
  background: string;
  zones: Record<DestinationId, WorldZone>;
  settings: WorldPoint;
  exit: WorldPoint;
};

const conceptWorlds: Record<string, ConceptWorld> = {
  artePintura: {
    background: artWorld, settings: { x: 91, y: 43 }, exit: { x: 89, y: 79 },
    zones: {
      video: { title: "Cine del Lienzo", x: 13, y: 41 }, voice: { title: "Estudio de las Voces", x: 13, y: 74 },
      write: { title: "Cuaderno del Artista", x: 49, y: 44 }, photo: { title: "Estudio de Retratos", x: 70, y: 69 },
      store: { title: "Mercado de Colores", x: 22, y: 16 }, diary: { title: "Museo de Recuerdos", x: 76, y: 16 },
    },
  },
  aventuraPirata: {
    background: pirateWorld, settings: { x: 47, y: 68 }, exit: { x: 72, y: 73 },
    zones: {
      video: { title: "Cueva del Cine", x: 15, y: 23 }, voice: { title: "Bahía de las Canciones", x: 38, y: 20 },
      write: { title: "Bitácora del Capitán", x: 61, y: 20 }, photo: { title: "Mirador de las Fotos", x: 82, y: 25 },
      store: { title: "Mercado del Puerto", x: 22, y: 68 }, diary: { title: "Recuerdos del Galeón", x: 91, y: 48 },
    },
  },
  baloncesto: {
    background: basketballWorld, settings: { x: 50, y: 76 }, exit: { x: 79, y: 75 },
    zones: {
      video: { title: "Videomarcador", x: 50, y: 20 }, voice: { title: "Cabina del Comentarista", x: 16, y: 25 },
      write: { title: "Cuaderno del Entrenador", x: 84, y: 26 }, photo: { title: "Fotos de Prensa", x: 15, y: 49 },
      store: { title: "Tienda del Equipo", x: 22, y: 76 }, diary: { title: "Museo de Campeones", x: 84, y: 49 },
    },
  },
  dulcePasteleria: {
    background: pastryWorld, settings: { x: 53, y: 56 }, exit: { x: 50, y: 87 },
    zones: {
      video: { title: "Cine de Chocolate", x: 16, y: 20 }, voice: { title: "Karaoke de Caramelo", x: 30, y: 43 },
      write: { title: "Libro de Recetas", x: 50, y: 23 }, photo: { title: "Estudio de Tartas", x: 82, y: 21 },
      store: { title: "Tienda de Delicias", x: 16, y: 61 }, diary: { title: "Álbum de Sabores", x: 86, y: 48 },
    },
  },
  escuelaMagia: {
    background: magicSchoolWorld, settings: { x: 65, y: 72 }, exit: { x: 50, y: 82 },
    zones: {
      video: { title: "Cine de las Visiones", x: 17, y: 23 }, voice: { title: "Aula de Voces Mágicas", x: 50, y: 22 },
      write: { title: "Libro de Hechizos", x: 72, y: 23 }, photo: { title: "Estudio de Retratos Mágicos", x: 85, y: 50 },
      store: { title: "Emporio Mágico", x: 40, y: 56 }, diary: { title: "Biblioteca de Memorias", x: 14, y: 53 },
    },
  },
  espacio: {
    background: spaceWorld, settings: { x: 51, y: 76 }, exit: { x: 75, y: 75 },
    zones: {
      video: { title: "Pantalla de Transmisiones", x: 22, y: 27 }, voice: { title: "Centro de Comunicaciones", x: 51, y: 23 },
      write: { title: "Bitácora Espacial", x: 72, y: 27 }, photo: { title: "Observatorio Fotográfico", x: 86, y: 49 },
      store: { title: "Tienda de Suministros", x: 28, y: 69 }, diary: { title: "Memorias Estelares", x: 15, y: 51 },
    },
  },
  futbol: {
    background: footballConceptWorld, settings: { x: 69, y: 62 }, exit: { x: 89, y: 79 },
    zones: {
      video: { title: "Videomarcador", x: 18, y: 16 }, voice: { title: "Cabina de Narración", x: 87, y: 16 },
      write: { title: "Cuaderno del Míster", x: 24, y: 38 }, photo: { title: "Fotos de Prensa", x: 82, y: 38 },
      store: { title: "Tienda del Club", x: 46, y: 69 }, diary: { title: "Museo del Equipo", x: 17, y: 69 },
    },
  },
  reinoMagico: {
    background: magicKingdomWorld, settings: { x: 53, y: 77 }, exit: { x: 78, y: 73 },
    zones: {
      video: { title: "Cine de los Sueños", x: 13, y: 18 }, voice: { title: "Claro de las Canciones", x: 40, y: 17 },
      write: { title: "Árbol de los Cuentos", x: 62, y: 20 }, photo: { title: "Mirador de Fotos Mágicas", x: 84, y: 26 },
      store: { title: "Mercado de las Hadas", x: 33, y: 72 }, diary: { title: "Castillo de los Recuerdos", x: 15, y: 53 },
    },
  },
  superVelocidad: {
    background: speedWorld, settings: { x: 78, y: 72 }, exit: { x: 89, y: 17 },
    zones: {
      video: { title: "Pantalla del Circuito", x: 17, y: 17 }, voice: { title: "Radio de Boxes", x: 40, y: 30 },
      write: { title: "Cuaderno del Piloto", x: 59, y: 29 }, photo: { title: "Podio de las Fotos", x: 83, y: 42 },
      store: { title: "Tienda del Circuito", x: 43, y: 78 }, diary: { title: "Museo del Motor", x: 14, y: 64 },
    },
  },
};

type WorldPoint = { x: number; y: number };

const WORLD_ASPECT_RATIO = 1848 / 864;

const roomObstacles = [
  { x: 15, y: 30, rx: 13, ry: 8 },
  { x: 22, y: 62, rx: 13, ry: 11 },
  { x: 49, y: 45, rx: 14, ry: 10 },
  { x: 70, y: 29, rx: 12, ry: 7 },
  { x: 88, y: 34, rx: 10, ry: 8 },
  { x: 72.2, y: 51.5, rx: 6, ry: 8 },
  { x: 82, y: 65, rx: 13, ry: 11 },
] as const;

const animalValleyObstacles = [
  { x: 18.5, y: 27, rx: 12, ry: 14 },
  { x: 18, y: 68, rx: 12, ry: 12 },
  { x: 36, y: 24, rx: 7, ry: 10 },
  { x: 47, y: 56, rx: 11, ry: 11 },
  { x: 70, y: 24, rx: 11, ry: 12 },
  { x: 76, y: 66, rx: 12, ry: 14 },
  { x: 90, y: 43, rx: 9, ry: 11 },
] as const;

const dinosaurValleyObstacles = [
  { x: 15, y: 31, rx: 12, ry: 13 },
  { x: 37.5, y: 58, rx: 12, ry: 12 },
  { x: 50, y: 37, rx: 13, ry: 15 },
  { x: 78, y: 25, rx: 11, ry: 12 },
  { x: 81, y: 51, rx: 11, ry: 13 },
  { x: 15, y: 78, rx: 11, ry: 11 },
  { x: 68, y: 75, rx: 10, ry: 10 },
] as const;

const footballCampusObstacles = [
  { x: 13, y: 23, rx: 12, ry: 14 },
  { x: 37, y: 20, rx: 10, ry: 12 },
  { x: 61, y: 24, rx: 11, ry: 13 },
  { x: 84, y: 25, rx: 10, ry: 13 },
  { x: 17, y: 64, rx: 11, ry: 14 },
  { x: 47, y: 66, rx: 12, ry: 13 },
  { x: 70, y: 66, rx: 11, ry: 13 },
] as const;

function constrainToRoom(point: WorldPoint, obstacles: ReadonlyArray<{ x: number; y: number; rx: number; ry: number }> = roomObstacles): WorldPoint {
  const y = Math.max(23, Math.min(91, point.y));
  const depth = Math.max(0, 45 - y);
  let x = Math.max(4 + depth * .1, Math.min(96 - depth * .1, point.x));
  let nextY = y;

  for (const obstacle of obstacles) {
    const dx = (x - obstacle.x) / obstacle.rx;
    const dy = (nextY - obstacle.y) / obstacle.ry;
    const normalizedDistance = Math.hypot(dx, dy);
    if (normalizedDistance >= 1) continue;
    if (normalizedDistance < .001) {
      nextY = obstacle.y + obstacle.ry;
      continue;
    }
    const safeDistance = Math.max(.001, normalizedDistance);
    x = obstacle.x + dx / safeDistance * obstacle.rx;
    nextY = obstacle.y + dy / safeDistance * obstacle.ry;
  }

  return { x, y: nextY };
}

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function HomePage() {
  const { activeProfile, logout } = useProfiles();
  const { getResources, isInstalled } = useRemotePacks();
  const navigate = useNavigate();
  const playerRef = useRef<HTMLDivElement>(null);
  const playerSpriteRef = useRef<HTMLSpanElement>(null);
  const playerPosition = useRef({ x: 50, y: 74 });
  const playerTarget = useRef({ x: 50, y: 74 });
  const pressedKeys = useRef(new Set<string>());
  const [balance, setBalance] = useState(0);
  const [focusedDestinationId, setFocusedDestinationId] = useState<DestinationId>();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent>();
  const [mascotVisible, setMascotVisible] = useState(() => localStorage.getItem(MASCOT_VISIBILITY_KEY) !== "false");
  const [playerMascot, setPlayerMascot] = useState({ url: starSprite, label: "Solete", columns: 8 });
  const activePackId = activeProfile?.activePackId ?? "base";
  const effectivePackId = isInstalled(activePackId) ? activePackId : "base";
  const remoteResources = getResources(effectivePackId);
  const conceptWorld = conceptWorlds[effectivePackId];
  const worldBackground = remoteResources.home ?? conceptWorld?.background ?? (effectivePackId === "animalesDivertidos"
    ? valleyOfPawprintsWorld
    : effectivePackId === "dinosaurios" ? valleyOfErasWorld : effectivePackId === "futbol" ? cityOfChampionsWorld : giantCreativeRoom);
  const worldDestinations = destinations.map((destination) => conceptWorld
    ? { ...destination, ...conceptWorld.zones[destination.id] }
    : effectivePackId === "animalesDivertidos"
    ? { ...destination, ...animalDestinations[destination.id] }
    : effectivePackId === "dinosaurios" ? { ...destination, ...dinosaurDestinations[destination.id] }
      : effectivePackId === "futbol" ? { ...destination, ...footballDestinations[destination.id] } : destination);
  const activeObstacles = conceptWorld
    ? worldDestinations.map(({ x, y }) => ({ x, y, rx: 9, ry: 10 }))
    : effectivePackId === "animalesDivertidos"
    ? animalValleyObstacles
    : effectivePackId === "dinosaurios" ? dinosaurValleyObstacles : effectivePackId === "futbol" ? footballCampusObstacles : roomObstacles;
  const {
    viewportRef,
    sceneRef,
    isDragging,
    panBy,
    viewportHandlers,
  } = useWorldCamera({
    worldKey: effectivePackId,
    aspectRatio: effectivePackId === "futbol" ? 16 / 9 : WORLD_ASPECT_RATIO,
    initialFocus: { x: 42, y: 72 },
    onSceneTap: ({ x, y }) => {
      playerTarget.current = constrainToRoom({ x, y }, activeObstacles);
    },
  });

  useEffect(() => {
    const updateVisibility = () => setMascotVisible(localStorage.getItem(MASCOT_VISIBILITY_KEY) !== "false");
    window.addEventListener(MASCOT_VISIBILITY_EVENT, updateVisibility);
    window.addEventListener("storage", updateVisibility);
    return () => {
      window.removeEventListener(MASCOT_VISIBILITY_EVENT, updateVisibility);
      window.removeEventListener("storage", updateVisibility);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    void loadPackMascotSprite(effectivePackId, remoteResources.mascotSprite).then((mascot) => {
      if (alive) setPlayerMascot({ url: mascot.url, label: mascot.label, columns: mascot.columns });
    });
    return () => { alive = false; };
  }, [effectivePackId, remoteResources.mascotSprite]);

  useEffect(() => {
    if (!activeProfile) return;
    let alive = true;
    const refreshBalance = () => {
      void walletService.getBalance(activeProfile.id).then((nextBalance) => {
        if (alive) setBalance(nextBalance);
      }).catch(() => {
        if (alive) setBalance(0);
      });
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshBalance();
    };
    refreshBalance();
    window.addEventListener("focus", refreshBalance);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      alive = false;
      window.removeEventListener("focus", refreshBalance);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [activeProfile]);

  useEffect(() => {
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
  }, []);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();

    const animate = (time: number) => {
      const delta = Math.min(34, time - previous);
      previous = time;
      const keys = pressedKeys.current;
      const keyboardX = Number(keys.has("ArrowRight") || keys.has("d")) - Number(keys.has("ArrowLeft") || keys.has("a"));
      const keyboardY = Number(keys.has("ArrowDown") || keys.has("s")) - Number(keys.has("ArrowUp") || keys.has("w"));
      const position = playerPosition.current;
      const target = playerTarget.current;

      if (keyboardX || keyboardY) {
        const length = Math.hypot(keyboardX, keyboardY) || 1;
        const constrained = constrainToRoom({
          x: position.x + keyboardX / length * delta * .014,
          y: position.y + keyboardY / length * delta * .012,
        }, activeObstacles);
        position.x = constrained.x;
        position.y = constrained.y;
        target.x = position.x;
        target.y = position.y;
      } else {
        const dx = target.x - position.x;
        const dy = target.y - position.y;
        const distance = Math.hypot(dx, dy);
        if (distance > .08) {
          const step = Math.min(distance, delta * .018);
          const constrained = constrainToRoom({
            x: position.x + dx / distance * step,
            y: position.y + dy / distance * step,
          }, activeObstacles);
          position.x = constrained.x;
          position.y = constrained.y;
        }
      }

      const moving = keyboardX !== 0 || keyboardY !== 0 || Math.hypot(target.x - position.x, target.y - position.y) > .12;
      const direction = keyboardX < 0 || (!keyboardX && target.x < position.x) ? -1 : 1;
      const depthScale = .52 + (position.y - 23) / 68 * .78;
      if (playerRef.current) {
        playerRef.current.style.left = `${position.x}%`;
        playerRef.current.style.top = `${position.y}%`;
        playerRef.current.style.setProperty("--world-player-scale", depthScale.toFixed(3));
        playerRef.current.style.setProperty("--world-player-direction", String(direction));
      }
      if (playerSpriteRef.current) {
        const row = moving ? 0 : 2;
        const column = Math.floor(time / (moving ? 105 : 300)) % playerMascot.columns;
        playerSpriteRef.current.style.backgroundSize = `${playerMascot.columns * 100}% 400%`;
        playerSpriteRef.current.style.backgroundPosition = `${column * 100 / (playerMascot.columns - 1)}% ${row * 100 / 3}%`;
      }

      if (moving && playerRef.current) {
        playerRef.current.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
      }
      frame = window.requestAnimationFrame(animate);
    };

    const keyDown = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d"].includes(event.key)) {
        event.preventDefault();
        pressedKeys.current.add(event.key);
      }
    };
    const keyUp = (event: KeyboardEvent) => pressedKeys.current.delete(event.key);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    frame = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [activePackId, playerMascot.columns]);

  const moveWorld = (direction: -1 | 1) => {
    panBy(direction * window.innerWidth * .68);
  };

  const exitProfile = async () => {
    await logout();
    navigate("/profiles", { replace: true });
  };

  return (
    <section className="game-home explorable-home">
      <header className="player-hud adventure-hud">
        <div className="player-hud__actions">
          <Link className="world-star-counter" to="/store" aria-label={`Abrir la tienda. Tienes ${balance} estrellas`}>
            <span className="world-star-counter__coin" aria-hidden="true"><Star fill="currentColor" /></span>
            <strong>{balance}</strong>
          </Link>
          {installPrompt && (
            <button
              className="round-action adventure-install"
              type="button"
              aria-label="Instalar aplicación"
              onClick={() => void installPrompt.prompt().then(() => installPrompt.userChoice).finally(() => setInstallPrompt(undefined))}
            >
              <Download size={18} />
            </button>
          )}
        </div>
      </header>

      <main className="world-explorer" aria-label="Habitación creativa explorable">
        <div
          ref={viewportRef}
          className={`world-explorer__viewport${isDragging ? " is-dragging" : ""}`}
          {...viewportHandlers}
        >
          <div ref={sceneRef} className="world-explorer__scene" data-pack={activePackId} style={{ backgroundImage: `url(${worldBackground})` }}>
            <button
              className="world-exit-hotspot"
              type="button"
              aria-label="Salir del perfil y volver a la selección de perfiles"
              style={conceptWorld ? { left: `${conceptWorld.exit.x}%`, top: `${conceptWorld.exit.y}%`, width: "12%", height: "18%" } : undefined}
              onPointerDown={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onClick={() => void exitProfile()}
            />
            <Link
              className="world-settings-hotspot"
              to="/settings"
              aria-label="Abrir ajustes"
              style={conceptWorld ? { left: `${conceptWorld.settings.x}%`, top: `${conceptWorld.settings.y}%`, width: "12%", height: "18%" } : undefined}
              onPointerDown={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
            />
            {worldDestinations.map((destination) => (
              <Link
                key={destination.id}
                className={`world-destination world-destination--${destination.id}${focusedDestinationId === destination.id ? " is-focused" : ""}`}
                to={destination.to}
                aria-label={`${destination.short}: ${destination.title}`}
                style={{ left: `${destination.x}%`, top: `${destination.y}%` }}
                onFocus={() => setFocusedDestinationId(destination.id)}
              >
                <span className="visually-hidden">Entrar en {destination.title}</span>
              </Link>
            ))}
            {mascotVisible && (
              <div ref={playerRef} className="world-player" role="img" aria-label={`${playerMascot.label}, personaje del mundo`}>
                <span ref={playerSpriteRef} className="world-player__sprite" style={{ backgroundImage: `url(${playerMascot.url})` }} />
                <i className="world-player__shadow" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>

        <button className="world-explorer__arrow world-explorer__arrow--left" type="button" aria-label="Explorar hacia la izquierda" onClick={() => moveWorld(-1)}>
          <ChevronLeft />
        </button>
        <button className="world-explorer__arrow world-explorer__arrow--right" type="button" aria-label="Explorar hacia la derecha" onClick={() => moveWorld(1)}>
          <ChevronRight />
        </button>

        <p className="world-explorer__hint">Toca el suelo o usa las flechas para moverte · Arrastra para explorar · Pellizca para ampliar</p>
      </main>
    </section>
  );
}
