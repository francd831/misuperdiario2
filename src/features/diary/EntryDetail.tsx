import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { entryRepository } from "@/core/storage/repositories/entryRepository";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, Sticker, Lock } from "lucide-react";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { StickerEditorModal } from "./StickerEditorModal";
import type { ExtendedEntry } from "./types";
import { isUnlocked } from "./types";

export function EntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<ExtendedEntry | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

  useEffect(() => {
    if (id) entryRepository.getById(id).then((e) => setEntry((e as ExtendedEntry) ?? null));
  }, [id]);

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

  const mediaUrl = entry.mediaBlob ? URL.createObjectURL(entry.mediaBlob) : entry.videoUrl || entry.audioUrl;

  return (
    <div className="flex min-h-screen flex-col gap-4 px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 truncate text-xl font-bold">{entry.title || entry.note || "Entrada"}</h1>
      </div>

      {!unlocked ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Lock className="h-16 w-16 text-muted-foreground" />
            <p className="text-lg font-semibold">Cápsula del tiempo bloqueada</p>
            <p className="text-sm text-muted-foreground">
              Se desbloqueará el {entry.unlockAt ? new Date(entry.unlockAt).toLocaleDateString("es") : "—"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {entry.type === "video" && mediaUrl ? (
            <video src={mediaUrl} controls className="w-full rounded-xl" />
          ) : entry.type === "audio" && mediaUrl ? (
            <div className="rounded-xl bg-card p-6">
              <audio src={mediaUrl} controls className="w-full" />
            </div>
          ) : (
            <p className="text-muted-foreground">Sin contenido multimedia</p>
          )}

          {/* Sticker overlays layer */}
          {entry.stickerOverlays && entry.stickerOverlays.length > 0 && (
            <div className="pointer-events-none absolute inset-0">
              {entry.stickerOverlays.map((s, i) => (
                <div
                  key={i}
                  className="absolute text-3xl"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    transform: `scale(${s.scale}) rotate(${s.rotation}deg)`,
                  }}
                >
                  ⭐
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {new Date(entry.createdAt).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          {entry.duration ? ` · ${Math.floor(entry.duration / 60)}:${String(Math.floor(entry.duration % 60)).padStart(2, "0")}` : ""}
        </p>
        {entry.note && <p className="text-sm">{entry.note}</p>}
      </div>

      {unlocked && (
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => setShowStickers(true)}>
            <Sticker className="h-4 w-4" /> Editar stickers
          </Button>
          <Button variant="destructive" size="icon" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
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

      {showStickers && (
        <StickerEditorModal
          entry={entry}
          onClose={() => setShowStickers(false)}
          onSave={async (overlays) => {
            const updated = { ...entry, stickerOverlays: overlays };
            await entryRepository.save(updated as any);
            setEntry(updated);
            setShowStickers(false);
          }}
        />
      )}
    </div>
  );
}
