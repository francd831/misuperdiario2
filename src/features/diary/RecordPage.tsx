import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Clapperboard, Film, LockKeyhole, Maximize2, Pause, Play, RotateCcw, Save, Square, Trash2, X } from "lucide-react";
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
import { getPackSceneBackgrounds } from "../../core/packs/sceneBackgrounds";
import type { PackAsset, PackWithAssets } from "../../core/packs/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
import type { StoragePolicy } from "../../core/profiles/types";
import { storagePolicyRepository } from "../../core/settings/storagePolicyRepository";
import { useObjectUrl } from "../../shared/hooks/useObjectUrl";
import { MemoryDrawer } from "../../shared/ui/MemoryDrawer";
import { FilterCanvas } from "../stickers/FilterCanvas";
import { FrameCanvas } from "../stickers/FrameCanvas";
import { StickerCanvas } from "../stickers/StickerCanvas";
import { VisualToolCarousel } from "../stickers/VisualToolCarousel";
import { SceneMascot } from "../../app/mascot/SceneMascot";
import { useRemotePacks } from "../../core/packs/RemotePackContext";

const sceneMascotPaths = {
  video: [{ x: 9, y: 82 }, { x: 8, y: 30 }, { x: 20, y: 14 }, { x: 80, y: 14 }, { x: 92, y: 30 }, { x: 91, y: 82 }],
  audio: [{ x: 8, y: 82 }, { x: 8, y: 23 }, { x: 20, y: 11 }, { x: 81, y: 11 }, { x: 92, y: 24 }, { x: 92, y: 82 }],
  text: [{ x: 8, y: 82 }, { x: 8, y: 22 }, { x: 21, y: 10 }, { x: 80, y: 10 }, { x: 92, y: 24 }, { x: 92, y: 82 }],
};

function formatSeconds(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function TodayVideoCard({ entry, packs, onDelete }: { entry: DiaryEntry; packs: PackWithAssets[]; onDelete: (entry: DiaryEntry) => void }) {
  const url = useObjectUrl(entry.mediaBlob);
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="today-video-card">
      <div className="sticker-stage">
        {url && <video src={url} controls playsInline />}
        <FilterCanvas overlays={entry.overlayProject} packs={packs} />
        <StickerCanvas overlays={entry.overlayProject ?? []} packs={packs} />
        <FrameCanvas overlays={entry.overlayProject} packs={packs} />
        <button className="memory-expand-button" type="button" onClick={() => setExpanded(true)} aria-label="Ampliar vídeo"><Maximize2 size={17} /></button>
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
      {expanded && url && (
        <div className="memory-lightbox" role="dialog" aria-modal="true" aria-label="Vídeo ampliado" onMouseDown={(event) => { if (event.target === event.currentTarget) setExpanded(false); }}>
          <button className="memory-lightbox__close" type="button" onClick={() => setExpanded(false)} aria-label="Cerrar"><X size={22} /></button>
          <div className="memory-lightbox__stage memory-lightbox__stage--video">
            <video src={url} controls autoPlay playsInline />
            <FilterCanvas overlays={entry.overlayProject} packs={packs} />
            <StickerCanvas overlays={entry.overlayProject ?? []} packs={packs} />
            <FrameCanvas overlays={entry.overlayProject} packs={packs} />
          </div>
        </div>
      )}
    </article>
  );
}

function TodayAudioCard({ entry, onDelete }: { entry: DiaryEntry; onDelete: (entry: DiaryEntry) => void }) {
  const url = useObjectUrl(entry.mediaBlob);
  return (
    <article className="memory-audio-card">
      <div><strong>{entry.title || "Voz de hoy"}</strong><small>{formatSeconds(entry.durationSeconds ?? 0)}{entry.note ? ` · ${entry.note}` : ""}</small></div>
      {url && <audio src={url} controls />}
      <button className="danger-icon-action" type="button" onClick={() => onDelete(entry)} aria-label="Borrar grabación"><Trash2 size={18} /></button>
    </article>
  );
}

export default function RecordPage() {
  const navigate = useNavigate();
  const { type = "text" } = useParams();
  const entryType: EntryType = type === "audio" || type === "video" ? type : "text";
  const { activeProfile } = useProfiles();
  const { packs, getResources } = useRemotePacks();
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
  const [savedEntryId, setSavedEntryId] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [effectsOpen, setEffectsOpen] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [todayVideos, setTodayVideos] = useState<DiaryEntry[]>([]);
  const [todayAudios, setTodayAudios] = useState<DiaryEntry[]>([]);
  const [textEntries, setTextEntries] = useState<DiaryEntry[]>([]);
  const [storyHistoryIndex, setStoryHistoryIndex] = useState(-1);
  const [memoriesOpen, setMemoriesOpen] = useState(false);
  const [overlays, setOverlays] = useState<OverlayProject>(clearOverlays());
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | "frame" | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const streamRequestRef = useRef(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const previewUrl = useObjectUrl(mediaBlob);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const activePack = packs.find((pack) => pack.manifest.id === activeProfile?.activePackId) ?? packs[0];
  const packId = activePack?.manifest.id;
  const sceneBackgrounds = getPackSceneBackgrounds(packId, getResources(packId).scenes);
  const videoSceneBackground = sceneBackgrounds.video;
  const voiceSceneBackground = sceneBackgrounds.voice;
  const storySceneBackground = sceneBackgrounds.writing;

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

  const refreshTodayAudios = useCallback(async () => {
    if (!activeProfile || entryType !== "audio") return;
    const date = new Date().toISOString().slice(0, 10);
    const audios = await entryRepository.listByProfileAndType(activeProfile.id, "audio");
    const today = audios.filter((entry) => entry.date === date);
    setTodayAudios(today);
    setDailyCount(today.length);
  }, [activeProfile, entryType]);

  useEffect(() => {
    void refreshTodayVideos();
  }, [refreshTodayVideos]);

  useEffect(() => {
    void refreshTodayAudios();
  }, [refreshTodayAudios]);

  useEffect(() => {
    if (!activeProfile || entryType !== "text") return;
    let alive = true;
    setStoryHistoryIndex(-1);
    void entryRepository.listByProfileAndType(activeProfile.id, "text").then((entries) => {
      const now = Date.now();
      const available = entries.filter((entry) => !entry.isLocked || Boolean(entry.unlockAt && new Date(entry.unlockAt).getTime() <= now));
      if (alive) {
        setTextEntries(available);
      }
    });
    return () => { alive = false; };
  }, [activeProfile, entryType]);

  const stopTracks = useCallback(() => {
    streamRequestRef.current += 1;
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

  const startVideoPreview = useCallback(async () => {
    if (entryType !== "video" || !policy || !navigator.mediaDevices?.getUserMedia) return;
    try {
      stopTracks();
      const requestId = ++streamRequestRef.current;
      const constraints = getMediaConstraints("video", policy.videoQuality);
      const stream = await navigator.mediaDevices.getUserMedia({ video: constraints.video, audio: false });
      if (requestId !== streamRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.muted = true;
        await videoPreviewRef.current.play();
      }
    } catch {
      setError("No se pudo acceder a la cámara.");
    }
  }, [entryType, policy, stopTracks]);

  useEffect(() => {
    if (entryType !== "video" || !policy) return;
    void startVideoPreview();
  }, [entryType, policy, startVideoPreview]);

  useEffect(() => {
    if (!saveSheetOpen || !window.visualViewport) return undefined;
    const viewport = window.visualViewport;
    const updateViewport = () => {
      document.documentElement.style.setProperty("--save-viewport-height", `${viewport.height}px`);
      document.documentElement.style.setProperty("--save-viewport-top", `${viewport.offsetTop}px`);
    };
    updateViewport();
    viewport.addEventListener("resize", updateViewport);
    viewport.addEventListener("scroll", updateViewport);
    return () => {
      viewport.removeEventListener("resize", updateViewport);
      viewport.removeEventListener("scroll", updateViewport);
      document.documentElement.style.removeProperty("--save-viewport-height");
      document.documentElement.style.removeProperty("--save-viewport-top");
    };
  }, [saveSheetOpen]);

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

    const savedEntry = await entryRepository.createTextEntry({
      profileId: activeProfile.id,
      title,
      note,
      isLocked: false,
      unlockAt: undefined,
    });
    await achievementService.syncProfile(activeProfile.id);
    setTextEntries((current) => [savedEntry, ...current]);
    setTitle("");
    setNote("");
    setStoryHistoryIndex(-1);
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
      if (entryType === "video") stopTracks();
      const requestId = ++streamRequestRef.current;
      const mimeType = getSupportedRecordingMimeType(entryType);
      const stream = await navigator.mediaDevices.getUserMedia(
        getMediaConstraints(entryType, entryType === "video" ? policy.videoQuality : "medium"),
      );
      if (requestId !== streamRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
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
      setSavedEntryId(undefined);
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

  async function quickSaveMediaEntry() {
    setError("");
    if (!activeProfile || entryType === "text" || !mediaBlob || saving) return;
    setSaving(true);
    try {
      const entry = await entryRepository.createMediaEntry({
        profileId: activeProfile.id,
        type: entryType,
        durationSeconds: elapsed,
        mediaBlob,
        overlayProject: entryType === "video" ? overlays : undefined,
      });
      setSavedEntryId(entry.id);
      setSaveSheetOpen(false);
      setDailyCount((count) => count + 1);
      if (entryType === "video") await refreshTodayVideos();
      if (entryType === "audio") await refreshTodayAudios();
      await achievementService.syncProfile(activeProfile.id);
    } catch {
      setError("No se pudo guardar el recuerdo.");
    } finally {
      setSaving(false);
    }
  }

  async function saveMediaDetails() {
    setError("");
    if (!savedEntryId) return;
    if (isLocked && !unlockAt) {
      setError("Elige una fecha para la capsula del tiempo.");
      return;
    }
    try {
      await entryRepository.updateDetails(savedEntryId, {
        title,
        note,
        isLocked,
        unlockAt: isLocked ? new Date(unlockAt).toISOString() : undefined,
      });
      setSaveSheetOpen(false);
      if (entryType === "video") await refreshTodayVideos();
      if (entryType === "audio") await refreshTodayAudios();
    } catch {
      setError("No se pudieron guardar los detalles.");
    }
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

  async function deleteAudio(entry: DiaryEntry) {
    if (!window.confirm("¿Quieres borrar esta grabación? No se podrá recuperar.")) return;
    await entryRepository.remove(entry.id);
    await refreshTodayAudios();
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
        <section className={`capture-studio capture-studio--${entryType} ${entryType === "video" ? "cinema-studio" : ""}`} data-pack={activePack?.manifest.id ?? "base"}>
          {entryType === "video" ? (
            <div className="cinema-stage responsive-world-scene responsive-world-scene--video" style={{ backgroundImage: `url(${videoSceneBackground})` }}>
              {activeProfile && <SceneMascot profileId={activeProfile.id} sceneId="video" path={sceneMascotPaths.video} packId={activePack?.manifest.id} />}
              <button className="cinema-stage__back" type="button" onClick={() => navigate("/home")} aria-label="Volver a la habitación"><ArrowLeft size={22} /></button>
              <span className="cinema-stage__ticket">{dailyCount}/{dailyMax ?? "-"} hoy</span>
              <div className="video-viewfinder cinema-screen">
                <div className="video-viewfinder__meta">
                  <span className={recording && !paused ? "is-live" : ""}>{recording ? (paused ? "Rodaje en pausa" : "Rodando") : previewUrl ? "Tu película" : "Pantalla preparada"}</span>
                  <span>{formatSeconds(elapsed)}</span>
                </div>
                <div className="sticker-stage">
                <video ref={videoPreviewRef} src={previewUrl} controls={Boolean(previewUrl)} muted={recording} playsInline />
                  {!recording && !previewUrl && <div className="cinema-screen__empty" aria-hidden="true"><Film size={38} /><span>Prepara tu escena</span></div>}
                  <FilterCanvas overlays={overlays} packs={packs} />
                  <StickerCanvas
                    overlays={overlays} packs={packs} editable
                    selectedId={typeof selectedOverlayId === "string" && selectedOverlayId !== "frame" ? selectedOverlayId : undefined}
                    onSelect={setSelectedOverlayId}
                    onUpdate={(overlayId, patch) => setOverlays((current) => updateStickerOverlay(current, overlayId, patch))}
                    onRemove={(overlayId) => { setOverlays((current) => removeStickerOverlay(current, overlayId)); setSelectedOverlayId(null); }}
                  />
                  <FrameCanvas
                    overlays={overlays} packs={packs} editable selected={selectedOverlayId === "frame"}
                    onSelect={() => setSelectedOverlayId("frame")}
                    onUpdate={(patch) => setOverlays((current) => updateFrameOverlay(current, patch))}
                    onRemove={() => { setOverlays((current) => setFrameOverlay(current)); setSelectedOverlayId(null); }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="voice-room responsive-world-scene responsive-world-scene--voice" style={{ backgroundImage: `url(${voiceSceneBackground})` }}>
              {activeProfile && <SceneMascot profileId={activeProfile.id} sceneId="audio" path={sceneMascotPaths.audio} packId={activePack?.manifest.id} />}
              <button className="world-scene__back" type="button" onClick={() => navigate("/home")} aria-label="Volver a la habitación"><ArrowLeft size={22} /></button>
              <span className="world-scene__counter">{dailyCount}/{dailyMax ?? "-"} hoy</span>
              <button
                className={`voice-room__mic ${recording && !paused ? "is-recording" : ""}`}
                type="button"
                onClick={() => recording ? stopRecording() : void startRecording()}
                aria-label={recording ? "Detener grabación de voz" : "Iniciar grabación de voz"}
                aria-pressed={recording}
              >
                <span className="voice-room__pulse" aria-hidden="true" />
              </button>
              <div className="voice-room__console">
                <p className="voice-room__timer" aria-live="polite">{formatSeconds(elapsed)} <span>/ {formatSeconds(maxSeconds ?? 0)}</span></p>
                {recording && (
                  <button className="voice-room__control" type="button" onClick={togglePause} aria-label={paused ? "Continuar" : "Pausa"}>
                    {paused ? <Play size={19} fill="currentColor" /> : <Pause size={19} fill="currentColor" />}
                  </button>
                )}
                {previewUrl && <audio src={previewUrl} controls />}
                {mediaBlob && (
                  <div className="voice-room__actions">
                    <button type="button" onClick={() => { setMediaBlob(null); setSavedEntryId(undefined); }}><RotateCcw size={17} /> Repetir</button>
                    {!savedEntryId && <button type="button" disabled={saving} onClick={() => void quickSaveMediaEntry()}><Save size={17} /> {saving ? "Guardando" : "Guardar"}</button>}
                  </div>
                )}
                <small>Máximo {formatSeconds(maxSeconds ?? 0)}</small>
              </div>
            </div>
          )}

          {entryType === "video" ? (
            <div className="cinema-console">
              <button className={`cinema-effects ${effectsOpen ? "is-open" : ""}`} type="button" onClick={() => setEffectsOpen((open) => !open)} aria-expanded={effectsOpen}>
                <Clapperboard size={19} /> Efectos
              </button>
              <p className="cinema-console__timer" aria-live="polite">{formatSeconds(elapsed)} <span>{maxSeconds ? `/ ${formatSeconds(maxSeconds)}` : ""}</span></p>
              <div className="cinema-console__actions">
                {!recording && !mediaBlob ? (
                  <button className="cinema-record" type="button" onClick={() => void startRecording()} aria-label="Empezar a grabar"><span /></button>
                ) : recording ? (
                  <>
                    <button className="cinema-control" type="button" onClick={togglePause} aria-label={paused ? "Continuar" : "Pausa"}>{paused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}</button>
                    <button className="cinema-control cinema-control--stop" type="button" onClick={stopRecording} aria-label="Detener"><Square size={18} fill="currentColor" /></button>
                  </>
                ) : (
                  <>
                    <button className="cinema-action" type="button" onClick={() => { setMediaBlob(null); setSavedEntryId(undefined); void startVideoPreview(); }}><RotateCcw size={18} /> Repetir</button>
                    {!savedEntryId && <button className="cinema-action cinema-action--save" type="button" disabled={saving} onClick={() => void quickSaveMediaEntry()}><Save size={18} /> {saving ? "Guardando" : "Guardar"}</button>}
                  </>
                )}
              </div>
            </div>
          ) : null}
        </section>

        <button className="world-memory-trigger" type="button" onClick={() => setMemoriesOpen(true)}>
          {entryType === "video" ? <Film size={18} /> : <Play size={18} />}
          <span>{entryType === "video" ? "Ver mis vídeos de hoy" : "Escuchar mis voces de hoy"}</span>
          <strong>{entryType === "video" ? todayVideos.length : todayAudios.length}</strong>
        </button>

        {entryType === "video" && effectsOpen && (
          <section className="cinema-effects-drawer" aria-label="Mesa de efectos">
            <VisualToolCarousel
              pack={activePack}
              onClose={() => setEffectsOpen(false)}
              onSticker={addSticker}
              onFrame={selectFrame}
              onFilter={selectFilter}
              onVisual={addPackAsset}
              onClearFrame={() => { setOverlays((current) => setFrameOverlay(current)); setSelectedOverlayId(null); }}
              onClearFilter={() => setOverlays((current) => setFilterOverlay(current))}
            />
          </section>
        )}

        <MemoryDrawer
          open={memoriesOpen}
          onClose={() => setMemoriesOpen(false)}
          eyebrow={entryType === "video" ? "Cartelera de hoy" : "Archivo de hoy"}
          title={entryType === "video" ? "Mis vídeos" : "Mis voces"}
        >
          {entryType === "video" ? (
            todayVideos.length ? <div className="today-video-grid">{todayVideos.map((entry) => <TodayVideoCard key={entry.id} entry={entry} packs={packs} onDelete={(item) => void deleteVideo(item)} />)}</div>
              : <div className="memory-drawer__empty"><Film size={28} /><strong>Aún no has grabado ningún vídeo hoy</strong></div>
          ) : (
            todayAudios.length ? <div className="memory-audio-list">{todayAudios.map((entry) => <TodayAudioCard key={entry.id} entry={entry} onDelete={(item) => void deleteAudio(item)} />)}</div>
              : <div className="memory-drawer__empty"><Play size={28} /><strong>Aún no has guardado ninguna voz hoy</strong></div>
          )}
        </MemoryDrawer>

        {mediaBlob && savedEntryId && !saveSheetOpen && (
          <aside className="quick-save-confirmation" role="status" aria-live="polite">
            <span className="quick-save-confirmation__icon"><Save size={20} /></span>
            <div><strong>Recuerdo guardado</strong><small>Ya está a salvo en tu diario</small></div>
            <button type="button" onClick={() => setSaveSheetOpen(true)}>Añadir detalles</button>
            <button type="button" onClick={() => navigate("/diary")}>Ver diario</button>
          </aside>
        )}

        {mediaBlob && savedEntryId && saveSheetOpen && (
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
              <form className="save-sheet__form" onSubmit={(event) => { event.preventDefault(); void saveMediaDetails(); }}>
                <label className="save-sheet__field">
                  <span>Título <small>opcional</small></span>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ponle un nombre a este momento" />
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
                <button className="primary-action save-sheet__submit" type="submit"><Save size={18} /> Guardar detalles</button>
              </form>
            </section>
          </div>
        )}

        {error && !mediaBlob && <p className="form-error">{error}</p>}
      </section>
    );
  }

  const rightHistoryEntry = storyHistoryIndex >= 0 ? textEntries[storyHistoryIndex] : undefined;
  const leftHistoryEntry = storyHistoryIndex >= 0 ? textEntries[storyHistoryIndex + 1] : textEntries[0];
  const canGoBack = textEntries.length > 0 && storyHistoryIndex < textEntries.length - 1;
  const canGoForward = storyHistoryIndex >= 0;
  const storyPosition = storyHistoryIndex < 0
    ? `${textEntries.length + 1} de ${textEntries.length + 1}`
    : `${textEntries.length - storyHistoryIndex} de ${textEntries.length + 1}`;

  return (
    <section className="page-stack record-page record-page--text">
      <form className="story-room responsive-world-scene responsive-world-scene--story" data-pack={activePack?.manifest.id ?? "base"} style={{ backgroundImage: `url(${storySceneBackground})` }} onSubmit={handleTextSubmit}>
        {activeProfile && <SceneMascot profileId={activeProfile.id} sceneId="text" path={sceneMascotPaths.text} packId={activePack?.manifest.id} />}
        <button className="world-scene__back" type="button" onClick={() => navigate("/home")} aria-label="Volver a la habitación"><ArrowLeft size={22} /></button>
        <section key={leftHistoryEntry?.id ?? "blank-left"} className="story-room__previous story-room__paper-transition" aria-label={leftHistoryEntry ? "Página anterior del diario" : "Página izquierda del diario"}>
          {leftHistoryEntry ? (
            <>
              <time>{new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(new Date(leftHistoryEntry.createdAt))}</time>
              <h2>{leftHistoryEntry.title || "Mi página"}</h2>
              <p>{leftHistoryEntry.note}</p>
            </>
          ) : null}
        </section>
        <div key={rightHistoryEntry?.id ?? "today"} className={`story-room__page story-room__paper-transition ${rightHistoryEntry ? "story-room__page--read-only" : ""}`}>
          {rightHistoryEntry ? (
            <>
              <p className="story-room__date">{new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(new Date(rightHistoryEntry.createdAt))}</p>
              <h2 className="story-room__history-title">{rightHistoryEntry.title || "Mi página"}</h2>
              <p className="story-room__history-note">{rightHistoryEntry.note}</p>
            </>
          ) : (
            <>
              <p className="story-room__date">{new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</p>
              <label className="visually-hidden" htmlFor="diary-title">Título</label>
              <input id="diary-title" className="story-room__title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título de hoy" />
              <label className="visually-hidden" htmlFor="diary-note">Texto</label>
              <textarea
                id="diary-note"
                className="story-room__note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Querido diario..."
                rows={9}
                required
              />
            </>
          )}
        </div>

        <nav className="story-room__pagination" aria-label="Navegar por las páginas del diario">
          <button type="button" onClick={() => setStoryHistoryIndex((current) => Math.min(current + 1, textEntries.length - 1))} disabled={!canGoBack} aria-label="Ver páginas anteriores">
            <ChevronLeft aria-hidden="true" />
          </button>
          <span aria-live="polite">{storyPosition}</span>
          <button type="button" onClick={() => setStoryHistoryIndex((current) => Math.max(current - 1, -1))} disabled={!canGoForward} aria-label="Ver páginas siguientes">
            <ChevronRight aria-hidden="true" />
          </button>
        </nav>

        <div className={`story-room__actions ${rightHistoryEntry ? "story-room__actions--hidden" : ""}`}>
          {error && <p className="form-error">{error}</p>}

          <button className="story-room__save" type="submit">
            <Save size={18} /> Guardar página
          </button>
        </div>
      </form>
      <button className="world-memory-trigger" type="button" onClick={() => setMemoriesOpen(true)}><Film size={18} /><span>Ver mis páginas</span><strong>{textEntries.length}</strong></button>
      <MemoryDrawer open={memoriesOpen} onClose={() => setMemoriesOpen(false)} eyebrow="Mi diario" title="Páginas anteriores">
        {textEntries.length ? (
          <div className="memory-text-list">{textEntries.map((entry) => <article key={entry.id} className="memory-text-card"><time>{new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(new Date(entry.createdAt))}</time><strong>{entry.title || "Mi página"}</strong><p>{entry.note}</p></article>)}</div>
        ) : <div className="memory-drawer__empty"><Film size={28} /><strong>Tu diario todavía está esperando su primera página</strong></div>}
      </MemoryDrawer>
    </section>
  );
}
