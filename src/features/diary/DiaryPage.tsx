import { useEffect, useMemo, useState } from "react";
import { Lock, Search } from "lucide-react";
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

export default function DiaryPage() {
  const { activeProfile } = useProfiles();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!activeProfile) return;
    void entryRepository.listByProfile(activeProfile.id).then(setEntries);
  }, [activeProfile]);

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return entries;
    return entries.filter((entry) => `${entry.title ?? ""} ${entry.note ?? ""}`.toLowerCase().includes(normalized));
  }, [entries, query]);

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Diario"
        title="Tus recuerdos"
        description="Entradas guardadas en local para el perfil activo."
      />

      <label className="toolbar-placeholder toolbar-placeholder--input">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por titulo o texto"
        />
      </label>

      {filteredEntries.length === 0 ? (
        <section className="empty-state">
          <Lock size={28} />
          <h2>Aun no hay entradas</h2>
          <p>Empieza escribiendo un recuerdo desde la pantalla de inicio.</p>
        </section>
      ) : (
        <div className="entry-list">
          {filteredEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}

function EntryCard({ entry }: { entry: DiaryEntry }) {
  const mediaUrl = useObjectUrl(entry.mediaBlob);

  return (
    <article className="entry-card">
      <div className="entry-card__body">
        <p className="entry-card__date">{formatDate(entry.date)}</p>
        <h2>{entry.title || "Entrada sin titulo"}</h2>
        {entry.note && <p>{entry.note}</p>}
        {entry.type === "audio" && mediaUrl && <audio src={mediaUrl} controls />}
        {entry.type === "video" && mediaUrl && <video src={mediaUrl} controls playsInline />}
      </div>
      <div className="entry-card__meta">
        <span className="entry-card__badge">{entry.type}</span>
        {entry.isLocked && <span className="entry-card__badge">Capsula</span>}
      </div>
    </article>
  );
}
