import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, RotateCcw } from "lucide-react";
import { dbSet, dbListByIndex, dbDelete } from "@/core/storage/indexeddb";
import { useProfile } from "@/core/auth/ProfileContext";
import { OverlayLayer } from "@/features/overlays/OverlayLayer";
import { OverlayTray } from "@/features/overlays/OverlayTray";
import { useOverlayProject } from "@/features/overlays/useOverlayProject";
import type { OverlayProject } from "@/core/media/overlays/overlayEngine";

export function PhotoCapture() {
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const profileId = activeProfile?.id ?? "default";
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState("");
  const [permError, setPermError] = useState("");

  const { overlays, selectedId, setSelectedId, setOverlays, addOverlay, deleteSelected } =
    useOverlayProject([]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1920 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setPermError("No se pudo acceder a la cámara.");
    }
  }, []);

  useState(() => {
    startCamera();
  });

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    const size = Math.min(video.videoWidth, video.videoHeight, 1920);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setPhoto(blob);
          setPreview(URL.createObjectURL(blob));
          streamRef.current?.getTracks().forEach((t) => t.stop());
        }
      },
      "image/jpeg",
      0.85,
    );
  };

  const save = async () => {
    if (!photo) return;
    const today = new Date().toISOString().slice(0, 10);
    const existing = await dbListByIndex("daily_photos", "by-date", today);
    for (const e of existing) {
      if ((e as any).profileId === profileId) await dbDelete("daily_photos", e.id);
    }
    await dbSet("daily_photos", {
      id: crypto.randomUUID(),
      profileId,
      date: today,
      blob: photo,
      caption,
      overlayProject: overlays,
      createdAt: new Date().toISOString(),
    } as any);
    navigate("/daily-photo");
  };

  if (permError) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6">
        <p className="text-destructive">{permError}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }

  // After capture – preview with overlays
  if (photo) {
    return (
      <div className="fixed inset-0 flex flex-col bg-background h-[100dvh]">
        <div className="flex items-center gap-3 px-4 pt-3 pb-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => { setPhoto(null); startCamera(); }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-bold">Tu foto de hoy</h2>
        </div>

        {/* Photo fits available space */}
        <div className="flex-1 min-h-0 px-3 pb-1 flex items-center justify-center">
          <OverlayLayer
            overlays={overlays}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={setOverlays}
            className="rounded-xl max-h-full max-w-full"
          >
            <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain rounded-xl" />
          </OverlayLayer>
        </div>

        {/* Bottom controls */}
        <div className="shrink-0 space-y-2 px-4 pb-3 pt-1">
          <Input
            placeholder="Caption (opcional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-1"
              onClick={() => { setPhoto(null); startCamera(); }}
            >
              <RotateCcw className="h-4 w-4" /> Repetir
            </Button>
            <Button className="flex-1" onClick={save}>
              Guardar
            </Button>
          </div>
        </div>

        <OverlayTray
          selectedId={selectedId}
          overlays={overlays}
          onAdd={addOverlay}
          onChange={setOverlays}
          onDelete={deleteSelected}
        />
      </div>
    );
  }

  // Live camera – fullscreen with integrated capture button
  return (
    <div className="fixed inset-0 flex flex-col bg-black h-[100dvh]">
      {/* Camera fills all available space */}
      <div className="relative flex-1 min-h-0">
        <OverlayLayer
          overlays={overlays}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChange={setOverlays}
          className="h-full w-full"
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            playsInline
          />
        </OverlayLayer>

        {/* Back button */}
        <div className="absolute left-3 top-3 z-40">
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/30 rounded-full"
            onClick={() => {
              streamRef.current?.getTracks().forEach((t) => t.stop());
              navigate(-1);
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Capture button – integrated inside the camera view */}
        <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center">
          <button
            onClick={capture}
            className="flex h-18 w-18 items-center justify-center rounded-full border-4 border-white bg-white/20 shadow-lg backdrop-blur-sm active:scale-90 transition-transform"
          >
            <Camera className="h-8 w-8 text-white" />
          </button>
        </div>
      </div>

      {/* Overlay tray sits below the camera */}
      <OverlayTray
        selectedId={selectedId}
        overlays={overlays}
        onAdd={addOverlay}
        onChange={setOverlays}
        onDelete={deleteSelected}
      />
    </div>
  );
}
