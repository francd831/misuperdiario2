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
  { to: "/record/video", title: "Grabar video", description: "Hasta el limite configurado por admin.", icon: <Video size={24} />, tone: "berry" as const },
  { to: "/record/audio", title: "Grabar voz", description: "Mensajes de audio cortos y privados.", icon: <Mic size={24} />, tone: "sun" as const },
  { to: "/record/text", title: "Escribir", description: "Texto libre y capsulas del tiempo.", icon: <PenLine size={24} />, tone: "mint" as const },
  { to: "/daily-photo", title: "Foto diaria", description: "Una foto al dia para el timelapse.", icon: <Camera size={24} />, tone: "sky" as const },
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
        eyebrow="Inicio"
        title={`Hola${activeProfile ? `, ${activeProfile.name}` : ""}`}
        description="Que quieres guardar hoy?"
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
        />
        <FeatureCard
          title={`${achievements.length} logros`}
          description="Los logros dan estrellas una sola vez."
          icon={<Trophy size={24} />}
          tone="mint"
        />
      </div>
    </section>
  );
}
