import type { PackManifest } from "./types";
import { settingsRepository } from "../storage/repositories/settingsRepository";

const manifestModules = import.meta.glob<{ default: PackManifest }>(
  "/src/assets/packs/**/manifest.json",
  { eager: true }
);

const packs = new Map<string, PackManifest>();

// Load all manifests at init
for (const [path, mod] of Object.entries(manifestModules)) {
  const manifest = mod.default ?? (mod as unknown as PackManifest);
  if (manifest?.id) {
    packs.set(manifest.id, manifest);
  }
}

export const packRegistry = {
  listPacks(): PackManifest[] {
    return Array.from(packs.values());
  },

  getPack(id: string): PackManifest | undefined {
    return packs.get(id);
  },

  async setActivePack(id: string): Promise<void> {
    if (!packs.has(id)) throw new Error(`Pack "${id}" not found`);
    const settings = await settingsRepository.get();
    await settingsRepository.save({ ...settings, activePack: id });
  },

  async getActivePack(): Promise<PackManifest> {
    const settings = await settingsRepository.get();
    return packs.get(settings.activePack) ?? packs.values().next().value!;
  },
};
