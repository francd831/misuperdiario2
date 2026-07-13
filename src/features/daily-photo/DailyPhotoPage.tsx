import { Camera, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../shared/ui/PageHeader";

export default function DailyPhotoPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Foto diaria"
        title="Una foto para recordar el dia"
        description="La beta limitara una foto activa al dia por perfil, reemplazable si admin lo permite."
        action={
          <Link className="icon-action" to="/daily-photo/timelapse" aria-label="Abrir timelapse">
            <Play size={18} />
          </Link>
        }
      />

      <section className="empty-state">
        <Camera size={32} />
        <h2>Camara pendiente</h2>
        <p>La captura, captions, stickers y miniaturas entran en la fase de media.</p>
      </section>
    </section>
  );
}
