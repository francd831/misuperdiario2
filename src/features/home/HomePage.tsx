import { Camera, Mic, PenLine, Star, Trophy, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { achievementService } from "../../core/achievements/achievementService";
import type { ProfileAchievement } from "../../core/achievements/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { walletService } from "../../core/wallet/walletService";
import { FeatureCard } from "../../shared/ui/FeatureCard";
import { PageHeader } from "../../shared/ui/PageHeader";

const actions = [
  { to: "/record/video", title: "Video", description: "Guarda una mini pelicula de hoy.", icon: <Video size={28} />, tone: "berry" as const, badge: "accion" },
  { to: "/record/audio", title: "Voz", description: "Cuenta algo con tus propias palabras.", icon: <Mic size={28} />, tone: "sun" as const, badge: "sonido" },
  { to: "/record/text", title: "Escribir", description: "Una idea, un secreto o una capsula.", icon: <PenLine size={28} />, tone: "mint" as const, badge: "diario" },
  { to: "/daily-photo", title: "Foto diaria", description: "Una imagen para ver como cambia el tiempo.", icon: <Camera size={28} />, tone: "sky" as const, badge: "hoy" },
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

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Tu espacio"
        title={`Hola${activeProfile ? `, ${activeProfile.name}` : ""}`}
        description="Elige una forma de guardar el recuerdo de hoy."
        action={
          <button className="secondary-action" type="button" onClick={() => void logout()}>
            Salir
          </button>
        }
      />

      <div className="action-grid">
        {actions.map((action) => (
          <Link key={action.to} to={action.to} className="card-link">
            <FeatureCard {...action} />
          </Link>
        ))}
      </div>

      <div className="grid-two">
        <FeatureCard
          title={`${balance} estrellas`}
          description="Usalas para comprar packs en la tienda."
          icon={<Star size={24} />}
          tone="sun"
          badge="monedero"
        />
        <FeatureCard
          title={`${achievements.length} logros`}
          description="Los logros dan estrellas una sola vez."
          icon={<Trophy size={24} />}
          tone="mint"
          badge="progreso"
        />
      </div>
    </section>
  );
}
