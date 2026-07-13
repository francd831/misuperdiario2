import { Camera, Mic, PenLine, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useProfiles } from "../../core/profiles/ProfileContext";
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

      <section className="status-panel">
        <h2>Estado beta</h2>
        <p>Racha, estrellas y ultimos recuerdos apareceran aqui cuando conectemos persistencia.</p>
      </section>
    </section>
  );
}
