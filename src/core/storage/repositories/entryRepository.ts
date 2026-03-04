import { dbGet, dbSet, dbDelete, dbList, dbListByIndex } from "../indexeddb";
import type { StickerOverlay } from "../indexeddb";

export interface DiaryEntry {
  id: string;
  profileId: string;
  date: string;
  photoUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  stickerOverlays?: StickerOverlay[];
  mood?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const entryRepository = {
  async getAll(): Promise<DiaryEntry[]> {
    return dbList("entries") as Promise<DiaryEntry[]>;
  },
  async getById(id: string): Promise<DiaryEntry | undefined> {
    return dbGet("entries", id) as Promise<DiaryEntry | undefined>;
  },
  async getByProfile(profileId: string): Promise<DiaryEntry[]> {
    return dbListByIndex("entries", "by-profile", profileId) as Promise<DiaryEntry[]>;
  },
  async getByDate(date: string): Promise<DiaryEntry[]> {
    return dbListByIndex("entries", "by-date", date) as Promise<DiaryEntry[]>;
  },
  async save(entry: DiaryEntry): Promise<void> {
    await dbSet("entries", { ...entry, updatedAt: new Date().toISOString() });
  },
  async remove(id: string): Promise<void> {
    await dbDelete("entries", id);
  },
};
