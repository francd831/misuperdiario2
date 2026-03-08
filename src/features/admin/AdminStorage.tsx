import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HardDrive, User } from "lucide-react";
import { calculateStorageUsage, formatBytes, type StorageSummary } from "@/core/storage/storageUsage";
import { Progress } from "@/components/ui/progress";

export function AdminStorage() {
  const [data, setData] = useState<StorageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStorageUsage()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Calculando almacenamiento…</p>
      </div>
    );
  }

  if (!data) return null;

  const maxBytes = Math.max(...data.profiles.map((p) => p.totalBytes), 1);

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <HardDrive className="h-5 w-5 text-primary" />
        Almacenamiento
      </h2>

      {/* Total summary */}
      <Card>
        <CardContent className="flex flex-col items-center gap-1 py-5">
          <p className="text-3xl font-bold text-primary">{formatBytes(data.totalBytes)}</p>
          <p className="text-xs text-muted-foreground">Espacio total ocupado</p>
          <p className="text-xs text-muted-foreground">
            {data.profiles.length} perfil{data.profiles.length !== 1 ? "es" : ""} ·{" "}
            {data.profiles.reduce((s, p) => s + p.entries, 0)} entradas ·{" "}
            {data.profiles.reduce((s, p) => s + p.photos, 0)} fotos
          </p>
        </CardContent>
      </Card>

      {/* Per-profile breakdown */}
      <div className="flex flex-col gap-2">
        {data.profiles.map((p) => {
          const pct = maxBytes > 0 ? (p.totalBytes / maxBytes) * 100 : 0;
          return (
            <Card key={p.profileId}>
              <CardContent className="py-3 px-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                      {p.avatar || <User className="h-4 w-4 text-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{p.profileName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.entries} entrada{p.entries !== 1 ? "s" : ""} · {p.photos} foto{p.photos !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-foreground">{formatBytes(p.totalBytes)}</p>
                </div>
                <Progress value={pct} className="h-1.5" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Entradas: {formatBytes(p.entryBytes)}</span>
                  <span>Fotos: {formatBytes(p.photoBytes)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {data.profiles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay perfiles de usuario
          </p>
        )}
      </div>
    </div>
  );
}
