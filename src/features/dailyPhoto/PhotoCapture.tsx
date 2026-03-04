import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, RotateCcw } from "lucide-react";
import { dbSet, dbListByIndex, dbDelete } from "@/core/storage/indexeddb";

export function PhotoCapture() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState("");
  const [permError, setPermError] = useState("");

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1080 } },
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

  useState(() => { startCamera(); });

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    const size = Math.min(video.videoWidth, video.videoHeight, 1080);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    canvas.toBlob((blob) => {
      if (blob) {
        setPhoto(blob);
        setPreview(URL.createObjectURL(blob));
        streamRef.current?.getTracks().forEach((t) => t.stop());
      }
    }, "image/jpeg", 0.85);
  };

  const save = async () => {
    if (!photo) return;
    const today = new Date().toISOString().slice(0, 10);
    // Remove existing photo for today
    const existing = await dbListByIndex("daily_photos", "by-date", today);
    for (const e of existing) {
      if ((e as any).profileId === "default") await dbDelete("daily_photos", e.id);
    }
    await dbSet("daily_photos", {
      id: crypto.randomUUID(),
      profileId: "default",
      date: today,
      blob: photo,
      caption,
      createdAt: new Date().toISOString(),
    } as any);
    navigate("/daily-photo");
  };

  if (permError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-destructive">{permError}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  if (photo) {
    return (
      <div className="flex min-h-screen flex-col gap-4 px-4 pb-24 pt-4">
        <h2 className="text-xl font-bold">Tu foto de hoy</h2>
        <img src={preview} alt="Preview" className="w-full rounded-xl" />
        <Input placeholder="Caption (opcional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-1" onClick={() => { setPhoto(null); startCamera(); }}>
            <RotateCcw className="h-4 w-4" /> Repetir
          </Button>
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
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <button onClick={capture} className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 shadow-lg">
          <Camera className="h-8 w-8 text-white" />
        </button>
      </div>
    </div>
  );
}
