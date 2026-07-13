import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Circle, Square } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { achievementService } from "../../core/achievements/achievementService";
import { entryRepository } from "../../core/diary/entryRepository";
import type { EntryType } from "../../core/diary/types";
import { getMediaConstraints, getSupportedRecordingMimeType } from "../../core/media/recording";
import { useProfiles } from "../../core/profiles/ProfileContext";
import type { StoragePolicy } from "../../core/profiles/types";
import { storagePolicyRepository } from "../../core/settings/storagePolicyRepository";
import { useObjectUrl } from "../../shared/hooks/useObjectUrl";
import { PageHeader } from "../../shared/ui/PageHeader";

const labels: Record<string, string> = {
  video: "Nueva entrada de video",
  audio: "Nueva entrada de voz",
  text: "Nueva entrada de texto",
};

function formatSeconds(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function RecordPage() {
  const navigate = useNavigate();
  const { type = "text" } = useParams();
  const entryType: EntryType = type === "audio" || type === "video" ? type : "text";
  const { activeProfile } = useProfiles();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [unlockAt, setUnlockAt] = useState("");
  const [policy, setPolicy] = useState<StoragePolicy | null>(null);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const previewUrl = useObjectUrl(mediaBlob);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    void storagePolicyRepository.get().then(setPolicy);
  }, []);

  useEffect(() => {
    if (!activeProfile || entryType === "text") return;
    void entryRepository.countTodayByType(activeProfile.id, entryType).then(setDailyCount);
  }, [activeProfile, entryType]);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    setRecording(false);
  }, []);

  useEffect(() => {
    if (!recording) return undefined;
    const maxSeconds = entryType === "video" ? policy?.maxVideoSeconds : policy?.maxAudioSeconds;
    const timer = window.setInterval(() => {
      setElapsed((current) => {
        const next = current + 1;
        if (maxSeconds && next >= maxSeconds) {
          window.setTimeout(stopRecording, 0);
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [entryType, policy?.maxAudioSeconds, policy?.maxVideoSeconds, recording, stopRecording]);

  useEffect(() => () => stopTracks(), [stopTracks]);

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
    await achievementService.syncProfile(activeProfile.id);

    navigate("/diary");
  }

  async function startRecording() {
    setError("");
    if (!activeProfile || entryType === "text" || !policy) return;

    const dailyMax = entryType === "video" ? policy.maxVideosPerDay : policy.maxAudiosPerDay;
    if (dailyCount >= dailyMax) {
      setError(`Ya alcanzaste el maximo diario de ${entryType === "video" ? "videos" : "audios"}.`);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Este navegador no permite grabar desde la web.");
      return;
    }

    try {
      const mimeType = getSupportedRecordingMimeType(entryType);
      const stream = await navigator.mediaDevices.getUserMedia(
        getMediaConstraints(entryType, entryType === "video" ? policy.videoQuality : "medium"),
      );
      streamRef.current = stream;
      chunksRef.current = [];

      if (entryType === "video" && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        await videoPreviewRef.current.play();
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || chunksRef.current[0]?.type || "application/octet-stream" });
        setMediaBlob(blob);
        stopTracks();
      };

      recorderRef.current = recorder;
      setElapsed(0);
      setMediaBlob(null);
      recorder.start(1000);
      setRecording(true);
    } catch {
      stopTracks();
      setError(entryType === "video" ? "No se pudo acceder a la camara." : "No se pudo acceder al microfono.");
    }
  }

  async function saveMediaEntry() {
    setError("");
    if (!activeProfile || entryType === "text" || !mediaBlob) return;

    if (isLocked && !unlockAt) {
      setError("Elige una fecha para la capsula del tiempo.");
      return;
    }

    await entryRepository.createMediaEntry({
      profileId: activeProfile.id,
      type: entryType,
      title,
      note,
      durationSeconds: elapsed,
      mediaBlob,
      isLocked,
      unlockAt: isLocked ? new Date(unlockAt).toISOString() : undefined,
    });
    await achievementService.syncProfile(activeProfile.id);

    navigate("/diary");
  }

  if (entryType !== "text") {
    const maxSeconds = entryType === "video" ? policy?.maxVideoSeconds : policy?.maxAudioSeconds;
    const dailyMax = entryType === "video" ? policy?.maxVideosPerDay : policy?.maxAudiosPerDay;

    return (
      <section className="page-stack">
        <PageHeader
          eyebrow="Crear recuerdo"
          title={labels[entryType]}
          description="La grabacion respeta los limites diarios y de duracion configurados por administracion."
        />

        <section className="status-panel">
          <h2>Limites configurados</h2>
          <p>
            Duracion maxima: {maxSeconds ?? "-"} segundos. Usados hoy: {dailyCount}/{dailyMax ?? "-"}.
          </p>
        </section>

        <section className="recorder-panel">
          {entryType === "video" ? (
            <video ref={videoPreviewRef} src={previewUrl} controls={Boolean(previewUrl)} muted={recording} playsInline />
          ) : previewUrl ? (
            <audio src={previewUrl} controls />
          ) : (
            <div className="audio-placeholder">Listo para grabar voz</div>
          )}

          <p className="recorder-panel__timer">
            {formatSeconds(elapsed)}
            {maxSeconds ? ` / ${formatSeconds(maxSeconds)}` : ""}
          </p>

          <div className="recorder-panel__actions">
            {!recording ? (
              <button className="primary-action" type="button" onClick={() => void startRecording()}>
                <Circle size={18} fill="currentColor" /> Grabar
              </button>
            ) : (
              <button className="secondary-action" type="button" onClick={stopRecording}>
                <Square size={18} fill="currentColor" /> Detener
              </button>
            )}
            {mediaBlob && (
              <button className="secondary-action" type="button" onClick={() => setMediaBlob(null)}>
                Repetir
              </button>
            )}
          </div>
        </section>

        {mediaBlob && (
          <form className="form-panel" onSubmit={(event) => { event.preventDefault(); void saveMediaEntry(); }}>
            <label>
              Titulo
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Opcional" />
            </label>
            <label>
              Nota
              <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Opcional" rows={3} />
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
        )}

        {error && !mediaBlob && <p className="form-error">{error}</p>}
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
