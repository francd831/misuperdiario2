import { useParams } from "react-router-dom";
import { PageHeader } from "../../shared/ui/PageHeader";

const labels: Record<string, string> = {
  video: "Nueva entrada de video",
  audio: "Nueva entrada de voz",
  text: "Nueva entrada de texto",
};

export default function RecordPage() {
  const { type = "text" } = useParams();

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Crear recuerdo"
        title={labels[type] ?? "Nueva entrada"}
        description="En Fase 3 conectaremos permisos, limites diarios, grabacion y guardado local."
      />

      <section className="status-panel">
        <h2>Controles previstos</h2>
        <p>
          Duracion maxima, capsula del tiempo, stickers y validacion de almacenamiento
          se aplicaran antes de guardar.
        </p>
      </section>
    </section>
  );
}
