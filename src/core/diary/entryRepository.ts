import { dbDelete, dbGet, dbListByIndex, dbSet } from "../storage/db";
import type { CreateMediaEntryInput, CreateTextEntryInput, DiaryEntry, EntryType } from "./types";
import type { OverlayProject } from "../overlays/types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function now() {
  return new Date().toISOString();
}

function sortNewestFirst(entries: DiaryEntry[]) {
  return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const entryRepository = {
  async get(id: string) {
    return dbGet("entries", id);
  },

  async listByProfile(profileId: string) {
    const entries = await dbListByIndex("entries", "by-profile", profileId);
    return sortNewestFirst(entries);
  },

  async listByProfileAndType(profileId: string, type: EntryType) {
    const entries = await dbListByIndex("entries", "by-profile-type", [profileId, type]);
    return sortNewestFirst(entries);
  },

  async countTodayByType(profileId: string, type: EntryType) {
    const entries = await dbListByIndex("entries", "by-profile-date", [profileId, today()]);
    return entries.filter((entry) => entry.type === type).length;
  },

  async remove(id: string) {
    await dbDelete("entries", id);
  },

  async createTextEntry(input: CreateTextEntryInput) {
    const createdAt = now();
    const entry: DiaryEntry = {
      id: crypto.randomUUID(),
      profileId: input.profileId,
      type: "text",
      date: today(),
      title: input.title?.trim() || undefined,
      note: input.note.trim(),
      isLocked: Boolean(input.isLocked),
      unlockAt: input.unlockAt || undefined,
      createdAt,
      updatedAt: createdAt,
    };

    await dbSet("entries", entry);
    return entry;
  },

  async createMediaEntry(input: CreateMediaEntryInput) {
    const createdAt = now();
    const entry: DiaryEntry = {
      id: crypto.randomUUID(),
      profileId: input.profileId,
      type: input.type,
      date: today(),
      title: input.title?.trim() || undefined,
      note: input.note?.trim() || undefined,
      durationSeconds: input.durationSeconds,
      mediaBlob: input.mediaBlob,
      overlayProject: input.overlayProject,
      isLocked: Boolean(input.isLocked),
      unlockAt: input.unlockAt || undefined,
      createdAt,
      updatedAt: createdAt,
    };

    await dbSet("entries", entry);
    return entry;
  },

  async updateOverlayProject(id: string, overlayProject: OverlayProject) {
    const entry = await this.get(id);
    if (!entry) throw new Error("Entrada no encontrada.");
    const updated: DiaryEntry = {
      ...entry,
      overlayProject,
      updatedAt: now(),
    };
    await dbSet("entries", updated);
    return updated;
  },
};
