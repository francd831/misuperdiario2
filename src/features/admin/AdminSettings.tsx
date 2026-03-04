import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Upload, Lock, Unlock } from "lucide-react";
import { settingsRepository } from "@/core/storage/repositories/settingsRepository";
import { entitlementService } from "@/core/entitlements/entitlementService";
import { packRegistry } from "@/core/packs/packRegistry";
import { entryRepository } from "@/core/storage/repositories/entryRepository";
import { backupService } from "@/core/media/backup/backupService";
import { ProgressOverlay } from "@/app/components/ProgressOverlay";
import type { ExtendedEntry } from "@/features/diary/types";
import { useToast } from "@/hooks/use-toast";

export function AdminSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [maxVideo, setMaxVideo] = useState(300);
  const [maxAudio, setMaxAudio] = useState(600);
  const [processing, setProcessing] = useState(false);
  const [packs, setPacks] = useState<{ id: string; name: string; unlocked: boolean }[]>([]);
  const [capsules, setCapsules] = useState<ExtendedEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      const s = await settingsRepository.get();
      if (typeof (s as any).maxVideoSeconds === "number") setMaxVideo((s as any).maxVideoSeconds);
      if (typeof (s as any).maxAudioSeconds === "number") setMaxAudio((s as any).maxAudioSeconds);

      const allPacks = packRegistry.listPacks();
      const packList = await Promise.all(
        allPacks.map(async (p) => ({ id: p.id, name: p.name, unlocked: await entitlementService.isUnlocked(p.id) }))
      );
      setPacks(packList);

      const entries = (await entryRepository.getAll()) as ExtendedEntry[];
      setCapsules(entries.filter((e) => e.isLocked));
    };
    load();
  }, []);

  const saveLimits = async () => {
    const s = await settingsRepository.get();
    await settingsRepository.save({ ...s, maxVideoSeconds: maxVideo, maxAudioSeconds: maxAudio } as any);
    toast({ title: "Límites guardados" });
  };

  const handleExport = async () => {
    setProcessing(true);
    try {
      await backupService.exportBackup();
      toast({ title: "Backup exportado" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setProcessing(false);
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setProcessing(true);
      try {
        await backupService.importBackup(file);
        toast({ title: "Backup importado" });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
      setProcessing(false);
    };
    input.click();
  };

  const togglePack = async (id: string, currentlyUnlocked: boolean) => {
    if (currentlyUnlocked) await entitlementService.lock(id);
    else await entitlementService.unlock(id);
    setPacks((prev) => prev.map((p) => (p.id === id ? { ...p, unlocked: !currentlyUnlocked } : p)));
    toast({ title: currentlyUnlocked ? "Pack bloqueado" : "Pack desbloqueado" });
  };

  const unlockCapsule = async (entry: ExtendedEntry) => {
    await entryRepository.save({ ...entry, isLocked: false } as any);
    setCapsules((prev) => prev.filter((c) => c.id !== entry.id));
    toast({ title: "Cápsula desbloqueada" });
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="flex-1 text-xl font-bold">Ajustes Admin</h1>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Límites de grabación</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-24 text-sm">Vídeo (s):</span>
            <Input type="number" value={maxVideo} onChange={(e) => setMaxVideo(Number(e.target.value))} className="w-24" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 text-sm">Audio (s):</span>
            <Input type="number" value={maxAudio} onChange={(e) => setMaxAudio(Number(e.target.value))} className="w-24" />
          </div>
          <Button size="sm" onClick={saveLimits}>Guardar límites</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Backup</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-1" onClick={handleExport}><Download className="h-4 w-4" />Exportar</Button>
          <Button variant="outline" className="flex-1 gap-1" onClick={handleImport}><Upload className="h-4 w-4" />Importar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Packs</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {packs.map((p) => (
            <div key={p.id} className="flex items-center justify-between">
              <span className="text-sm">{p.name}</span>
              <Button variant="ghost" size="sm" onClick={() => togglePack(p.id, p.unlocked)} className="gap-1">
                {p.unlocked ? <><Unlock className="h-3 w-3" />Bloquear</> : <><Lock className="h-3 w-3" />Desbloquear</>}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Cápsulas del tiempo ({capsules.length})</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {capsules.length === 0 && <p className="text-sm text-muted-foreground">Sin cápsulas</p>}
          {capsules.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{c.title || "Sin título"}</p>
                <p className="text-xs text-muted-foreground">{c.unlockAt ? `Desbloqueo: ${new Date(c.unlockAt).toLocaleDateString("es")}` : ""}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => unlockCapsule(c)} className="gap-1">
                <Unlock className="h-3 w-3" /> Desbloquear
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <ProgressOverlay visible={processing} label="Procesando backup…" />
    </div>
  );
}
