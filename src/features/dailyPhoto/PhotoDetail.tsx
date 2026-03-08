import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { dbGet, dbSet, dbDelete, dbListByIndex } from "@/core/storage/indexeddb";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { usePack } from "@/core/packs/PackContext";
import { OverlayLayer } from "@/features/overlays/OverlayLayer";
import { OverlayTray } from "@/features/overlays/OverlayTray";
import { useOverlayProject } from "@/features/overlays/useOverlayProject";
import { migrateLegacyOverlays, type OverlayProject } from "@/core/media/overlays/overlayEngine";

export function PhotoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<any>(null);
  const [allIds, setAllIds] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const { activePack } = usePack();

  useEffect(() => {
    if (!id) return;
    dbGet("daily_photos", id).then((p) => {
      if (p) {
        setPhoto(p);
        setCaption((p as any).caption || "");
      }
    });
    dbListByIndex("daily_photos", "by-profile", "default").then((all) => {
      setAllIds(all.sort((a: any, b: any) => b.date.localeCompare(a.date)).map((p: any) => p.id));
    });
  }, [id]);

  const initialOverlays: OverlayProject =
    photo?.overlayProject ??
    (photo?.stickerOverlays?.length
      ? migrateLegacyOverlays(photo.stickerOverlays, activePack?.id ?? "base")
      : []);

  const persist = async (project: OverlayProject) => {
    if (!photo) return;
    const updated = { ...photo, overlayProject: project };
    await dbSet("daily_photos", updated);
    setPhoto(updated);
  };

  const { overlays, selectedId, setSelectedId, setOverlays, addOverlay, deleteSelected } =
    useOverlayProject(initialOverlays, persist);

  if (!photo)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );

  const idx = allIds.indexOf(id!);
  const prevId = idx > 0 ? allIds[idx - 1] : null;
  const nextId = idx < allIds.length - 1 ? allIds[idx + 1] : null;

  const saveCaption = async () => {
    await dbSet("daily_photos", { ...photo, caption });
    setPhoto({ ...photo, caption });
  };

  const handleDelete = async () => {
    await dbDelete("daily_photos", photo.id);
    navigate("/daily-photo");
  };

  const photoUrl = URL.createObjectURL(photo.blob);

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-1 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/daily-photo")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 text-lg font-bold truncate">
          {new Date(photo.date).toLocaleDateString("es", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Photo fits available space */}
      <div className="flex-1 min-h-0 px-3 pb-1">
        <OverlayLayer
          overlays={overlays}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChange={setOverlays}
          className="rounded-xl h-full"
        >
          <img src={photoUrl} alt={photo.date} className="h-full w-full object-contain rounded-xl" />
        </OverlayLayer>
      </div>

      {/* Caption + nav */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-1.5">
        <Button
          variant="ghost"
          size="icon"
          disabled={!prevId}
          onClick={() => prevId && navigate(`/daily-photo/${prevId}`)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <Input
            placeholder="Añade un caption…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={saveCaption}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          disabled={!nextId}
          onClick={() => nextId && navigate(`/daily-photo/${nextId}`)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Editor tray */}
      <OverlayTray
        selectedId={selectedId}
        onAdd={addOverlay}
        onDelete={deleteSelected}
      />

      <ConfirmDialog
        open={showDelete}
        title="Eliminar foto"
        description="No se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
