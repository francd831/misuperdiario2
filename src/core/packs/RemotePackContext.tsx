import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { packLoader } from "./packLoader";
import {
  fetchRemoteCatalog,
  installRemotePack,
  loadInstalledRemotePacks,
  releaseRemotePack,
  removeRemotePack,
} from "./remotePackStore";
import type { InstalledRemotePack, PackRuntimeResources, RemotePackCatalogEntry } from "./remotePackTypes";
import type { PackWithAssets } from "./types";

interface RemotePackContextValue {
  ready: boolean;
  catalog: RemotePackCatalogEntry[];
  packs: PackWithAssets[];
  installed: Map<string, InstalledRemotePack>;
  error?: string;
  refreshCatalog(): Promise<void>;
  install(entry: RemotePackCatalogEntry, onProgress?: (progress: number) => void): Promise<void>;
  remove(packId: string): Promise<void>;
  getPack(packId?: string): PackWithAssets;
  getResources(packId?: string): PackRuntimeResources;
  isInstalled(packId: string): boolean;
}

const RemotePackContext = createContext<RemotePackContextValue | undefined>(undefined);

export function RemotePackProvider({ children }: { children: ReactNode }) {
  const base = packLoader.getPackWithAssets("base")!;
  const [ready, setReady] = useState(false);
  const [catalog, setCatalog] = useState<RemotePackCatalogEntry[]>([]);
  const [installed, setInstalled] = useState<Map<string, InstalledRemotePack>>(new Map());
  const [error, setError] = useState<string>();

  async function refreshCatalog() {
    try {
      const next = await fetchRemoteCatalog();
      setCatalog(next.packs.filter((entry) => entry.id !== "base"));
      setError(undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el catálogo.");
    }
  }

  useEffect(() => {
    let alive = true;
    void Promise.all([loadInstalledRemotePacks(), fetchRemoteCatalog().catch(() => undefined)]).then(([saved, remote]) => {
      if (!alive) {
        saved.forEach(releaseRemotePack);
        return;
      }
      setInstalled(new Map(saved.map((pack) => [pack.id, pack])));
      if (remote) setCatalog(remote.packs.filter((entry) => entry.id !== "base"));
      setReady(true);
    });
    return () => { alive = false; };
  }, []);

  const value = useMemo<RemotePackContextValue>(() => ({
    ready,
    catalog,
    packs: [base, ...installed.values()].map((pack) => "pack" in pack ? pack.pack : pack),
    installed,
    error,
    refreshCatalog,
    async install(entry, onProgress) {
      const next = await installRemotePack(entry, onProgress);
      setInstalled((current) => {
        const previous = current.get(entry.id);
        if (previous) releaseRemotePack(previous);
        return new Map(current).set(entry.id, next);
      });
    },
    async remove(packId) {
      const pack = installed.get(packId);
      if (!pack) return;
      await removeRemotePack(pack);
      setInstalled((current) => {
        const next = new Map(current);
        next.delete(packId);
        return next;
      });
    },
    getPack(packId) {
      return installed.get(packId ?? "base")?.pack ?? base;
    },
    getResources(packId) {
      return installed.get(packId ?? "base")?.resources ?? {};
    },
    isInstalled(packId) {
      return packId === "base" || installed.has(packId);
    },
  }), [base, catalog, error, installed, ready]);

  return <RemotePackContext.Provider value={value}>{children}</RemotePackContext.Provider>;
}

export function useRemotePacks() {
  const context = useContext(RemotePackContext);
  if (!context) throw new Error("useRemotePacks must be used inside RemotePackProvider");
  return context;
}

