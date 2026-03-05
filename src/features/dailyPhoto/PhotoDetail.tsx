import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight, Sticker, Download } from "lucide-react";
import { dbGet, dbSet, dbDelete, dbListByIndex } from "@/core/storage/indexeddb";
import type { StickerOverlay } from "@/core/storage/indexeddb";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { StickerEditorModal } from "@/features/diary/StickerEditorModal";
import { usePack } from "@/core/packs/PackContext";

export function PhotoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<any>(null);
  const [allIds, setAllIds] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const { stickers } = usePack();

  useEffect(() => {
    if (!id) return;
    dbGet("daily_photos", id).then((p) => {
      if (p) {
        setPhoto(p);
        setCaption((p as any).caption || "");
        // If there's a rendered blob with stickers, show that
        if ((p as any).renderedBlob) {
          setRenderedUrl(URL.createObjectURL((p as any).renderedBlob));
        } else {
          setRenderedUrl(null);
        }
      }
    });
    dbListByIndex("daily_photos", "by-profile", "default").then((all) => {
      setAllIds(all.sort((a: any, b: any) => b.date.localeCompare(a.date)).map((p: any) => p.id));
    });
  }, [id]);

  // Cleanup URLs
  useEffect(() => {
    return () => {
      if (renderedUrl) URL.revokeObjectURL(renderedUrl);
    };
  }, [renderedUrl]);

  if (!photo) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Cargando…</p></div>;

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

  // Overlay layer for stickers on the photo (non-rendered preview)
  const overlays: StickerOverlay[] = (photo as any).stickerOverlays ?? [];

  const renderStickerContent = (stickerId: string) => {
    if (!stickerId.startsWith("pack-sticker-")) {
      return <span className="text-3xl leading-none select-none">{stickerId}</span>;
    }
    const i = parseInt(stickerId.replace("pack-sticker-", ""), 10);
    const url = stickers[i];
    if (url) return <img src={url} alt="" className="h-10 w-10 object-contain" draggable={false} />;
    return <span className="text-3xl leading-none select-none">⭐</span>;
  };

  return (
    <div className="flex min-h-screen flex-col gap-4 px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/daily-photo")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="flex-1 text-xl font-bold">{new Date(photo.date).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}</h1>
      </div>

      {/* Photo with sticker overlays */}
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={renderedUrl ?? photoUrl}
          alt={photo.date}
          className="w-full"
        />
        {/* Show live overlays only if no rendered version */}
        {!renderedUrl && overlays.length > 0 && (
          <div className="pointer-events-none absolute inset-0">
            {overlays.map((s, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  transform: `translate(-50%, -50%) scale(${s.scale}) rotate(${s.rotation}deg)`,
                }}
              >
                {renderStickerContent(s.stickerId)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" disabled={!prevId} onClick={() => prevId && navigate(`/daily-photo/${prevId}`)}>
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
        <Button variant="ghost" size="icon" disabled={!nextId} onClick={() => nextId && navigate(`/daily-photo/${nextId}`)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 gap-2" onClick={() => setShowStickers(true)}>
          <Sticker className="h-4 w-4" /> Stickers
        </Button>
        <Button variant="destructive" className="gap-2" onClick={() => setShowDelete(true)}>
          <Trash2 className="h-4 w-4" /> Eliminar
        </Button>
      </div>

      {/* Download rendered photo */}
      {renderedUrl && (
        <Button variant="outline" className="gap-2" asChild>
          <a href={renderedUrl} download={`foto-${photo.date}.jpg`}>
            <Download className="h-4 w-4" /> Descargar con stickers
          </a>
        </Button>
      )}

      <ConfirmDialog open={showDelete} title="Eliminar foto" description="No se puede deshacer." confirmLabel="Eliminar" destructive onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />

      {showStickers && (
        <StickerEditorModal
          entry={{
            id: photo.id,
            profileId: photo.profileId,
            date: photo.date,
            createdAt: photo.createdAt,
            updatedAt: photo.createdAt,
            type: "video",
            stickerOverlays: overlays,
          }}
          photoBlob={photo.blob}
          onClose={() => setShowStickers(false)}
          onSave={async (newOverlays, renderedBlob) => {
            const updated = { ...photo, stickerOverlays: newOverlays, renderedBlob };
            await dbSet("daily_photos", updated);
            setPhoto(updated);
            if (renderedBlob) {
              if (renderedUrl) URL.revokeObjectURL(renderedUrl);
              setRenderedUrl(URL.createObjectURL(renderedBlob));
            }
            setShowStickers(false);
          }}
        />
      )}
    </div>
  );
}
