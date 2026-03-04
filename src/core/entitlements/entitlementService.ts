import { dbGet, dbSet } from "../storage/indexeddb";

export interface Entitlement {
  packId: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export const entitlementService = {
  async isUnlocked(packId: string): Promise<boolean> {
    // "base" pack is always free
    if (packId === "base") return true;
    const record = await dbGet("entitlements", packId);
    return !!record?.unlocked;
  },

  async unlock(packId: string): Promise<void> {
    await dbSet("entitlements", {
      packId,
      unlocked: true,
      unlockedAt: new Date().toISOString(),
    });
  },

  async lock(packId: string): Promise<void> {
    await dbSet("entitlements", {
      packId,
      unlocked: false,
      unlockedAt: undefined,
    });
  },

  async listUnlocked(): Promise<string[]> {
    const { dbList } = await import("../storage/indexeddb");
    const all = await dbList("entitlements");
    return all.filter((e) => e.unlocked).map((e) => e.packId);
  },
};
