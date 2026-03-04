import { dbGet, dbSet } from "../indexeddb";

export interface AppSettings {
  id: string;
  profileId: string;
  activePack: string;
  theme: string;
  locale: string;
  [key: string]: unknown;
}

const DEFAULT_SETTINGS: AppSettings = {
  id: "default",
  profileId: "default",
  activePack: "base",
  theme: "default",
  locale: "es",
};

export const settingsRepository = {
  async get(profileId: string = "default"): Promise<AppSettings> {
    const settings = await dbGet("settings", profileId);
    return (settings as AppSettings | undefined) ?? { ...DEFAULT_SETTINGS, id: profileId, profileId };
  },
  async save(settings: AppSettings): Promise<void> {
    await dbSet("settings", settings);
  },
};
