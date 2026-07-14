import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Play, RotateCcw, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { achievementService } from "../../core/achievements/achievementService";
import { createImageThumbnail, blobFromCanvas } from "../../core/daily-photo/imageProcessing";
import { dailyPhotoRepository } from "../../core/daily-photo/dailyPhotoRepository";
import type { DailyPhoto } from "../../core/daily-photo/types";
import {
  addStickerOverlay,
  clearOverlays,
  normalizeOverlayProject,
  removeStickerOverlay,
  setFrameOverlay,
  updateFrameOverlay,
  updateStickerOverlay,
} from "../../core/overlays/overlayProject";
import type { OverlayProject } from "../../core/overlays/types";
import { packService } from "../../core/packs/packService";
import type { PackAsset, PackWithAssets } from "../../core/packs/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { storagePolicyRepository } from "../../core/settings/storagePolicyRepository";
import type { StoragePolicy } from "../../core/profiles/types";
import { useObjectUrl } from "../../shared/hooks/useObjectUrl";
import { PageHeader } from "../../shared/ui/PageHeader";
import { FrameCanvas } from "../stickers/FrameCanvas";
import { FrameTray } from "../stickers/FrameTray";
import { StickerCanvas } from "../stickers/StickerCanvas";
import { StickerTray } from "../stickers/StickerTray";

function PhotoThumb({ photo, onEdit }: { photo: DailyPhoto; onEdit: (photo: DailyPhoto) => void }) {
  const url = useObjectUrl(photo.thumbnailBlob ?? photo.blob);
  const [packs] = useState<PackWithAssets[]>(() => packService.listPacks());

  return (
    <article className="photo-tile">
      {url && <img src={url} alt={photo.caption || `Foto del ${photo.date}`} />}
      <FrameCanvas overlays={photo.overlayProject} packs={packs} />
      <StickerCanvas overlays={photo.overlayProject ?? []} packs={packs} />
      <button
        type="button"
        onClick={() => onEdit(photo)}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 30,
          border: 0,
          borderRadius: 999,
          background: "rgba(255,255,255,0.9)",
          color: "#30233d",
          padding: "6px 9px",
          fontWeight: 800,
        }}
      >
        Editar
      </button>
      <span>{new Date(photo.date).toLocaleDateString("es", { day: "numeric", month: "short" })}</span>
    </article>
  );
}

export default function DailyPhotoPage() {
  const { activeProfile } = useProfiles();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [policy, setPolicy] = useState<StoragePolicy | null>(null);
  const [photos, setPhotos] = useState<DailyPhoto[]>([]);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [packs] = useState<PackWithAssets[]>(() => packService.listPacks());
  const [overlays, setOverlays] = useState<OverlayProject>(clearOverlays());
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | "frame" | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const capturedUrl = useObjectUrl(capturedBlob);
  const activePack = packs.find((pack) => pack.manifest.id === activeProfile?.activePackId) ?? packs[0];
  const hasToday = useMemo(() => photos.some((photo) => photo.date === new Date().toISOString().slice(0, 10)), [photos]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const refreshPhotos = useCallback(async () => {
    if (!activeProfile) return;
    setPhotos(await dailyPhotoRepository.listByProfile(activeProfile.id));
  }, [activeProfile]);

  useEffect(() => {
    void storagePolicyRepository.get().then(setPolicy);
  }, []);

  useEffect(() => {
    void refreshPhotos();
  }, [refreshPhotos]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function startCamera() {
    setError("");
    setCapturedBlob(null);
    setEditingPhotoId(null);
    setSelectedOverlayId(null);
    setOverlays(clearOverlays());

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este navegador no permite usar la camara desde la web.");
      return;
    }

    try {
      const quality = policy?.photoQuality ?? "medium";
      const size = quality === "high" ? 1600 : quality === "low" ? 720 : 1100;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: size }, height: { ideal: size } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError("No se pudo acceder a la camara.");
    }
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;
    const canvas = document.createElement("canvas");
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    context.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    setCapturedBlob(await blobFromCanvas(canvas));
    stopCamera();
  }

  async function savePhoto() {
    setError("");
    if (!activeProfile || !capturedBlob || !policy) return;

    try {
      const thumbnailBlob = await createImageThumbnail(capturedBlob);
      await dailyPhotoRepository.saveToday(
        {
          profileId: activeProfile.id,
          blob: capturedBlob,
          thumbnailBlob,
          caption,
          overlayProject: overlays,
        },
        policy.allowDailyPhotoReplacement,
      );
      await achievementService.syncProfile(activeProfile.id);
      setCapturedBlob(null);
      setCaption("");
      setOverlays(clearOverlays());
      setSelectedOverlayId(null);
      await refreshPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la foto.");
    }
  }

  function addSticker(sticker: PackAsset) {
    setOverlays((current) => addStickerOverlay(current, { packId: sticker.packId, assetId: sticker.id }));
    setSelectedOverlayId(null);
  }

  function selectFrame(frame: PackAsset) {
    setOverlays((current) => setFrameOverlay(current, { packId: frame.packId, assetId: frame.id }));
    setSelectedOverlayId("frame");
  }

  function editPhoto(photo: DailyPhoto) {
    setCapturedBlob(photo.blob);
    setCaption(photo.caption ?? "");
    setOverlays(normalizeOverlayProject(photo.overlayProject));
    setEditingPhotoId(photo.id);
    setSelectedOverlayId(null);
    stopCamera();
  }

  async function savePhotoDecorations() {
    setError("");
    if (!editingPhotoId) return;

    try {
      await dailyPhotoRepository.updateOverlayProject(editingPhotoId, overlays);
      setCapturedBlob(null);
      setCaption("");
      setOverlays(clearOverlays());
      setEditingPhotoId(null);
      setSelectedOverlayId(null);
      await refreshPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la foto.");
    }
  }

  return (
    <section className="page-stack daily-photo-page">
      <PageHeader
        eyebrow="Foto diaria"
        title="Fotomaton diario"
        description="Haz la foto de hoy, juega con stickers y sumala a tu album."
        backTo="/home"
        action={
          <Link className="icon-action" to="/daily-photo/timelapse" aria-label="Abrir timelapse">
            <Play size={18} />
          </Link>
        }
      />

      {hasToday && !capturedBlob && (
        <section className="status-panel">
          <h2>Ya tienes foto de hoy</h2>
          <p>{policy?.allowDailyPhotoReplacement ? "Puedes repetirla si quieres otra toma." : "La foto de hoy ya esta guardada."}</p>
        </section>
      )}

      <section className="recorder-panel">
        <div className="sticker-stage">
          {capturedUrl ? (
            <img className="camera-preview" src={capturedUrl} alt="Foto capturada" />
          ) : (
            <video ref={videoRef} className="camera-preview" muted playsInline />
          )}
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

        <div className="recorder-panel__actions">
          {!capturedBlob ? (
            <>
              <button className="secondary-action" type="button" onClick={() => void startCamera()}>
                <Camera size={18} /> Abrir camara
              </button>
              <button className="primary-action" type="button" onClick={() => void capturePhoto()}>
                <Camera size={18} /> Capturar
              </button>
            </>
          ) : (
            <>
              <button className="secondary-action" type="button" onClick={() => { setCapturedBlob(null); void startCamera(); }}>
                <RotateCcw size={18} /> Repetir
              </button>
              <button className="primary-action" type="button" onClick={() => void (editingPhotoId ? savePhotoDecorations() : savePhoto())}>
                <Save size={18} /> {editingPhotoId ? "Guardar cambios" : "Guardar"}
              </button>
            </>
          )}
        </div>
      </section>

      {(capturedBlob || !editingPhotoId) && (
        <>
          <label className="form-panel">
            Frase de la foto
            <input value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Opcional" />
          </label>
          <StickerTray stickers={activePack?.stickers ?? []} onSelect={addSticker} />
          <FrameTray
            frames={activePack?.frames ?? []}
            onSelect={selectFrame}
            onClear={() => {
              setOverlays((current) => setFrameOverlay(current));
              setSelectedOverlayId(null);
            }}
          />
        </>
      )}

      {error && <p className="form-error">{error}</p>}

      {photos.length === 0 ? (
        <section className="empty-state">
          <Camera size={32} />
          <h2>Aun no hay fotos</h2>
          <p>Haz tu primera foto diaria para empezar el timelapse.</p>
        </section>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <PhotoThumb key={photo.id} photo={photo} onEdit={editPhoto} />
          ))}
        </div>
      )}
    </section>
  );
}
