import { usePack } from "@/core/packs/PackContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { packLoader } from "@/core/packs/packLoader";

export function PackStore() {
  const { packs, unlockedIds, activePack, activatePack, unlockPack } = usePack();
  const { toast } = useToast();

  const handleUnlock = async (packId: string) => {
    await unlockPack(packId);
    toast({ title: "¡Pack desbloqueado!", description: "Ya puedes activarlo." });
  };

  const handleActivate = async (packId: string) => {
    await activatePack(packId);
    toast({ title: "Pack activado", description: "El tema se ha aplicado." });
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold">🏪 Tienda de Packs</h1>
      <p className="text-sm text-muted-foreground">Personaliza tu diario con temas únicos</p>

      {packs.map((pack) => {
        const isFree = pack.free;
        const isUnlocked = isFree || unlockedIds.has(pack.id);
        const isActive = pack.id === activePack?.id;
        const previewUrl = packLoader.getPackAssetUrl(pack.id, "preview.png");

        return (
          <Card key={pack.id} className={`overflow-hidden transition-shadow ${isActive ? "ring-2 ring-primary" : ""}`}>
            <div className="h-36 overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt={pack.name} className="w-full h-full object-cover" />
              ) : (
                <div className="h-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-4xl">📓</span>
                </div>
              )}
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
                <Button variant="outline" onClick={() => handleActivate(pack.id)}>Activar</Button>
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
