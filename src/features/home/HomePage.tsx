import { Download, LogOut, RotateCcw, Star } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MASCOT_ARRIVED_EVENT,
  MASCOT_TRAVEL_EVENT,
  type MascotTravelDetail,
} from "../../app/mascot/FloatingMascot";
import adventureMap from "../../assets/home/adventure-map-premium.webp";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { walletService } from "../../core/wallet/walletService";
import { ProfileAvatar } from "../../shared/ui/ProfileAvatar";

const worlds = [
  { id: "video", to: "/record/video", title: "Vídeo", className: "adventure-world--video", reward: "+15" },
  { id: "voice", to: "/record/audio", title: "Voz", className: "adventure-world--voice", reward: "+10" },
  { id: "write", to: "/record/text", title: "Escribir", className: "adventure-world--write", reward: "+10" },
  { id: "photo", to: "/daily-photo", title: "Foto", className: "adventure-world--photo", reward: "+10" },
];

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function HomePage() {
  const { activeProfile, logout } = useProfiles();
  const navigate = useNavigate();
  const navigationTimer = useRef<number>();
  const pendingRoute = useRef<string>();
  const [balance, setBalance] = useState(0);
  const [travellingTo, setTravellingTo] = useState<string>();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent>();

  useEffect(() => {
    if (!activeProfile) return;
    let alive = true;
    void walletService.getBalance(activeProfile.id).then((nextBalance) => {
      if (alive) setBalance(nextBalance);
    }).catch(() => {
      if (alive) setBalance(0);
    });
    return () => { alive = false; };
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
    const handleArrival = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string }>).detail;
      if (!pendingRoute.current || detail.id !== travellingTo) return;
      window.clearTimeout(navigationTimer.current);
      navigate(pendingRoute.current);
    };
    window.addEventListener(MASCOT_ARRIVED_EVENT, handleArrival);
    return () => {
      window.removeEventListener(MASCOT_ARRIVED_EVENT, handleArrival);
      window.clearTimeout(navigationTimer.current);
    };
  }, [navigate, travellingTo]);

  const visitWorld = (event: MouseEvent<HTMLButtonElement>, world: (typeof worlds)[number]) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pendingRoute.current = world.to;
    setTravellingTo(world.id);
    window.dispatchEvent(new CustomEvent<MascotTravelDetail>(MASCOT_TRAVEL_EVENT, {
      detail: { id: world.id, x: bounds.left + bounds.width / 2, y: bounds.bottom - 18 },
    }));
    window.clearTimeout(navigationTimer.current);
    navigationTimer.current = window.setTimeout(() => navigate(world.to), 2600);
  };

  return (
    <section className="game-home adventure-home">
      <div className="rotate-device" role="status">
        <span className="rotate-device__phone"><RotateCcw aria-hidden="true" size={30} /></span>
        <strong>Gira el móvil</strong>
        <span>La aventura se juega en horizontal</span>
      </div>

      <header className="player-hud adventure-hud">
        <div className="player-hud__profile">
          {activeProfile ? <ProfileAvatar profile={activeProfile} className="player-avatar" /> : <span className="player-avatar">?</span>}
          <h1>{`Hola${activeProfile ? `, ${activeProfile.name}` : ""}`}</h1>
        </div>
        <div className="player-hud__actions">
          {installPrompt && (
            <button
              className="round-action adventure-install"
              type="button"
              aria-label="Instalar aplicación"
              onClick={() => {
                void installPrompt.prompt().then(() => installPrompt.userChoice).finally(() => setInstallPrompt(undefined));
              }}
            >
              <Download size={18} />
            </button>
          )}
          <Link className="coin-badge" to="/store" aria-label={`${balance} estrellas disponibles`}>
            <Star size={19} fill="currentColor" /><strong>{balance}</strong>
          </Link>
          <button className="round-action" type="button" aria-label="Salir" onClick={() => void logout()}><LogOut size={18} /></button>
        </div>
      </header>

      <main className="adventure-board adventure-board--premium" aria-label="Mapa de mundos de Mi Súper Diario" style={{ "--adventure-map": `url(${adventureMap})` } as CSSProperties}>
        {worlds.map((world, index) => (
          <button
            key={world.id}
            type="button"
            className={`adventure-world ${world.className} ${travellingTo === world.id ? "is-destination" : ""}`}
            onClick={(event) => visitWorld(event, world)}
            aria-label={`Ir al mundo ${world.title}`}
            style={{ "--world-order": index } as CSSProperties}
          >
            <span className="adventure-world__pin" aria-hidden="true"><i /></span>
            <span className="adventure-world__name">{world.title}</span>
            <span className="adventure-world__reward"><Star size={11} fill="currentColor" />{world.reward}</span>
          </button>
        ))}
      </main>
    </section>
  );
}
