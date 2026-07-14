import { useEffect, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import { dailyPhotoRepository } from "../../core/daily-photo/dailyPhotoRepository";
import type { DailyPhoto } from "../../core/daily-photo/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { useObjectUrl } from "../../shared/hooks/useObjectUrl";
import { PageHeader } from "../../shared/ui/PageHeader";

function cutoffForRange(range: string) {
  if (range === "all") return "";
  const days = Number(range);
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function CurrentPhoto({ photo }: { photo?: DailyPhoto }) {
  const url = useObjectUrl(photo?.blob);
  if (!photo || !url) return <div className="media-placeholder">Sin fotos todavia</div>;

  return (
    <div className="timelapse-frame">
      <img src={url} alt={photo.caption || photo.date} />
      <span>{new Date(photo.date).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}</span>
    </div>
  );
}

export default function TimelapsePage() {
  const { activeProfile } = useProfiles();
  const [photos, setPhotos] = useState<DailyPhoto[]>([]);
  const [range, setRange] = useState("all");
  const [speed, setSpeed] = useState(700);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!activeProfile) return;
    void dailyPhotoRepository.listTimeline(activeProfile.id).then(setPhotos);
  }, [activeProfile]);

  const filteredPhotos = useMemo(() => {
    const cutoff = cutoffForRange(range);
    return cutoff ? photos.filter((photo) => photo.date >= cutoff) : photos;
  }, [photos, range]);

  useEffect(() => {
    setCurrentIndex(0);
    setPlaying(false);
  }, [range]);

  useEffect(() => {
    if (!playing || filteredPhotos.length === 0) return undefined;
    const timer = window.setInterval(() => {
      setCurrentIndex((index) => {
        if (index >= filteredPhotos.length - 1) {
          setPlaying(false);
          return index;
        }
        return index + 1;
      });
    }, speed);

    return () => window.clearInterval(timer);
  }, [filteredPhotos.length, playing, speed]);

  const current = filteredPhotos[currentIndex];

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Timelapse"
        title="Tu crecimiento en fotos"
        description="Reproductor por perfil con rango, velocidad y object URLs controladas."
        backTo="/daily-photo"
      />

      <CurrentPhoto photo={current} />

      {filteredPhotos.length > 0 && (
        <section className="form-panel">
          <div className="timelapse-controls">
            <button className="primary-action" type="button" onClick={() => setPlaying((value) => !value)}>
              {playing ? <Pause size={18} /> : <Play size={18} />}
              {playing ? "Pausar" : "Reproducir"}
            </button>
            <span>
              {currentIndex + 1}/{filteredPhotos.length}
            </span>
          </div>

          <label>
            Posicion
            <input
              type="range"
              min={0}
              max={filteredPhotos.length - 1}
              value={currentIndex}
              onChange={(event) => {
                setPlaying(false);
                setCurrentIndex(Number(event.target.value));
              }}
            />
          </label>

          <label>
            Rango
            <select value={range} onChange={(event) => setRange(event.target.value)}>
              <option value="all">Todo</option>
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
              <option value="365">1 ano</option>
            </select>
          </label>

          <label>
            Velocidad
            <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
              <option value={1000}>Lenta</option>
              <option value={700}>Normal</option>
              <option value={350}>Rapida</option>
            </select>
          </label>
        </section>
      )}
    </section>
  );
}
