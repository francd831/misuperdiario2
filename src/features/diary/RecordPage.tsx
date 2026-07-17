import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { LockKeyhole, Mic, Pause, PenLine, Play, RotateCcw, Save, Square, Trash2, Video, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { achievementService } from "../../core/achievements/achievementService";
import { entryRepository } from "../../core/diary/entryRepository";
import type { DiaryEntry, EntryType } from "../../core/diary/types";
import { getMediaConstraints, getSupportedRecordingMimeType } from "../../core/media/recording";
import {
  addStickerOverlay,
  addVisualOverlay,
  clearOverlays,
  removeStickerOverlay,
  setFilterOverlay,
  setFrameOverlay,
  updateFrameOverlay,
  updateStickerOverlay,
} from "../../core/overlays/overlayProject";
import type { OverlayProject } from "../../core/overlays/types";
import { packService } from "../../core/packs/packService";
import type { PackAsset, PackWithAssets } from "../../core/packs/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
import type { StoragePolicy } from "../../core/profiles/types";
import { storagePolicyRepository } from "../../core/settings/storagePolicyRepository";
import { useObjectUrl } from "../../shared/hooks/useObjectUrl";
import { PageHeader } from "../../shared/ui/PageHeader";
import recordingMicrophone from "../../assets/recording-microphone.png";
import { FilterCanvas } from "../stickers/FilterCanvas";
import { FrameCanvas } from "../stickers/FrameCanvas";
import { StickerCanvas } from "../stickers/StickerCanvas";
import { VisualToolCarousel } from "../stickers/VisualToolCarousel";

const labels: Record<string, string> = {
  video: "Vídeo",
  audio: "Voz",
  text: "Escribir",
};

function formatSeconds(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function TodayVideoCard({ entry, packs, onDelete }: { entry: DiaryEntry; packs: PackWithAssets[]; onDelete: (entry: DiaryEntry) => void }) {
  const url = useObjectUrl(entry.mediaBlob);
  return (
    <article className="today-video-card">
      <div className="sticker-stage">
        {url && <video src={url} controls playsInline />}
        <FilterCanvas overlays={entry.overlayProject} packs={packs} />
        <StickerCanvas overlays={entry.overlayProject ?? []} packs={packs} />
        <FrameCanvas overlays={entry.overlayProject} packs={packs} />
      </div>
      <div className="today-video-card__info">
        <div>
          <strong>{entry.title || "Vídeo de hoy"}</strong>
          <small>{formatSeconds(entry.durationSeconds ?? 0)}{entry.note ? ` · ${entry.note}` : ""}</small>
        </div>
        <button className="danger-icon-action" type="button" onClick={() => onDelete(entry)} aria-label="Borrar vídeo">
          <Trash2 size={18} />
        </button>
      </div>
    </article>
  );
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
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [saveSheetOpen, setSaveSheetOpen] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [todayVideos, setTodayVideos] = useState<DiaryEntry[]>([]);
  const [packs] = useState<PackWithAssets[]>(() => packService.listPacks());
  const [overlays, setOverlays] = useState<OverlayProject>(clearOverlays());
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | "frame" | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const previewUrl = useObjectUrl(mediaBlob);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const activePack = packs.find((pack) => pack.manifest.id === activeProfile?.activePackId) ?? packs[0];

  useEffect(() => {
    void storagePolicyRepository.get().then(setPolicy);
  }, []);

  useEffect(() => {
    if (!activeProfile || entryType === "text") return;
    void entryRepository.countTodayByType(activeProfile.id, entryType).then(setDailyCount);
  }, [activeProfile, entryType]);

  const refreshTodayVideos = useCallback(async () => {
    if (!activeProfile || entryType !== "video") return;
    const date = new Date().toISOString().slice(0, 10);
    const videos = await entryRepository.listByProfileAndType(activeProfile.id, "video");
    setTodayVideos(videos.filter((entry) => entry.date === date));
    setDailyCount(videos.filter((entry) => entry.date === date).length);
  }, [activeProfile, entryType]);

  useEffect(() => {
    void refreshTodayVideos();
  }, [refreshTodayVideos]);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (entryType !== "video" || !previewUrl || !videoPreviewRef.current) return;
    const preview = videoPreviewRef.current;
    preview.srcObject = null;
    preview.load();
  }, [entryType, previewUrl]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording" || recorderRef.current?.state === "paused") {
      recorderRef.current.stop();
    }
    setRecording(false);
    setPaused(false);
  }, []);

  useEffect(() => {
    if (!recording || paused) return undefined;
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
  }, [entryType, paused, policy?.maxAudioSeconds, policy?.maxVideoSeconds, recording, stopRecording]);

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
      setError(`Ya alcanzaste el máximo diario de ${entryType === "video" ? "vídeos" : "audios"}.`);
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
        stopTracks();
        setMediaBlob(blob);
      };

      recorderRef.current = recorder;
      setElapsed(0);
      setMediaBlob(null);
      setSaveSheetOpen(false);
      setSelectedOverlayId(null);
      recorder.start(1000);
      setRecording(true);
      setPaused(false);
    } catch {
      stopTracks();
      setError(entryType === "video" ? "No se pudo acceder a la cámara." : "No se pudo acceder al micrófono.");
    }
  }

  function togglePause() {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state === "recording") {
      recorder.pause();
      setPaused(true);
    } else if (recorder.state === "paused") {
      recorder.resume();
      setPaused(false);
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
      overlayProject: entryType === "video" ? overlays : undefined,
      isLocked,
      unlockAt: isLocked ? new Date(unlockAt).toISOString() : undefined,
    });
    await achievementService.syncProfile(activeProfile.id);

    navigate("/diary");
  }

  function addSticker(sticker: PackAsset) {
    setOverlays((current) => {
      const next = addStickerOverlay(current, { packId: sticker.packId, assetId: sticker.id });
      setSelectedOverlayId(next.stickers.at(-1)?.id ?? null);
      return next;
    });
  }

  async function deleteVideo(entry: DiaryEntry) {
    if (!window.confirm("¿Quieres borrar este vídeo? No se podrá recuperar.")) return;
    await entryRepository.remove(entry.id);
    await refreshTodayVideos();
  }

  function selectFrame(frame: PackAsset) {
    setOverlays((current) => setFrameOverlay(current, { packId: frame.packId, assetId: frame.id }));
    setSelectedOverlayId("frame");
  }

  function selectFilter(filter: PackAsset) {
    setOverlays((current) => setFilterOverlay(current, { packId: filter.packId, assetId: filter.id, assetKind: "filters" }));
    setSelectedOverlayId(null);
  }

  function addPackAsset(asset: PackAsset, assetKind: "speechBubbles" | "stamps" | "masks" | "effects") {
    setOverlays((current) => {
      const next = addVisualOverlay(current, { packId: asset.packId, assetId: asset.id, assetKind });
      setSelectedOverlayId(next.stickers.at(-1)?.id ?? null);
      return next;
    });
  }

  if (entryType !== "text") {
    const maxSeconds = entryType === "video" ? policy?.maxVideoSeconds : policy?.maxAudioSeconds;
    const dailyMax = entryType === "video" ? policy?.maxVideosPerDay : policy?.maxAudiosPerDay;

    return (
      <section className={`page-stack record-page record-page--${entryType}`}>
        <PageHeader
          title={labels[entryType]}
          icon={entryType === "video" ? <Video size={22} /> : <Mic size={22} />}
          backTo="/home"
        />

        <section className={`capture-studio capture-studio--${entryType}`}>
          {entryType === "video" ? (
            <div className="video-viewfinder">
              <div className="video-viewfinder__meta">
                <span className={recording && !paused ? "is-live" : ""}>{recording ? (paused ? "En pausa" : "Grabando") : "Tu cámara"}</span>
                <span>{dailyCount}/{dailyMax ?? "-"} hoy</span>
              </div>
              <div className="sticker-stage">
                <video ref={videoPreviewRef} src={previewUrl} controls={Boolean(previewUrl)} muted={recording} playsInline />
              <FilterCanvas overlays={overlays} packs={packs} />
              <StickerCanvas
                overlays={overlays}
                packs={packs}
                editable
                selectedId={typeof selectedOverlayId === "string" && selectedOverlayId !== "frame" ? selectedOverlayId : undefined}
                onSelect={setSelectedOverlayId}
                onUpdate={(overlayId, patch) => setOverlays((current) => updateStickerOverlay(current, overlayId, patch))}
                onRemove={(overlayId) => {
                  setOverlays((current) => removeStickerOverlay(current, overlayId));
                  setSelectedOverlayId(null);
                }}
              />
              <FrameCanvas
                overlays={overlays}
                packs={packs}
                editable
                selected={selectedOverlayId === "frame"}
                onSelect={() => setSelectedOverlayId("frame")}
                onUpdate={(patch) => setOverlays((current) => updateFrameOverlay(current, patch))}
                onRemove={() => {
                  setOverlays((current) => setFrameOverlay(current));
                  setSelectedOverlayId(null);
                }}
              />
              </div>
            </div>
          ) : (
            <div className="voice-studio">
              <button
                className={`voice-studio__art ${recording && !paused ? "is-recording" : ""}`}
                type="button"
                onClick={() => recording ? stopRecording() : void startRecording()}
                aria-label={recording ? "Detener grabación de voz" : "Iniciar grabación de voz"}
                aria-pressed={recording}
              >
                <span className="voice-studio__wave" aria-hidden="true"><i /><i /><i /><i /><i /></span>
                <img src={recordingMicrophone} alt="" />
              </button>
              <div className="voice-studio__content">
                {(recording || mediaBlob) && <p className="voice-studio__state">{recording ? (paused ? "En pausa" : "Grabando") : "Grabación lista"}</p>}
                <p className="voice-studio__limit">Máximo {formatSeconds(maxSeconds ?? 0)} · {dailyCount}/{dailyMax ?? "-"} hoy</p>
                {previewUrl && <audio src={previewUrl} controls />}
              </div>
            </div>
          )}

          <div className="capture-controls">
            <p className="capture-controls__timer" aria-live="polite">
              {formatSeconds(elapsed)} <span>{maxSeconds ? `/ ${formatSeconds(maxSeconds)}` : ""}</span>
            </p>
            {entryType === "video" && (!recording && !mediaBlob ? (
              <button className="primary-action" type="button" onClick={() => void startRecording()}>
                <Video size={18} /> Grabar
              </button>
            ) : recording ? (
              <>
                <button className="secondary-action" type="button" onClick={togglePause}>
                  {paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />} {paused ? "Continuar" : "Pausa"}
                </button>
                <button className="capture-stop" type="button" onClick={stopRecording}>
                  <Square size={17} fill="currentColor" /> Detener
                </button>
              </>
            ) : null)}
            {entryType === "audio" && recording && (
              <button className="secondary-action" type="button" onClick={togglePause}>
                {paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />} {paused ? "Continuar" : "Pausa"}
              </button>
            )}
            {mediaBlob && (
              <>
                <button className="secondary-action" type="button" onClick={() => setMediaBlob(null)}>
                  <RotateCcw size={18} /> Repetir
                </button>
                <button className="primary-action" type="button" onClick={() => setSaveSheetOpen(true)}>
                  <Save size={18} /> Guardar
                </button>
              </>
            )}
          </div>
        </section>

        {entryType === "video" && (
          <VisualToolCarousel
            pack={activePack}
            onSticker={addSticker}
            onFrame={selectFrame}
            onFilter={selectFilter}
            onVisual={addPackAsset}
            onClearFrame={() => { setOverlays((current) => setFrameOverlay(current)); setSelectedOverlayId(null); }}
            onClearFilter={() => setOverlays((current) => setFilterOverlay(current))}
          />
        )}

        {entryType === "video" && todayVideos.length > 0 && (
          <section className="today-memories" aria-labelledby="today-videos-title">
            <div className="today-memories__header">
              <div><span>Hoy</span><h2 id="today-videos-title">Tus vídeos</h2></div>
              <strong>{todayVideos.length}</strong>
            </div>
            <div className="today-video-grid">
              {todayVideos.map((entry) => (
                <TodayVideoCard key={entry.id} entry={entry} packs={packs} onDelete={(item) => void deleteVideo(item)} />
              ))}
            </div>
          </section>
        )}

        {mediaBlob && saveSheetOpen && (
          <div className="save-sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSaveSheetOpen(false); }}>
            <section className="save-sheet" role="dialog" aria-modal="true" aria-labelledby="save-sheet-title">
              <div className="save-sheet__handle" aria-hidden="true" />
              <header className="save-sheet__header">
                <div>
                  <span className="save-sheet__icon"><Save size={20} /></span>
                  <div><h2 id="save-sheet-title">Guardar recuerdo</h2><p>Un último detalle antes de añadirlo al diario</p></div>
                </div>
                <button type="button" onClick={() => setSaveSheetOpen(false)} aria-label="Cerrar"><X size={20} /></button>
              </header>
              <form className="save-sheet__form" onSubmit={(event) => { event.preventDefault(); void saveMediaEntry(); }}>
                <label className="save-sheet__field">
                  <span>Título <small>opcional</small></span>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ponle un nombre a este momento" autoFocus />
                </label>
                <label className="save-sheet__field">
                  <span>Nota <small>opcional</small></span>
                  <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="¿Qué quieres recordar?" rows={3} />
                </label>
                <label className="save-sheet__lock">
                  <span className="save-sheet__lock-icon"><LockKeyhole size={20} /></span>
                  <span><strong>Cápsula del tiempo</strong><small>Ocúltalo hasta una fecha especial</small></span>
                  <input type="checkbox" checked={isLocked} onChange={(event) => setIsLocked(event.target.checked)} />
                </label>
                {isLocked && (
                  <label className="save-sheet__field save-sheet__date">
                    <span>Disponible el</span>
                    <input value={unlockAt} onChange={(event) => setUnlockAt(event.target.value)} type="date" />
                  </label>
                )}
                {error && <p className="form-error">{error}</p>}
                <button className="primary-action save-sheet__submit" type="submit"><Save size={18} /> Añadir al diario</button>
              </form>
            </section>
          </div>
        )}

        {error && !mediaBlob && <p className="form-error">{error}</p>}
      </section>
    );
  }

  return (
    <section className="page-stack record-page record-page--text">
      <PageHeader
        title={labels.text}
        icon={<PenLine size={22} />}
        backTo="/home"
      />

      <form className="diary-editor" onSubmit={handleTextSubmit}>
        <div className="diary-sheet">
          <div className="diary-sheet__binding" aria-hidden="true" />
          <p className="diary-sheet__date">{new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</p>
          <label className="visually-hidden" htmlFor="diary-title">Título</label>
          <input id="diary-title" className="diary-sheet__title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título de hoy" />
          <label className="visually-hidden" htmlFor="diary-note">Texto</label>
          <textarea
            id="diary-note"
            className="diary-sheet__note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Querido diario..."
            rows={12}
            required
          />
          <span className="diary-sheet__page">{note.length} letras</span>
        </div>

        <div className="diary-editor__footer">
          <label className="inline-check diary-lock">
            <input type="checkbox" checked={isLocked} onChange={(event) => setIsLocked(event.target.checked)} />
            Guardar en la cápsula del tiempo
          </label>

          {isLocked && (
            <label className="diary-unlock">
              Abrir el
              <input value={unlockAt} onChange={(event) => setUnlockAt(event.target.value)} type="date" />
            </label>
          )}

          {error && <p className="form-error">{error}</p>}

          <button className="primary-action" type="submit">
            <Save size={18} /> Guardar página
          </button>
        </div>
      </form>
    </section>
  );
}
