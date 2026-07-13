import { PageHeader } from "../../shared/ui/PageHeader";

export default function TimelapsePage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Timelapse"
        title="Tu crecimiento en fotos"
        description="Reproductor por perfil con rango, velocidad y control de object URLs."
      />

      <div className="media-placeholder">Sin fotos todavia</div>
    </section>
  );
}
