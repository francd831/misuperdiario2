import { Camera, ChevronRight, Clapperboard, LogOut, Mic, PenLine, ShoppingBag, Sparkles, Star, Trophy, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { achievementService } from "../../core/achievements/achievementService";
import type { ProfileAchievement } from "../../core/achievements/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { walletService } from "../../core/wallet/walletService";

const actions = [
  {
    to: "/record/video",
    title: "Video",
    description: "Graba una mini pelicula",
    icon: <Video size={38} />,
    prop: <Clapperboard size={30} />,
    className: "tool-button--berry",
    sceneClass: "tool-scene--video",
    reward: "+15",
  },
  {
    to: "/record/audio",
    title: "Voz",
    description: "Cuenta algo de hoy",
    icon: <Mic size={38} />,
    className: "tool-button--sun",
    sceneClass: "tool-scene--voice",
    reward: "+10",
  },
  {
    to: "/record/text",
    title: "Escribir",
    description: "Escribe un recuerdo",
    icon: <PenLine size={38} />,
    className: "tool-button--mint",
    sceneClass: "tool-scene--write",
    reward: "+10",
  },
  {
    to: "/daily-photo",
    title: "Foto",
    description: "Captura el dia",
    icon: <Camera size={38} />,
    className: "tool-button--sky",
    sceneClass: "tool-scene--photo",
    reward: "+10",
  },
];

export default function HomePage() {
  const { activeProfile, logout } = useProfiles();
  const [balance, setBalance] = useState(0);
  const [achievements, setAchievements] = useState<ProfileAchievement[]>([]);

  useEffect(() => {
    if (!activeProfile) return;
    let alive = true;

    void Promise.all([
      walletService.getBalance(activeProfile.id),
      achievementService.listUnlocked(activeProfile.id),
    ]).then(([nextBalance, nextAchievements]) => {
      if (!alive) return;
      setBalance(nextBalance);
      setAchievements(nextAchievements);
    }).catch(() => {
      if (!alive) return;
      setBalance(0);
      setAchievements([]);
    });

    return () => {
      alive = false;
    };
  }, [activeProfile]);

  const playerInitial = activeProfile?.name.slice(0, 1).toUpperCase() ?? "?";

  return (
    <section className="game-home">
      <header className="player-hud">
        <div className="player-hud__profile">
          <span className="player-avatar" style={{ background: activeProfile?.avatarColor }}>
            {playerInitial}
          </span>
          <div>
            <p className="eyebrow">Base secreta</p>
            <h1>{`Hola${activeProfile ? `, ${activeProfile.name}` : ""}`}</h1>
          </div>
        </div>

        <div className="player-hud__actions">
          <Link className="coin-badge" to="/store" aria-label={`${balance} estrellas disponibles`}>
            <Star size={22} fill="currentColor" />
            <strong>{balance}</strong>
          </Link>
          <button className="round-action" type="button" aria-label="Salir" onClick={() => void logout()}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <section className="daily-quest">
        <div className="daily-quest__copy">
          <span className="quest-kicker"><Sparkles size={16} /> Mision de hoy</span>
          <h2>Guarda un recuerdo y gana estrellas</h2>
          <p>Elige una herramienta, crea algo tuyo y desbloquea progreso para tu diario.</p>
        </div>
        <Link className="quest-reward" to="/daily-photo">
          <span>Recompensa</span>
          <strong><Star size={18} fill="currentColor" /> +10</strong>
        </Link>
      </section>

      <nav className="tool-grid" aria-label="Herramientas para crear recuerdos">
        {actions.map((action) => (
          <Link key={action.to} to={action.to} className={`tool-button ${action.className}`}>
            <span className="tool-button__reward">
              <Star size={13} fill="currentColor" /> {action.reward}
            </span>
            <span className={`tool-scene ${action.sceneClass}`} aria-hidden="true">
              <span className="tool-scene__spotlight" />
              <span className="tool-scene__avatar">{playerInitial}</span>
              <span className="tool-scene__main">{action.icon}</span>
              {action.prop && <span className="tool-scene__prop">{action.prop}</span>}
              <span className="tool-scene__line tool-scene__line--one" />
              <span className="tool-scene__line tool-scene__line--two" />
            </span>
            <span className="tool-button__copy">
              <span className="tool-button__title">{action.title}</span>
              <span className="tool-button__description">{action.description}</span>
            </span>
          </Link>
        ))}
      </nav>

      <section className="progress-strip" aria-label="Progreso">
        <Link className="progress-token progress-token--shop" to="/store">
          <ShoppingBag size={22} />
          <span>Tienda</span>
          <ChevronRight size={18} />
        </Link>
        <div className="progress-token">
          <Trophy size={22} />
          <span>{achievements.length} logros</span>
        </div>
        <div className="progress-token">
          <Star size={22} fill="currentColor" />
          <span>{balance} estrellas</span>
        </div>
      </section>
    </section>
  );
}
