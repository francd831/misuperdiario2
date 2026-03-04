import { useState, useEffect } from "react";
import { packRegistry } from "@/core/packs/packRegistry";
import { entitlementService } from "@/core/entitlements/entitlementService";
import { themeEngine } from "@/core/theming/themeEngine";
import type { PackManifest } from "@/core/packs/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PackStore() {
  const [packs, setPacks] = useState<PackManifest[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState("");
  const { toast } = useToast();

  const load = async () => {
    setPacks(packRegistry.listPacks());
    const ids = await entitlementService.listUnlocked();
    setUnlocked(new Set(ids));
    const active = await packRegistry.getActivePack();
    setActiveId(active.id);
  };

  useEffect(() => { load(); }, []);

  const handleUnlock = async (packId: string) => {
    await entitlementService.unlock(packId);
    toast({ title: "¡Pack desbloqueado!", description: "Ya puedes activarlo." });
    load();
  };

  const handleActivate = async (pack: PackManifest) => {
    await packRegistry.setActivePack(pack.id);
    if (pack.theme) themeEngine.applyTokens(pack.theme as any);
    setActiveId(pack.id);
    toast({ title: "Pack activado", description: `Ahora usas "${pack.name}"` });
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold">🏪 Tienda de Packs</h1>
      <p className="text-sm text-muted-foreground">Personaliza tu diario con temas únicos</p>

      {packs.map((pack) => {
        const isFree = pack.free;
        const isUnlocked = isFree || unlocked.has(pack.id);
        const isActive = pack.id === activeId;

        return (
          <Card key={pack.id} className={`overflow-hidden transition-shadow ${isActive ? "ring-2 ring-primary" : ""}`}>
            <div className="h-24 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-4xl">{pack.id === "reinoMagico" ? "🏰" : "📓"}</span>
            </div>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{pack.name}</h3>
                <div className="flex gap-1">
                  {isFree && <Badge variant="secondary">Gratis</Badge>}
                  {!isFree && !isUnlocked && <Badge variant="secondary"><Lock className="mr-1 h-3 w-3" />Premium</Badge>}
                  {isActive && <Badge><Check className="mr-1 h-3 w-3" />Activo</Badge>}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{pack.description}</p>
              {!isUnlocked ? (
                <Button className="gap-2" onClick={() => handleUnlock(pack.id)}>
                  <Sparkles className="h-4 w-4" /> Desbloquear (simulado)
                </Button>
              ) : !isActive ? (
                <Button variant="outline" onClick={() => handleActivate(pack)}>Activar</Button>
              ) : (
                <Button variant="ghost" disabled>Activo actualmente</Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
