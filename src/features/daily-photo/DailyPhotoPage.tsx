import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Play, RotateCcw, Save, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { achievementService } from "../../core/achievements/achievementService";
import { createImageThumbnail, blobFromCanvas } from "../../core/daily-photo/imageProcessing";
import { dailyPhotoRepository } from "../../core/daily-photo/dailyPhotoRepository";
import type { DailyPhoto } from "../../core/daily-photo/types";
import {
  addStickerOverlay,
  addVisualOverlay,
  clearOverlays,
  normalizeOverlayProject,
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
import { storagePolicyRepository } from "../../core/settings/storagePolicyRepository";
import type { StoragePolicy } from "../../core/profiles/types";
import { useObjectUrl } from "../../shared/hooks/useObjectUrl";
import { PageHeader } from "../../shared/ui/PageHeader";
import { FilterCanvas } from "../stickers/FilterCanvas";
import { FrameCanvas } from "../stickers/FrameCanvas";
import { StickerCanvas } from "../stickers/StickerCanvas";
import { VisualToolCarousel } from "../stickers/VisualToolCarousel";

function PhotoThumb({ photo, onEdit, onDelete }: { photo: DailyPhoto; onEdit: (photo: DailyPhoto) => void; onDelete: (photo: DailyPhoto) => void }) {
  const url = useObjectUrl(photo.thumbnailBlob ?? photo.blob);
  const [packs] = useState<PackWithAssets[]>(() => packService.listPacks());

  return (
    <article className="photo-tile">
      {url && <img src={url} alt={photo.caption || `Foto del ${photo.date}`} />}
      <FilterCanvas overlays={photo.overlayProject} packs={packs} />
      <FrameCanvas overlays={photo.overlayProject} packs={packs} />
      <StickerCanvas overlays={photo.overlayProject ?? []} packs={packs} />
      <div className="memory-card-actions">
        <button type="button" onClick={() => onEdit(photo)}>Editar</button>
        <button className="danger-icon-action" type="button" onClick={() => onDelete(photo)} aria-label="Borrar foto">
          <Trash2 size={16} />
        </button>
      </div>
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
  const [cameraAspectRatio, setCameraAspectRatio] = useState("1 / 1");
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
      setError("Este navegador no permite usar la cámara desde la web.");
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
        setCameraAspectRatio(`${videoRef.current.videoWidth} / ${videoRef.current.videoHeight}`);
      }
    } catch {
      setError("No se pudo acceder a la cámara.");
    }
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
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
    setOverlays((current) => {
      const next = addStickerOverlay(current, { packId: sticker.packId, assetId: sticker.id });
      setSelectedOverlayId(next.stickers.at(-1)?.id ?? null);
      return next;
    });
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

  async function deletePhoto(photo: DailyPhoto) {
    if (!window.confirm("¿Quieres borrar esta foto? No se podrá recuperar.")) return;
    await dailyPhotoRepository.remove(photo.id);
    if (editingPhotoId === photo.id) {
      setCapturedBlob(null);
      setEditingPhotoId(null);
      setOverlays(clearOverlays());
    }
    await refreshPhotos();
  }

  return (
    <section className="page-stack daily-photo-page">
      <PageHeader
        title="Foto diaria"
        icon={<Camera size={22} />}
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

      <section className="photo-booth">
        <div className="photo-booth__topline">
          <span>La foto de hoy</span>
          <span>{new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date())}</span>
        </div>
        <div className="photo-booth__frame">
          <div className="sticker-stage" style={{ aspectRatio: cameraAspectRatio }}>
          {capturedUrl ? (
            <img
              className="camera-preview"
              src={capturedUrl}
              alt="Foto capturada"
              onLoad={(event) => setCameraAspectRatio(`${event.currentTarget.naturalWidth} / ${event.currentTarget.naturalHeight}`)}
            />
          ) : (
            <video ref={videoRef} className="camera-preview" muted playsInline />
          )}
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

        <div className="photo-booth__controls">
          {!capturedBlob ? (
            <>
              <button className="secondary-action" type="button" onClick={() => void startCamera()}>
                <Camera size={18} /> Abrir cámara
              </button>
              <button className="photo-shutter" type="button" onClick={() => void capturePhoto()} aria-label="Capturar foto">
                <span><Camera size={22} /></span>
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
          <label className="photo-caption">
            <span>Pie de foto</span>
            <input value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="¿Qué quieres recordar?" />
          </label>
          <VisualToolCarousel
            pack={activePack}
            onSticker={addSticker}
            onFrame={selectFrame}
            onFilter={selectFilter}
            onVisual={addPackAsset}
            onClearFrame={() => { setOverlays((current) => setFrameOverlay(current)); setSelectedOverlayId(null); }}
            onClearFilter={() => setOverlays((current) => setFilterOverlay(current))}
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
            <PhotoThumb key={photo.id} photo={photo} onEdit={editPhoto} onDelete={(item) => void deletePhoto(item)} />
          ))}
        </div>
      )}
    </section>
  );
}
