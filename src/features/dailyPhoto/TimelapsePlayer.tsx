import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { timelapseService } from "@/core/media/timelapse/timelapseService";

export function TimelapsePlayer() {
  const navigate = useNavigate();
  const [frames, setFrames] = useState<{ date: string; url: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [range, setRange] = useState("all");
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    timelapseService.loadFrames("default").then((f) => {
      const urls = timelapseService.createObjectUrls(f);
      setFrames(f.map((frame, i) => ({ date: frame.date, url: urls[i] })));
    });
    return () => { cancelRef.current?.(); };
  }, []);

  const filteredFrames = (() => {
    if (range === "all") return frames;
    const days = range === "30" ? 30 : range === "90" ? 90 : 365;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return frames.filter((f) => f.date >= cutoffStr);
  })();

  const play = useCallback(() => {
    if (filteredFrames.length === 0) return;
    setPlaying(true);
    let idx = currentIndex;
    cancelRef.current?.();
    const cancel = () => { cancelled = true; };
    let cancelled = false;
    const step = () => {
      if (cancelled) return;
      if (idx >= filteredFrames.length) { setPlaying(false); return; }
      setCurrentIndex(idx);
      idx++;
      setTimeout(step, speed);
    };
    step();
    cancelRef.current = cancel;
  }, [filteredFrames, currentIndex, speed]);

  const pause = () => {
    cancelRef.current?.();
    setPlaying(false);
  };

  if (frames.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 pb-24">
        <p className="text-4xl">📷</p>
        <p className="text-muted-foreground">No hay fotos para el timelapse</p>
        <Button variant="outline" onClick={() => navigate("/daily-photo")}>Volver</Button>
      </div>
    );
  }

  const current = filteredFrames[currentIndex] || filteredFrames[0];

  return (
    <div className="flex min-h-screen flex-col gap-4 px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => { pause(); navigate("/daily-photo"); }}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Timelapse</h1>
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        {current && <img src={current.url} alt={current.date} className="h-full w-full object-cover" />}
        {current && (
          <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
            {new Date(current.date).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button size="icon" variant="outline" onClick={playing ? pause : play}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Slider
          value={[currentIndex]}
          max={filteredFrames.length - 1}
          step={1}
          onValueChange={([v]) => { pause(); setCurrentIndex(v); }}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground">{currentIndex + 1}/{filteredFrames.length}</span>
      </div>

      <div className="flex gap-2">
        <Select value={range} onValueChange={(v) => { setRange(v); setCurrentIndex(0); }}>
          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo</SelectItem>
            <SelectItem value="30">30 días</SelectItem>
            <SelectItem value="90">90 días</SelectItem>
            <SelectItem value="365">1 año</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(speed)} onValueChange={(v) => setSpeed(Number(v))}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="250">0.25s</SelectItem>
            <SelectItem value="500">0.5s</SelectItem>
            <SelectItem value="1000">1s</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
