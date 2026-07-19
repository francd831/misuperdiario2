import { BookOpen, Download, LogOut, RotateCcw, Settings, Star } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import adventureMap from "../../assets/home/adventure-map-premium.webp";
import creativeRoom from "../../assets/home/creative-room-base.webp";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { walletService } from "../../core/wallet/walletService";
import { ProfileAvatar } from "../../shared/ui/ProfileAvatar";

const adventureWorlds = [
  { id: "video", to: "/record/video", title: "Cine de los recuerdos", action: "Vídeo", className: "adventure-world--video" },
  { id: "voice", to: "/record/audio", title: "El rincón de las voces", action: "Voz", className: "adventure-world--voice" },
  { id: "write", to: "/record/text", title: "La casa de las historias", action: "Escribir", className: "adventure-world--write" },
  { id: "photo", to: "/daily-photo", title: "Mirador de las fotos", action: "Foto", className: "adventure-world--photo" },
];

const basicWorlds: typeof adventureWorlds = [
  { id: "video", to: "/record/video", title: "El mini cine", action: "Vídeo", className: "adventure-world--video" },
  { id: "voice", to: "/record/audio", title: "Estudio de voz", action: "Voz", className: "adventure-world--voice" },
  { id: "write", to: "/record/text", title: "Mesa de historias", action: "Escribir", className: "adventure-world--write" },
  { id: "photo", to: "/daily-photo", title: "Rincón de fotos", action: "Foto", className: "adventure-world--photo" },
];

const basicScene = { id: "room", background: creativeRoom, worlds: basicWorlds } as const;
const homeScenes = {
  aventuraPirata: { id: "pirate", background: adventureMap, worlds: adventureWorlds },
} as const;

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function HomePage() {
  const { activeProfile, logout } = useProfiles();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent>();
  const scene = activeProfile?.activePackId === "aventuraPirata" ? homeScenes.aventuraPirata : basicScene;

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
          <Link className="round-action" to="/diary" aria-label="Diario"><BookOpen size={19} /></Link>
          <Link className="coin-badge" to="/store" aria-label={`${balance} estrellas disponibles`}>
            <Star size={19} fill="currentColor" /><strong>{balance}</strong>
          </Link>
          <Link className="round-action" to="/settings" aria-label="Ajustes"><Settings size={18} /></Link>
          <button className="round-action" type="button" aria-label="Salir" onClick={() => void logout()}><LogOut size={18} /></button>
        </div>
      </header>

      <main className={`adventure-board adventure-board--premium adventure-board--${scene.id}`} aria-label="Mundos de Mi Súper Diario" style={{ "--adventure-map": `url(${scene.background})` } as CSSProperties}>
        <div className="adventure-map-stage">
          {scene.worlds.map((world, index) => (
            <button
              key={world.id}
              type="button"
              className={`adventure-world ${world.className}`}
              onClick={() => navigate(world.to)}
              aria-label={`${world.action}: ${world.title}`}
              style={{ "--world-order": index } as CSSProperties}
            />
          ))}
        </div>
      </main>
    </section>
  );
}
