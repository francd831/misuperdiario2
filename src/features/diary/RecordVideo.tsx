import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Circle, Square } from "lucide-react";
import { entryRepository } from "@/core/storage/repositories/entryRepository";
import { settingsRepository } from "@/core/storage/repositories/settingsRepository";
import { useProfile } from "@/core/auth/ProfileContext";
import { OverlayLayer } from "@/features/overlays/OverlayLayer";
import { OverlayTray } from "@/features/overlays/OverlayTray";
import { useOverlayProject } from "@/features/overlays/useOverlayProject";
import type { ExtendedEntry } from "./types";

const MAX_SECONDS_DEFAULT = 300;

export function RecordVideo() {
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [title, setTitle] = useState("");
  const [isCapsule, setIsCapsule] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");
  const [permError, setPermError] = useState("");
  const [maxSeconds, setMaxSeconds] = useState(MAX_SECONDS_DEFAULT);

  const { overlays, selectedId, setSelectedId, setOverlays, addOverlay, deleteSelected } =
    useOverlayProject([]);

  useEffect(() => {
    settingsRepository.get().then((s) => {
      if (typeof (s as any).maxVideoSeconds === "number") setMaxSeconds((s as any).maxVideoSeconds);
    });
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setPermError("No se pudo acceder a la cámara. Revisa los permisos.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(
      () =>
        setElapsed((e) => {
          if (e + 1 >= maxSeconds) stopRecording();
          return e + 1;
        }),
      1000,
    );
    return () => clearInterval(id);
  }, [recording, maxSeconds]);

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    // Pick best supported codec with constrained bitrate
    const mimeOptions = [
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ];
    const mimeType = mimeOptions.find((m) => MediaRecorder.isTypeSupported(m)) ?? "video/webm";

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 1_500_000, // 1.5 Mbps – smooth without huge files
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const b = new Blob(chunksRef.current, { type: mimeType });
      setBlob(b);
    };
    recorderRef.current = recorder;
    recorder.start(500); // smaller chunks = less memory pressure
    setRecording(true);
    setElapsed(0);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const save = async () => {
    if (!blob) return;
    const id = crypto.randomUUID();
    const entry: ExtendedEntry = {
      id,
      profileId: activeProfile?.id ?? "default",
      date: new Date().toISOString().slice(0, 10),
      type: "video",
      title: title || undefined,
      duration: elapsed,
      isLocked: isCapsule,
      unlockAt: isCapsule && unlockDate ? new Date(unlockDate).toISOString() : undefined,
      mediaBlob: blob,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    (entry as any).overlayProject = overlays;
    await entryRepository.save(entry as any);
    navigate("/");
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const recordedVideoUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : ""), [blob]);

  useEffect(() => {
    return () => {
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    };
  }, [recordedVideoUrl]);

  if (permError) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6">
        <p className="text-center text-destructive">{permError}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }

  // Post-recording save form
  if (blob) {
    return (
      <div className="fixed inset-0 flex flex-col bg-background h-[100dvh]">
        <div className="flex items-center gap-3 px-4 pt-3 pb-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => { setBlob(null); startCamera(); }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-bold">Guardar grabación</h2>
        </div>

        {/* Video fits available space */}
        <div className="flex-1 min-h-0 px-3 pb-1 flex items-center justify-center">
          <OverlayLayer
            overlays={overlays}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={setOverlays}
            className="rounded-xl max-h-full max-w-full"
          >
            <video
              src={recordedVideoUrl}
              controls
              className="max-h-full max-w-full object-contain rounded-xl"
            />
          </OverlayLayer>
        </div>

        {/* Bottom controls */}
        <div className="shrink-0 space-y-2 px-4 pb-3 pt-1 max-h-[40vh] overflow-y-auto">
          <Input
            placeholder="Título (opcional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <Switch checked={isCapsule} onCheckedChange={setIsCapsule} id="capsule" />
            <Label htmlFor="capsule">Cápsula del tiempo</Label>
          </div>
          {isCapsule && (
            <div className="space-y-1">
              <Input
                type="date"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                required
              />
              {!unlockDate && (
                <p className="text-xs text-destructive">Debes seleccionar una fecha de desbloqueo</p>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setBlob(null); startCamera(); }}
            >
              Repetir
            </Button>
            <Button className="flex-1" onClick={save} disabled={isCapsule && !unlockDate}>
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

  // Live recording – fullscreen with integrated controls
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
            style={{ willChange: "auto" }}
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
      </div>

      {/* Timer + record/stop button – outside the overlay area */}
      <div className="shrink-0 flex flex-col items-center gap-3 py-4 bg-black">
        {recording && (
          <p className="rounded-full bg-black/50 px-4 py-1 text-lg font-mono text-white">
            {fmt(elapsed)} / {fmt(maxSeconds)}
          </p>
        )}
        {!recording ? (
          <button
            onClick={startRecording}
            className="flex h-18 w-18 items-center justify-center rounded-full bg-destructive shadow-lg active:scale-90 transition-transform"
          >
            <Circle className="h-8 w-8 text-white" fill="white" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex h-18 w-18 items-center justify-center rounded-full bg-destructive shadow-lg animate-pulse active:scale-90 transition-transform"
          >
            <Square className="h-6 w-6 text-white" fill="white" />
          </button>
        )}
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
