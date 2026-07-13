import { Camera, Mic, PenLine, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { FeatureCard } from "../../shared/ui/FeatureCard";
import { PageHeader } from "../../shared/ui/PageHeader";

const actions = [
  { to: "/record/video", title: "Grabar video", description: "Hasta el limite configurado por admin.", icon: <Video size={24} />, tone: "berry" as const },
  { to: "/record/audio", title: "Grabar voz", description: "Mensajes de audio cortos y privados.", icon: <Mic size={24} />, tone: "sun" as const },
  { to: "/record/text", title: "Escribir", description: "Texto libre y capsulas del tiempo.", icon: <PenLine size={24} />, tone: "mint" as const },
  { to: "/daily-photo", title: "Foto diaria", description: "Una foto al dia para el timelapse.", icon: <Camera size={24} />, tone: "sky" as const },
];

export default function HomePage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Inicio"
        title="Que quieres guardar hoy?"
        description="Accesos principales del diario infantil. En Fase 2 se conectara al perfil activo."
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
