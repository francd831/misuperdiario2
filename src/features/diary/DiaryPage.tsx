import { useEffect, useMemo, useState } from "react";
import { Camera, FileText, Lock, Mic, Search, Sparkles, Video } from "lucide-react";
import { dailyPhotoRepository } from "../../core/daily-photo/dailyPhotoRepository";
import type { DailyPhoto } from "../../core/daily-photo/types";
import { entryRepository } from "../../core/diary/entryRepository";
import type { DiaryEntry } from "../../core/diary/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { useObjectUrl } from "../../shared/hooks/useObjectUrl";
import { PageHeader } from "../../shared/ui/PageHeader";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTimelineDay(value: string) {
  return new Date(value).toLocaleDateString("es", {
    day: "2-digit",
  });
}

function formatTimelineMonth(value: string) {
  return new Date(value).toLocaleDateString("es", {
    month: "short",
  });
}

function getTypeLabel(type: DiaryEntry["type"]) {
  if (type === "audio") return "Voz";
  if (type === "video") return "Video";
  return "Texto";
}

function getTypeIcon(type: TimelineItem["type"]) {
  if (type === "photo") return <Camera size={17} />;
  if (type === "audio") return <Mic size={17} />;
  if (type === "video") return <Video size={17} />;
  return <FileText size={17} />;
}

type TimelineItem =
  | ({ kind: "entry" } & DiaryEntry)
  | {
      kind: "photo";
      id: string;
      profileId: string;
      type: "photo";
      date: string;
      title?: string;
      note?: string;
      photoBlob: Blob;
      createdAt: string;
      updatedAt: string;
      isLocked: false;
    };

function photoToTimelineItem(photo: DailyPhoto): TimelineItem {
  return {
    kind: "photo",
    id: photo.id,
    profileId: photo.profileId,
    type: "photo",
    date: photo.date,
    title: "Foto diaria",
    note: photo.caption,
    photoBlob: photo.thumbnailBlob ?? photo.blob,
    createdAt: photo.createdAt,
    updatedAt: photo.updatedAt,
    isLocked: false,
  };
}

function sortNewest(items: TimelineItem[]) {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default function DiaryPage() {
  const { activeProfile } = useProfiles();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!activeProfile) return;
    let alive = true;

    void Promise.all([
      entryRepository.listByProfile(activeProfile.id),
      dailyPhotoRepository.listByProfile(activeProfile.id),
    ]).then(([nextEntries, nextPhotos]) => {
      if (!alive) return;
      setItems(sortNewest([
        ...nextEntries.map((entry) => ({ ...entry, kind: "entry" as const })),
        ...nextPhotos.map(photoToTimelineItem),
      ]));
    });

    return () => {
      alive = false;
    };
  }, [activeProfile]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => `${item.title ?? ""} ${item.note ?? ""} ${item.type}`.toLowerCase().includes(normalized));
  }, [items, query]);

  const groupedEntries = useMemo(() => {
    const groups = new Map<string, TimelineItem[]>();
    filteredItems.forEach((entry) => {
      const dayEntries = groups.get(entry.date) ?? [];
      dayEntries.push(entry);
      groups.set(entry.date, dayEntries);
    });
    return Array.from(groups.entries()).map(([date, dayEntries]) => ({ date, entries: dayEntries }));
  }, [filteredItems]);

  return (
    <section className="page-stack diary-page">
      <PageHeader
        eyebrow="Diario"
        title="Album de recuerdos"
        description="Todo lo que has guardado, ordenado por dias como una aventura."
        backTo="/home"
      />

      <section className="diary-toolbar">
        <label className="diary-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar recuerdo"
          />
        </label>
        <div className="diary-counter" aria-label={`${filteredItems.length} recuerdos visibles`}>
          <Sparkles size={17} />
          <strong>{filteredItems.length}</strong>
          <span>recuerdos</span>
        </div>
      </section>

      {filteredItems.length === 0 ? (
        <section className="empty-state">
          <Lock size={28} />
          <h2>{query ? "No encuentro ese recuerdo" : "Aun no hay recuerdos"}</h2>
          <p>{query ? "Prueba con otra palabra." : "Empieza creando un video, una voz, una foto o un texto desde el inicio."}</p>
        </section>
      ) : (
        <div className="diary-timeline" aria-label="Linea temporal de recuerdos">
          {groupedEntries.map((group) => (
            <TimelineDay key={group.date} date={group.date} entries={group.entries} />
          ))}
        </div>
      )}
    </section>
  );
}

function TimelineDay({ date, entries }: { date: string; entries: TimelineItem[] }) {
  return (
    <section className="timeline-day">
      <div className="timeline-date" aria-label={formatDate(date)}>
        <span className="timeline-date__day">{formatTimelineDay(date)}</span>
        <span className="timeline-date__month">{formatTimelineMonth(date)}</span>
      </div>
      <div className="timeline-day__content">
        <header className="timeline-day__header">
          <h2>{formatDate(date)}</h2>
          <span>{entries.length} recuerdos</span>
        </header>
        <div className="entry-list">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EntryCard({ entry }: { entry: TimelineItem }) {
  const mediaUrl = useObjectUrl(entry.kind === "entry" ? entry.mediaBlob : undefined);
  const photoUrl = useObjectUrl(entry.kind === "photo" ? entry.photoBlob : undefined);

  return (
    <article className={`entry-card entry-card--${entry.type}`}>
      <div className="entry-card__icon" aria-hidden="true">
        {getTypeIcon(entry.type)}
      </div>
      <div className="entry-card__body">
        <h2>{entry.title || "Entrada sin titulo"}</h2>
        {entry.note && <p>{entry.note}</p>}
        {entry.type === "photo" && photoUrl && <img className="entry-card__photo" src={photoUrl} alt="" />}
        {entry.type === "audio" && mediaUrl && <audio src={mediaUrl} controls />}
        {entry.type === "video" && mediaUrl && <video src={mediaUrl} controls playsInline />}
      </div>
      <div className="entry-card__meta">
        <span className="entry-card__badge">{entry.type === "photo" ? "Foto" : getTypeLabel(entry.type)}</span>
        {entry.isLocked && <span className="entry-card__badge">Capsula</span>}
      </div>
    </article>
  );
}
