import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { PackManifest } from "./types";
import { packRegistry } from "./packRegistry";
import { packLoader } from "./packLoader";
import { themeEngine } from "../theming/themeEngine";
import { entitlementService } from "../entitlements/entitlementService";

interface PackContextValue {
  activePack: PackManifest | null;
  packs: PackManifest[];
  unlockedIds: Set<string>;
  stickers: string[];
  frames: { key: string; file: string }[];
  sounds: { key: string; file: string; type: string }[];
  activatePack: (id: string) => Promise<void>;
  unlockPack: (id: string) => Promise<void>;
  lockPack: (id: string) => Promise<void>;
  refreshEntitlements: () => Promise<void>;
}

const PackCtx = createContext<PackContextValue | null>(null);

export function PackProvider({ children }: { children: ReactNode }) {
  const [activePack, setActivePack] = useState<PackManifest | null>(null);
  const [packs, setPacks] = useState<PackManifest[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [stickers, setStickers] = useState<string[]>([]);
  const [frames, setFrames] = useState<{ key: string; file: string }[]>([]);
  const [sounds, setSounds] = useState<{ key: string; file: string; type: string }[]>([]);

  const loadAssets = useCallback((packId: string) => {
    setStickers(packLoader.getPackStickers(packId));
    setFrames(packLoader.getPackFrames(packId));
    setSounds(packLoader.getPackSounds(packId));
  }, []);

  const refreshEntitlements = useCallback(async () => {
    const ids = await entitlementService.listUnlocked();
    setUnlockedIds(new Set(ids));
  }, []);

  // Init on mount
  useEffect(() => {
    const init = async () => {
      const allPacks = packRegistry.listPacks();
      setPacks(allPacks);

      const active = await packRegistry.getActivePack();
      setActivePack(active);
      themeEngine.applyTokens(active.theme);
      loadAssets(active.id);

      await refreshEntitlements();
    };
    init();
  }, [loadAssets, refreshEntitlements]);

  const activatePack = useCallback(async (id: string) => {
    await packRegistry.setActivePack(id);
    const pack = packRegistry.getPack(id);
    if (!pack) return;
    setActivePack(pack);
    themeEngine.applyTokens(pack.theme);
    loadAssets(pack.id);
  }, [loadAssets]);

  const unlockPack = useCallback(async (id: string) => {
    await entitlementService.unlock(id);
    await refreshEntitlements();
  }, [refreshEntitlements]);

  const lockPack = useCallback(async (id: string) => {
    await entitlementService.lock(id);
    await refreshEntitlements();
  }, [refreshEntitlements]);

  return (
    <PackCtx.Provider value={{
      activePack, packs, unlockedIds,
      stickers, frames, sounds,
      activatePack, unlockPack, lockPack, refreshEntitlements,
    }}>
      {children}
    </PackCtx.Provider>
  );
}

export function usePack() {
  const ctx = useContext(PackCtx);
  if (!ctx) throw new Error("usePack must be used within PackProvider");
  return ctx;
}
