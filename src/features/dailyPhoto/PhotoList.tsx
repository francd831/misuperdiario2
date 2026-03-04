import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dbListByIndex, dbSet } from "@/core/storage/indexeddb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Play } from "lucide-react";

interface DailyPhoto {
  id: string;
  profileId: string;
  date: string;
  blob: Blob;
  thumbnailBlob?: Blob;
  caption?: string;
  createdAt: string;
}

export function PhotoList() {
  const [photos, setPhotos] = useState<DailyPhoto[]>([]);
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    dbListByIndex("daily_photos", "by-profile", "default").then((p) => {
      setPhotos((p as DailyPhoto[]).sort((a, b) => b.date.localeCompare(a.date)));
    });
  }, []);

  const hasToday = photos.some((p) => p.date === today);

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📸 Mi foto diaria</h1>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate("/daily-photo/timelapse")}>
          <Play className="h-4 w-4" /> Timelapse
        </Button>
      </div>

      {hasToday ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <p className="font-medium">¡Ya tienes foto de hoy!</p>
              <p className="text-xs text-muted-foreground">Puedes reemplazarla si quieres</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/daily-photo/capture")}>Reemplazar</Button>
          </CardContent>
        </Card>
      ) : (
        <Button className="gap-2" onClick={() => navigate("/daily-photo/capture")}>
          <Camera className="h-4 w-4" /> Hacer foto de hoy
        </Button>
      )}

      {photos.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-4xl">📷</p>
          <p className="text-muted-foreground">Aún no tienes fotos diarias</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {photos.map((p) => {
          const url = URL.createObjectURL(p.thumbnailBlob || p.blob);
          return (
            <div
              key={p.id}
              className="relative cursor-pointer overflow-hidden rounded-lg aspect-square"
              onClick={() => navigate(`/daily-photo/${p.id}`)}
            >
              <img src={url} alt={p.date} className="h-full w-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-1">
                <p className="text-[10px] text-white">{new Date(p.date).toLocaleDateString("es", { day: "numeric", month: "short" })}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
