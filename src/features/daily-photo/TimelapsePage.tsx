import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dailyPhotoRepository } from "../../core/daily-photo/dailyPhotoRepository";
import type { DailyPhoto } from "../../core/daily-photo/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { useObjectUrl } from "../../shared/hooks/useObjectUrl";

const SPEEDS = [0.5, 1, 2, 4] as const;

function shortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es", { day: "numeric", month: "short" });
}

function CurrentPhoto({ photo }: { photo?: DailyPhoto }) {
  const url = useObjectUrl(photo?.blob);
  if (!photo || !url) return <div className="media-placeholder">Todavía no hay fotos</div>;

  return (
    <div className="timelapse-frame">
      <img src={url} alt={photo.caption || photo.date} />
      <span>{new Date(photo.date).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}</span>
    </div>
  );
}

export default function TimelapsePage() {
  const navigate = useNavigate();
  const { activeProfile } = useProfiles();
  const [photos, setPhotos] = useState<DailyPhoto[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!activeProfile) return;
    void dailyPhotoRepository.listTimeline(activeProfile.id).then(setPhotos);
  }, [activeProfile]);

  useEffect(() => () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
  }, []);

  const filteredPhotos = useMemo(() => photos.slice(startIndex), [photos, startIndex]);

  useEffect(() => {
    setCurrentIndex(0);
    setPlaying(false);
  }, [startIndex]);

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
    }, 1000 / speed);

    return () => window.clearInterval(timer);
  }, [filteredPhotos.length, playing, speed]);

  const current = filteredPhotos[currentIndex];

  function closeTimelapse() {
    void document.exitFullscreen?.().catch(() => undefined);
    navigate("/daily-photo");
  }

  return (
    <section className="timelapse-page">
      <button className="timelapse-page__back" type="button" onClick={closeTimelapse} aria-label="Volver a las fotos"><ArrowLeft size={22} /></button>
      <div className="timelapse-page__title"><Play size={15} fill="currentColor" /><span>Timelapse</span></div>

      <CurrentPhoto key={current?.id ?? "empty"} photo={current} />

      {filteredPhotos.length > 0 && (
        <section className="timelapse-dock" aria-label="Controles del timelapse">
          <div className="timelapse-dock__playback">
            <button className="timelapse-dock__play" type="button" onClick={() => { if (!playing && currentIndex >= filteredPhotos.length - 1) setCurrentIndex(0); setPlaying((value) => !value); }} aria-label={playing ? "Pausar" : "Reproducir"}>
              {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            <span>{currentIndex + 1}/{filteredPhotos.length}</span>
          </div>
          <div className="timelapse-speed" aria-label="Velocidad">
            {SPEEDS.map((value) => <button key={value} className={speed === value ? "is-active" : ""} type="button" onClick={() => setSpeed(value)}>{value}x</button>)}
          </div>
          <label className="timelapse-range">
            <span><small>{photos[0] ? shortDate(photos[0].date) : "Inicio"}</small><strong>Desde {photos[startIndex] ? shortDate(photos[startIndex].date) : "hoy"}</strong><small>Hoy</small></span>
            <input type="range" min={0} max={Math.max(0, photos.length - 1)} value={startIndex} onChange={(event) => setStartIndex(Number(event.target.value))} aria-label="Elegir desde qué fecha comienza el timelapse" />
          </label>
        </section>
      )}
    </section>
  );
}
