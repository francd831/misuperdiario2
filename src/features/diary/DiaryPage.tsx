import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, FileText, Lock, Mic, Search, Sparkles, Video } from "lucide-react";
import { dailyPhotoRepository } from "../../core/daily-photo/dailyPhotoRepository";
import type { DailyPhoto } from "../../core/daily-photo/types";
import { entryRepository } from "../../core/diary/entryRepository";
import type { DiaryEntry } from "../../core/diary/types";
import {
  addStickerOverlay,
  normalizeOverlayProject,
  removeStickerOverlay,
  setFrameOverlay,
  updateFrameOverlay,
  updateStickerOverlay,
} from "../../core/overlays/overlayProject";
import type { FrameOverlay, OverlayProject, StickerOverlay } from "../../core/overlays/types";
import { packService } from "../../core/packs/packService";
import type { PackAsset, PackWithAssets } from "../../core/packs/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { useObjectUrl } from "../../shared/hooks/useObjectUrl";
import { PageHeader } from "../../shared/ui/PageHeader";
import { FrameCanvas } from "../stickers/FrameCanvas";
import { FrameTray } from "../stickers/FrameTray";
import { StickerCanvas } from "../stickers/StickerCanvas";
import { StickerTray } from "../stickers/StickerTray";

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
      overlayProject?: OverlayProject;
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
    overlayProject: photo.overlayProject,
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
  const [packs] = useState<PackWithAssets[]>(() => packService.listPacks());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [draftOverlays, setDraftOverlays] = useState<OverlayProject>({ stickers: [] });
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | "frame" | null>(null);
  const activePack = packs.find((pack) => pack.manifest.id === activeProfile?.activePackId) ?? packs[0];

  const refreshItems = useCallback(async () => {
    if (!activeProfile) return;
    const [nextEntries, nextPhotos] = await Promise.all([
      entryRepository.listByProfile(activeProfile.id),
      dailyPhotoRepository.listByProfile(activeProfile.id),
    ]);
    setItems(sortNewest([
      ...nextEntries.map((entry) => ({ ...entry, kind: "entry" as const })),
      ...nextPhotos.map(photoToTimelineItem),
    ]));
  }, [activeProfile]);

  useEffect(() => {
    if (!activeProfile) return;
    let alive = true;

    void Promise.all([entryRepository.listByProfile(activeProfile.id), dailyPhotoRepository.listByProfile(activeProfile.id)]).then(([nextEntries, nextPhotos]) => {
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

  function startEdit(entry: TimelineItem) {
    if (entry.kind !== "entry" || entry.type !== "video") return;
    setEditingEntryId(entry.id);
    setDraftOverlays(normalizeOverlayProject(entry.overlayProject));
    setSelectedOverlayId(null);
  }

  function addSticker(sticker: PackAsset) {
    setDraftOverlays((current) => addStickerOverlay(current, { packId: sticker.packId, assetId: sticker.id }));
    setSelectedOverlayId(null);
  }

  function selectFrame(frame: PackAsset) {
    setDraftOverlays((current) => setFrameOverlay(current, { packId: frame.packId, assetId: frame.id }));
    setSelectedOverlayId("frame");
  }

  async function saveDecorations(entryId: string) {
    await entryRepository.updateOverlayProject(entryId, draftOverlays);
    setEditingEntryId(null);
    setSelectedOverlayId(null);
    await refreshItems();
  }

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
            <TimelineDay
              key={group.date}
              date={group.date}
              entries={group.entries}
              packs={packs}
              activePack={activePack}
              editingEntryId={editingEntryId}
              draftOverlays={draftOverlays}
              selectedOverlayId={selectedOverlayId}
              onStartEdit={startEdit}
              onCancelEdit={() => {
                setEditingEntryId(null);
                setSelectedOverlayId(null);
              }}
              onAddSticker={addSticker}
              onSelectFrame={selectFrame}
              onClearFrame={() => {
                setDraftOverlays((current) => setFrameOverlay(current));
                setSelectedOverlayId(null);
              }}
              onSelectOverlay={setSelectedOverlayId}
              onUpdateSticker={(overlayId, patch) => setDraftOverlays((current) => updateStickerOverlay(current, overlayId, patch))}
              onRemoveSticker={(overlayId) => {
                setDraftOverlays((current) => removeStickerOverlay(current, overlayId));
                setSelectedOverlayId(null);
              }}
              onUpdateFrame={(patch) => setDraftOverlays((current) => updateFrameOverlay(current, patch))}
              onRemoveFrame={() => {
                setDraftOverlays((current) => setFrameOverlay(current));
                setSelectedOverlayId(null);
              }}
              onSaveDecorations={saveDecorations}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface DecorationEditProps {
  packs: PackWithAssets[];
  activePack?: PackWithAssets;
  editingEntryId: string | null;
  draftOverlays: OverlayProject;
  selectedOverlayId: string | "frame" | null;
  onStartEdit: (entry: TimelineItem) => void;
  onCancelEdit: () => void;
  onAddSticker: (sticker: PackAsset) => void;
  onSelectFrame: (frame: PackAsset) => void;
  onClearFrame: () => void;
  onSelectOverlay: (overlayId: string | "frame") => void;
  onUpdateSticker: (overlayId: string, patch: Partial<StickerOverlay>) => void;
  onRemoveSticker: (overlayId: string) => void;
  onUpdateFrame: (patch: Partial<FrameOverlay>) => void;
  onRemoveFrame: () => void;
  onSaveDecorations: (entryId: string) => Promise<void>;
}

function TimelineDay({ date, entries, ...editProps }: { date: string; entries: TimelineItem[] } & DecorationEditProps) {
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
            <EntryCard key={entry.id} entry={entry} {...editProps} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EntryCard({
  entry,
  packs,
  activePack,
  editingEntryId,
  draftOverlays,
  selectedOverlayId,
  onStartEdit,
  onCancelEdit,
  onAddSticker,
  onSelectFrame,
  onClearFrame,
  onSelectOverlay,
  onUpdateSticker,
  onRemoveSticker,
  onUpdateFrame,
  onRemoveFrame,
  onSaveDecorations,
}: { entry: TimelineItem } & DecorationEditProps) {
  const mediaUrl = useObjectUrl(entry.kind === "entry" ? entry.mediaBlob : undefined);
  const photoUrl = useObjectUrl(entry.kind === "photo" ? entry.photoBlob : undefined);
  const overlays = editingEntryId === entry.id ? draftOverlays : entry.overlayProject;
  const canDecorate = entry.kind === "entry" && entry.type === "video";

  return (
    <article className={`entry-card entry-card--${entry.type}`}>
      <div className="entry-card__icon" aria-hidden="true">
        {getTypeIcon(entry.type)}
      </div>
      <div className="entry-card__body">
        <h2>{entry.title || "Entrada sin titulo"}</h2>
        {entry.note && <p>{entry.note}</p>}
        {entry.type === "photo" && photoUrl && (
          <div className="sticker-stage">
            <img className="entry-card__photo" src={photoUrl} alt="" />
            <StickerCanvas overlays={entry.overlayProject ?? []} packs={packs} />
            <FrameCanvas overlays={entry.overlayProject} packs={packs} />
          </div>
        )}
        {entry.type === "audio" && mediaUrl && <audio src={mediaUrl} controls />}
        {entry.type === "video" && mediaUrl && (
          <div className="sticker-stage">
            <video src={mediaUrl} controls playsInline />
            <StickerCanvas
              overlays={overlays ?? []}
              packs={packs}
              editable={editingEntryId === entry.id}
              selectedId={typeof selectedOverlayId === "string" && selectedOverlayId !== "frame" ? selectedOverlayId : undefined}
              onSelect={onSelectOverlay}
              onUpdate={onUpdateSticker}
              onRemove={onRemoveSticker}
            />
            <FrameCanvas
              overlays={overlays}
              packs={packs}
              editable={editingEntryId === entry.id}
              selected={selectedOverlayId === "frame"}
              onSelect={() => onSelectOverlay("frame")}
              onUpdate={onUpdateFrame}
              onRemove={onRemoveFrame}
            />
          </div>
        )}
        {canDecorate && editingEntryId !== entry.id && (
          <button className="secondary-action" type="button" onClick={() => onStartEdit(entry)}>
            Decorar video
          </button>
        )}
        {canDecorate && editingEntryId === entry.id && (
          <div className="form-panel">
            <StickerTray stickers={activePack?.stickers ?? []} onSelect={onAddSticker} />
            <FrameTray frames={activePack?.frames ?? []} onSelect={onSelectFrame} onClear={onClearFrame} />
            <div className="inline-actions">
              <button className="primary-action" type="button" onClick={() => void onSaveDecorations(entry.id)}>
                Guardar decoracion
              </button>
              <button className="secondary-action" type="button" onClick={onCancelEdit}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="entry-card__meta">
        <span className="entry-card__badge">{entry.type === "photo" ? "Foto" : getTypeLabel(entry.type)}</span>
        {entry.isLocked && <span className="entry-card__badge">Capsula</span>}
      </div>
    </article>
  );
}
