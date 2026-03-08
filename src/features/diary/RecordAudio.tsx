import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Circle, Square, Mic } from "lucide-react";
import { entryRepository } from "@/core/storage/repositories/entryRepository";
import { settingsRepository } from "@/core/storage/repositories/settingsRepository";
import { useProfile } from "@/core/auth/ProfileContext";
import type { ExtendedEntry } from "./types";

const MAX_SECONDS_DEFAULT = 600;

export function RecordAudio() {
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
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
      if (typeof (s as any).maxAudioSeconds === "number") setMaxSeconds((s as any).maxAudioSeconds);
    });
  }, []);

  // Timer effect — only increments elapsed, does NOT stop recording
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  // Separate effect to auto-stop when limit reached
  useEffect(() => {
    if (recording && elapsed >= maxSeconds) {
      stopRecording();
    }
  }, [elapsed, maxSeconds, recording]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
      };
      recorderRef.current = recorder;
      recorder.start(); // continuous mode — single chunk, no duplicates
      setRecording(true);
      setElapsed(0);
    } catch {
      setPermError("No se pudo acceder al micrófono.");
    }
  }, []);

  // stopRecording moved above startRecording as useCallback

  const save = async () => {
    if (!blob) return;
    const id = crypto.randomUUID();
    const entry: ExtendedEntry = {
      id,
      profileId: activeProfile?.id ?? "default",
      date: new Date().toISOString().slice(0, 10),
      type: "audio",
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
        <audio src={URL.createObjectURL(blob)} controls className="w-full" />
        <Input placeholder="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex items-center gap-3">
          <Switch checked={isCapsule} onCheckedChange={setIsCapsule} id="capsule" />
          <Label htmlFor="capsule">Guardar como cápsula del tiempo</Label>
        </div>
        {isCapsule && (
          <div className="space-y-1">
            <Input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} required />
            {!unlockDate && (
              <p className="text-xs text-destructive">Debes seleccionar una fecha de desbloqueo</p>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setBlob(null)}>Repetir</Button>
          <Button className="flex-1" onClick={save} disabled={isCapsule && !unlockDate}>Guardar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className={`flex h-44 w-44 items-center justify-center rounded-full ${recording ? "animate-pulse bg-destructive/20" : "bg-primary/10"}`}>
        <Mic className={`h-24 w-24 ${recording ? "text-destructive" : "text-primary"}`} />
      </div>
      <p className="font-mono text-3xl">{fmt(elapsed)} / {fmt(maxSeconds)}</p>
      <div className="flex gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Cancelar
        </Button>
        {!recording ? (
          <Button onClick={startRecording} className="gap-2">
            <Circle className="h-4 w-4" fill="currentColor" /> Grabar
          </Button>
        ) : (
          <Button variant="destructive" onClick={stopRecording} className="gap-2">
            <Square className="h-4 w-4" fill="currentColor" /> Detener
          </Button>
        )}
      </div>
    </div>
  );
}
