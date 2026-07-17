import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Camera, FileText, Lock, Mic, Search, Sparkles, Trash2, Video } from "lucide-react";
import { dailyPhotoRepository } from "../../core/daily-photo/dailyPhotoRepository";
import type { DailyPhoto } from "../../core/daily-photo/types";
import { entryRepository } from "../../core/diary/entryRepository";
import type { DiaryEntry } from "../../core/diary/types";
import {
  addStickerOverlay,
  addVisualOverlay,
  normalizeOverlayProject,
  removeStickerOverlay,
  setFilterOverlay,
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
import { AssetTray } from "../stickers/AssetTray";
import { FilterCanvas } from "../stickers/FilterCanvas";
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

  function selectFilter(filter: PackAsset) {
    setDraftOverlays((current) => setFilterOverlay(current, { packId: filter.packId, assetId: filter.id, assetKind: "filters" }));
    setSelectedOverlayId(null);
  }

  function addPackAsset(asset: PackAsset, assetKind: "speechBubbles" | "stamps" | "masks" | "effects") {
    setDraftOverlays((current) => addVisualOverlay(current, { packId: asset.packId, assetId: asset.id, assetKind }));
    setSelectedOverlayId(null);
  }

  async function saveDecorations(entryId: string) {
    await entryRepository.updateOverlayProject(entryId, draftOverlays);
    setEditingEntryId(null);
    setSelectedOverlayId(null);
    await refreshItems();
  }

  async function deleteItem(item: TimelineItem) {
    const label = item.type === "photo" ? "esta foto" : item.type === "video" ? "este vídeo" : "este recuerdo";
    if (!window.confirm(`¿Quieres borrar ${label}? No se podrá recuperar.`)) return;
    if (item.kind === "photo") await dailyPhotoRepository.remove(item.id);
    else await entryRepository.remove(item.id);
    if (editingEntryId === item.id) setEditingEntryId(null);
    await refreshItems();
  }

  return (
    <section className="page-stack diary-page">
      <PageHeader
        title="Diario"
        icon={<BookOpen size={22} />}
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
        <div className="diary-timeline" aria-label="Línea temporal de recuerdos">
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
              onSelectFilter={selectFilter}
              onAddPackAsset={addPackAsset}
              onClearFrame={() => {
                setDraftOverlays((current) => setFrameOverlay(current));
                setSelectedOverlayId(null);
              }}
              onClearFilter={() => {
                setDraftOverlays((current) => setFilterOverlay(current));
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
              onDelete={(item) => void deleteItem(item)}
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
  onSelectFilter: (filter: PackAsset) => void;
  onAddPackAsset: (asset: PackAsset, assetKind: "speechBubbles" | "stamps" | "masks" | "effects") => void;
  onClearFrame: () => void;
  onClearFilter: () => void;
  onSelectOverlay: (overlayId: string | "frame") => void;
  onUpdateSticker: (overlayId: string, patch: Partial<StickerOverlay>) => void;
  onRemoveSticker: (overlayId: string) => void;
  onUpdateFrame: (patch: Partial<FrameOverlay>) => void;
  onRemoveFrame: () => void;
  onSaveDecorations: (entryId: string) => Promise<void>;
  onDelete: (entry: TimelineItem) => void;
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
  onSelectFilter,
  onAddPackAsset,
  onClearFrame,
  onClearFilter,
  onSelectOverlay,
  onUpdateSticker,
  onRemoveSticker,
  onUpdateFrame,
  onRemoveFrame,
  onSaveDecorations,
  onDelete,
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
            <FilterCanvas overlays={entry.overlayProject} packs={packs} />
            <StickerCanvas overlays={entry.overlayProject ?? []} packs={packs} />
            <FrameCanvas overlays={entry.overlayProject} packs={packs} />
          </div>
        )}
        {entry.type === "audio" && mediaUrl && <audio src={mediaUrl} controls />}
        {entry.type === "video" && mediaUrl && (
          <div className="sticker-stage">
            <video src={mediaUrl} controls playsInline />
            <FilterCanvas overlays={overlays} packs={packs} />
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
            <AssetTray
              label="Filtros del pack activo"
              emptyTitle="Sin filtros"
              emptyDescription="El pack activo no tiene filtros disponibles."
              assets={activePack?.filters ?? []}
              onSelect={onSelectFilter}
              onClear={onClearFilter}
              clearLabel="Sin filtro"
            />
            <AssetTray
              label="Bocadillos del pack activo"
              emptyTitle="Sin bocadillos"
              emptyDescription="El pack activo no tiene bocadillos disponibles."
              assets={activePack?.speechBubbles ?? []}
              onSelect={(asset) => onAddPackAsset(asset, "speechBubbles")}
            />
            <AssetTray
              label="Sellos del pack activo"
              emptyTitle="Sin sellos"
              emptyDescription="El pack activo no tiene sellos disponibles."
              assets={activePack?.stamps ?? []}
              onSelect={(asset) => onAddPackAsset(asset, "stamps")}
            />
            <AssetTray
              label="Máscaras del pack activo"
              emptyTitle="Sin mascaras"
              emptyDescription="El pack activo no tiene mascaras disponibles."
              assets={activePack?.masks ?? []}
              onSelect={(asset) => onAddPackAsset(asset, "masks")}
            />
            <AssetTray
              label="Efectos del pack activo"
              emptyTitle="Sin efectos"
              emptyDescription="El pack activo no tiene efectos disponibles."
              assets={activePack?.effects ?? []}
              onSelect={(asset) => onAddPackAsset(asset, "effects")}
            />
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
        <button className="danger-icon-action" type="button" onClick={() => onDelete(entry)} aria-label={`Borrar ${entry.type === "photo" ? "foto" : "recuerdo"}`}>
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}
