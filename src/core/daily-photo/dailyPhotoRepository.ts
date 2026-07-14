import { dbDelete, dbGet, dbListByIndex, dbSet } from "../storage/db";
import type { DailyPhoto, SaveDailyPhotoInput } from "./types";
import type { OverlayProject } from "../overlays/types";

export function today() {
  return new Date().toISOString().slice(0, 10);
}

function now() {
  return new Date().toISOString();
}

function sortByDateAsc(photos: DailyPhoto[]) {
  return [...photos].sort((a, b) => a.date.localeCompare(b.date));
}

function sortByDateDesc(photos: DailyPhoto[]) {
  return [...photos].sort((a, b) => b.date.localeCompare(a.date));
}

export const dailyPhotoRepository = {
  async get(id: string) {
    return dbGet("dailyPhotos", id);
  },

  async listByProfile(profileId: string) {
    const photos = await dbListByIndex("dailyPhotos", "by-profile", profileId);
    return sortByDateDesc(photos);
  },

  async listTimeline(profileId: string) {
    const photos = await dbListByIndex("dailyPhotos", "by-profile", profileId);
    return sortByDateAsc(photos);
  },

  async getForDate(profileId: string, date = today()) {
    const photos = await dbListByIndex("dailyPhotos", "by-profile-date", [profileId, date]);
    return photos[0];
  },

  async saveToday(input: SaveDailyPhotoInput, allowReplacement: boolean) {
    const date = today();
    const existing = await this.getForDate(input.profileId, date);
    if (existing && !allowReplacement) {
      throw new Error("Ya existe una foto para hoy.");
    }

    const timestamp = now();
    const photo: DailyPhoto = {
      id: existing?.id ?? crypto.randomUUID(),
      profileId: input.profileId,
      date,
      blob: input.blob,
      thumbnailBlob: input.thumbnailBlob,
      caption: input.caption?.trim() || undefined,
      overlayProject: input.overlayProject,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    await dbSet("dailyPhotos", photo);
    return photo;
  },

  async remove(id: string) {
    await dbDelete("dailyPhotos", id);
  },

  async updateOverlayProject(id: string, overlayProject: OverlayProject) {
    const photo = await this.get(id);
    if (!photo) throw new Error("Foto no encontrada.");
    const updated: DailyPhoto = {
      ...photo,
      overlayProject,
      updatedAt: now(),
    };
    await dbSet("dailyPhotos", updated);
    return updated;
  },
};
