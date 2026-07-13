import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { entryRepository } from "../../core/diary/entryRepository";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { storagePolicyRepository } from "../../core/settings/storagePolicyRepository";
import type { StoragePolicy } from "../../core/profiles/types";
import { PageHeader } from "../../shared/ui/PageHeader";

const labels: Record<string, string> = {
  video: "Nueva entrada de video",
  audio: "Nueva entrada de voz",
  text: "Nueva entrada de texto",
};

export default function RecordPage() {
  const navigate = useNavigate();
  const { type = "text" } = useParams();
  const { activeProfile } = useProfiles();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [unlockAt, setUnlockAt] = useState("");
  const [policy, setPolicy] = useState<StoragePolicy | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void storagePolicyRepository.get().then(setPolicy);
  }, []);

  async function handleTextSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!activeProfile) {
      setError("Selecciona un perfil antes de guardar.");
      return;
    }

    if (!note.trim()) {
      setError("Escribe algo para guardar el recuerdo.");
      return;
    }

    if (isLocked && !unlockAt) {
      setError("Elige una fecha para la capsula del tiempo.");
      return;
    }

    await entryRepository.createTextEntry({
      profileId: activeProfile.id,
      title,
      note,
      isLocked,
      unlockAt: isLocked ? new Date(unlockAt).toISOString() : undefined,
    });

    navigate("/diary");
  }

  if (type !== "text") {
    const maxSeconds = type === "video" ? policy?.maxVideoSeconds : policy?.maxAudioSeconds;
    const dailyMax = type === "video" ? policy?.maxVideosPerDay : policy?.maxAudiosPerDay;

    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Crear recuerdo"
          title={labels[type] ?? "Nueva entrada"}
          description="La grabacion real se implementara despues de dejar cerrados limites y almacenamiento."
        />

        <section className="status-panel">
          <h2>Limites configurados</h2>
          <p>
            Duracion maxima: {maxSeconds ?? "-"} segundos. Maximo diario por perfil: {dailyMax ?? "-"}.
          </p>
        </section>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Crear recuerdo"
        title={labels.text}
        description="Guarda una entrada escrita en el perfil activo. Las capsulas quedaran bloqueadas hasta su fecha."
      />

      <form className="form-panel" onSubmit={handleTextSubmit}>
        <label>
          Titulo
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Opcional" />
        </label>

        <label>
          Texto
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Escribe que quieres recordar de hoy"
            rows={8}
            required
          />
        </label>

        <label className="inline-check">
          <input type="checkbox" checked={isLocked} onChange={(event) => setIsLocked(event.target.checked)} />
          Capsula del tiempo
        </label>

        {isLocked && (
          <label>
            Fecha de desbloqueo
            <input value={unlockAt} onChange={(event) => setUnlockAt(event.target.value)} type="date" />
          </label>
        )}

        {error && <p className="form-error">{error}</p>}

        <button className="primary-action" type="submit">
          Guardar recuerdo
        </button>
      </form>
    </section>
  );
}
