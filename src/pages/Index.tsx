import { useEffect, useState } from "react";
import { packRegistry } from "@/core/packs/packRegistry";
import { themeEngine } from "@/core/theming/themeEngine";
import type { PackManifest } from "@/core/packs/types";

const Index = () => {
  const [packs, setPacks] = useState<PackManifest[]>([]);

  useEffect(() => {
    setPacks(packRegistry.listPacks());
    themeEngine.applyActivePack();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 pb-16">
      <h1 className="text-3xl font-bold">📓 Video Diario</h1>
      <p className="text-muted-foreground">Arquitectura lista — {packs.length} pack(s) registrados</p>
      <div className="flex gap-2">
        {packs.map((p) => (
          <span key={p.id} className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground">
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Index;
