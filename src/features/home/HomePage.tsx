import { LogOut, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import actionPhoto from "../../assets/home/action-photo.webp";
import actionVideo from "../../assets/home/action-video.webp";
import actionVoice from "../../assets/home/action-voice.webp";
import actionWrite from "../../assets/home/action-write.webp";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { walletService } from "../../core/wallet/walletService";

const actions = [
  {
    to: "/record/video",
    title: "Video",
    description: "Graba una mini pelicula",
    image: actionVideo,
    className: "tool-button--berry",
    reward: "+15",
  },
  {
    to: "/record/audio",
    title: "Voz",
    description: "Cuenta algo de hoy",
    image: actionVoice,
    className: "tool-button--sun",
    reward: "+10",
  },
  {
    to: "/record/text",
    title: "Escribir",
    description: "Escribe un recuerdo",
    image: actionWrite,
    className: "tool-button--mint",
    reward: "+10",
  },
  {
    to: "/daily-photo",
    title: "Foto",
    description: "Captura el dia",
    image: actionPhoto,
    className: "tool-button--sky",
    reward: "+10",
  },
];

export default function HomePage() {
  const { activeProfile, logout } = useProfiles();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!activeProfile) return;
    let alive = true;

    void walletService.getBalance(activeProfile.id).then((nextBalance) => {
      if (!alive) return;
      setBalance(nextBalance);
    }).catch(() => {
      if (!alive) return;
      setBalance(0);
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
        <p className="daily-quest__copy">
          <span className="quest-kicker"><Sparkles size={16} /> Mision de hoy</span>
          <strong>Guarda un recuerdo</strong>
        </p>
        <Link className="quest-reward" to="/daily-photo">
          <strong><Star size={18} fill="currentColor" /> +10</strong>
        </Link>
      </section>

      <nav className="tool-grid" aria-label="Herramientas para crear recuerdos">
        {actions.map((action) => (
          <Link key={action.to} to={action.to} className={`tool-button ${action.className}`}>
            <span className="tool-button__reward">
              <Star size={13} fill="currentColor" /> {action.reward}
            </span>
            <span className="tool-scene" aria-hidden="true">
              <img className="tool-scene__image" src={action.image} alt="" />
              <span className="tool-button__copy">
                <span className="tool-button__title">{action.title}</span>
                <span className="tool-button__description">{action.description}</span>
              </span>
            </span>
          </Link>
        ))}
      </nav>

    </section>
  );
}
