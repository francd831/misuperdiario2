import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { dbGet, dbSet, dbDelete, dbListByIndex } from "@/core/storage/indexeddb";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";

export function PhotoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<any>(null);
  const [allIds, setAllIds] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    dbGet("daily_photos", id).then((p) => {
      if (p) { setPhoto(p); setCaption((p as any).caption || ""); }
    });
    dbListByIndex("daily_photos", "by-profile", "default").then((all) => {
      setAllIds(all.sort((a: any, b: any) => b.date.localeCompare(a.date)).map((p: any) => p.id));
    });
  }, [id]);

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

  return (
    <div className="flex min-h-screen flex-col gap-4 px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/daily-photo")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="flex-1 text-xl font-bold">{new Date(photo.date).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}</h1>
      </div>

      <img src={URL.createObjectURL(photo.blob)} alt={photo.date} className="w-full rounded-xl" />

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

      <Button variant="destructive" className="gap-2" onClick={() => setShowDelete(true)}>
        <Trash2 className="h-4 w-4" /> Eliminar
      </Button>

      <ConfirmDialog open={showDelete} title="Eliminar foto" description="No se puede deshacer." confirmLabel="Eliminar" destructive onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
    </div>
  );
}
