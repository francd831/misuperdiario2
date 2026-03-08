import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { entryRepository } from "@/core/storage/repositories/entryRepository";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, Lock, Play, Pause, RotateCcw, Gauge, ArrowLeftRight } from "lucide-react";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { usePack } from "@/core/packs/PackContext";
import { OverlayLayer } from "@/features/overlays/OverlayLayer";
import { OverlayTray } from "@/features/overlays/OverlayTray";
import { useOverlayProject } from "@/features/overlays/useOverlayProject";
import { migrateLegacyOverlays, type OverlayProject } from "@/core/media/overlays/overlayEngine";
import type { ExtendedEntry } from "./types";
import { isUnlocked } from "./types";

const SPEED_OPTIONS = [0.5, 1, 2, 4] as const;

export function EntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<ExtendedEntry | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const { activePack } = usePack();

  useEffect(() => {
    if (id) entryRepository.getById(id).then((e) => setEntry((e as ExtendedEntry) ?? null));
  }, [id]);

  const initialOverlays: OverlayProject =
    (entry as any)?.overlayProject ??
    (entry?.stickerOverlays?.length
      ? migrateLegacyOverlays(entry.stickerOverlays, activePack?.id ?? "base")
      : []);

  const persist = async (project: OverlayProject) => {
    if (!entry) return;
    const updated = { ...entry, overlayProject: project } as any;
    await entryRepository.save(updated);
    setEntry(updated);
  };

  const { overlays, selectedId, setSelectedId, setOverlays, addOverlay, deleteSelected } =
    useOverlayProject(initialOverlays, persist);

  const mediaUrl = useMemo(
    () =>
      entry?.mediaBlob ? URL.createObjectURL(entry.mediaBlob) : entry?.videoUrl || entry?.audioUrl,
    [entry?.mediaBlob, entry?.videoUrl, entry?.audioUrl],
  );

  useEffect(() => {
    return () => {
      if (mediaUrl?.startsWith("blob:")) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  if (!entry) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  const unlocked = isUnlocked(entry);
  const handleDelete = async () => {
    await entryRepository.remove(entry.id);
    navigate("/");
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-1 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 truncate text-lg font-bold">
          {entry.title || entry.note || "Entrada"}
        </h1>
        {unlocked && (
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      {!unlocked ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <Lock className="h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-semibold">Cápsula del tiempo bloqueada</p>
              <p className="text-sm text-muted-foreground">
                Se desbloqueará el{" "}
                {entry.unlockAt
                  ? new Date(entry.unlockAt).toLocaleDateString("es")
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-0 px-3 pb-1 flex items-center justify-center">
            {entry.type === "video" && mediaUrl ? (
              <OverlayLayer
                overlays={overlays}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onChange={setOverlays}
                className="rounded-xl max-h-full max-w-full"
              >
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  className="max-h-full max-w-full object-contain rounded-xl"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onEnded={() => setPlaying(false)}
                  playsInline
                />
              </OverlayLayer>
            ) : entry.type === "audio" && mediaUrl ? (
              <OverlayLayer
                overlays={overlays}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onChange={setOverlays}
                className="rounded-xl bg-card p-6 max-h-full max-w-full flex items-center"
              >
                <audio src={mediaUrl} controls className="w-full" />
              </OverlayLayer>
            ) : entry.type === "text" ? (
              <div className="rounded-xl bg-card p-6 max-h-full w-full overflow-y-auto">
                <p className="whitespace-pre-wrap text-base leading-relaxed">
                  {entry.note || "Sin contenido"}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <p className="text-muted-foreground">Sin contenido multimedia</p>
              </div>
            )}
          </div>

          {/* Video controls */}
          {entry.type === "video" && mediaUrl && (
            <div className="shrink-0 flex items-center justify-center gap-3 px-4 py-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.pause();
                    setPlaying(false);
                  }
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-11 w-11 rounded-full"
                onClick={() => {
                  if (videoRef.current) {
                    playing ? videoRef.current.pause() : videoRef.current.play();
                  }
                }}
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
            </div>
          )}

          {/* Info bar */}
          <div className="shrink-0 px-4 py-1">
            <p className="text-xs text-muted-foreground">
              {new Date(entry.createdAt).toLocaleDateString("es", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {entry.duration
                ? ` · ${Math.floor(entry.duration / 60)}:${String(
                    Math.floor(entry.duration % 60),
                  ).padStart(2, "0")}`
                : ""}
            </p>
            {entry.note && entry.type !== "text" && (
              <p className="text-sm mt-0.5">{entry.note}</p>
            )}
          </div>

          {/* Editor tray (not for text) */}
          {entry.type !== "text" && (
            <OverlayTray
              selectedId={selectedId}
              overlays={overlays}
              onAdd={addOverlay}
              onChange={setOverlays}
              onDelete={deleteSelected}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={showDelete}
        title="Eliminar entrada"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
