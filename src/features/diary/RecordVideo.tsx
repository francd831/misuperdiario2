import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Circle, Square } from "lucide-react";
import { entryRepository } from "@/core/storage/repositories/entryRepository";
import { settingsRepository } from "@/core/storage/repositories/settingsRepository";
import type { ExtendedEntry } from "./types";

const MAX_SECONDS_DEFAULT = 300;

export function RecordVideo() {
  const navigate = useNavigate();
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

  useEffect(() => {
    settingsRepository.get().then((s) => {
      if (typeof (s as any).maxVideoSeconds === "number") setMaxSeconds((s as any).maxVideoSeconds);
    });
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
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
    const id = setInterval(() => setElapsed((e) => {
      if (e + 1 >= maxSeconds) stopRecording();
      return e + 1;
    }), 1000);
    return () => clearInterval(id);
  }, [recording, maxSeconds]);

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const b = new Blob(chunksRef.current, { type: "video/webm" });
      setBlob(b);
    };
    recorderRef.current = recorder;
    recorder.start(1000);
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
      profileId: "default",
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
    await entryRepository.save(entry as any);
    navigate("/");
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (permError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-center text-destructive">{permError}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  if (blob) {
    return (
      <div className="flex min-h-screen flex-col gap-4 px-4 pb-24 pt-4">
        <h2 className="text-xl font-bold">Guardar grabación</h2>
        <video src={URL.createObjectURL(blob)} controls className="w-full rounded-xl" />
        <Input placeholder="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex items-center gap-3">
          <Switch checked={isCapsule} onCheckedChange={setIsCapsule} id="capsule" />
          <Label htmlFor="capsule">Guardar como cápsula del tiempo</Label>
        </div>
        {isCapsule && (
          <Input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => { setBlob(null); startCamera(); }}>Repetir</Button>
          <Button className="flex-1" onClick={save}>Guardar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-black">
      <video ref={videoRef} className="flex-1 object-cover" muted playsInline />
      <div className="absolute left-4 top-4">
        <Button variant="ghost" size="icon" className="text-white" onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); navigate(-1); }}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
        <p className="rounded-full bg-black/50 px-4 py-1 text-lg font-mono text-white">{fmt(elapsed)} / {fmt(maxSeconds)}</p>
        {!recording ? (
          <button onClick={startRecording} className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive shadow-lg">
            <Circle className="h-8 w-8 text-white" fill="white" />
          </button>
        ) : (
          <button onClick={stopRecording} className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive shadow-lg">
            <Square className="h-6 w-6 text-white" fill="white" />
          </button>
        )}
      </div>
    </div>
  );
}
