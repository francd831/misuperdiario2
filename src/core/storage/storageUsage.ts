import { dbList, dbListByIndex } from "@/core/storage/indexeddb";
import { profileRepository, type Profile } from "@/core/storage/repositories/profileRepository";
import type { ExtendedEntry } from "@/features/diary/types";

export interface ProfileStorageInfo {
  profileId: string;
  profileName: string;
  avatar?: string;
  entries: number;
  photos: number;
  entryBytes: number;
  photoBytes: number;
  totalBytes: number;
}

export interface StorageSummary {
  profiles: ProfileStorageInfo[];
  totalBytes: number;
}

type BlobLikeRecord = Record<string, unknown>;

function blobSize(val: unknown): number {
  let size = 0;
  if (!val) return size;
  if (val instanceof Blob) return val.size;
  if (typeof val === "string") return val.length * 2; // rough estimate
  if (typeof val === "object") {
    for (const v of Object.values(val as BlobLikeRecord)) {
      if (v instanceof Blob) size += v.size;
      else if (typeof v === "string" && v.startsWith("data:")) size += v.length;
    }
  }
  return size;
}

export async function calculateStorageUsage(): Promise<StorageSummary> {
  const profiles = await profileRepository.getAll();
  const allEntries = await dbList("entries");
  const allPhotos = await dbList("daily_photos");

  const userProfiles = profiles.filter((p) => (p as Profile).role !== "admin");

  const result: ProfileStorageInfo[] = userProfiles.map((p) => {
    const profile = p as Profile;
    const profileEntries = allEntries.filter((e) => e.profileId === profile.id);
    const profilePhotos = allPhotos.filter((ph) => ph.profileId === profile.id);

    let entryBytes = 0;
    for (const e of profileEntries) {
      entryBytes += blobSize(e);
      // Check common blob fields
      const entry = e as ExtendedEntry & { photoBlob?: Blob };
      if (entry.mediaBlob instanceof Blob) entryBytes += entry.mediaBlob.size;
      if (entry.photoBlob instanceof Blob) entryBytes += entry.photoBlob.size;
    }

    let photoBytes = 0;
    for (const ph of profilePhotos) {
      if (ph.blob instanceof Blob) photoBytes += ph.blob.size;
      if (ph.thumbnailBlob instanceof Blob) photoBytes += ph.thumbnailBlob.size;
    }

    return {
      profileId: profile.id,
      profileName: profile.name,
      avatar: profile.avatar,
      entries: profileEntries.length,
      photos: profilePhotos.length,
      entryBytes,
      photoBytes,
      totalBytes: entryBytes + photoBytes,
    };
  });

  return {
    profiles: result.sort((a, b) => b.totalBytes - a.totalBytes),
    totalBytes: result.reduce((sum, p) => sum + p.totalBytes, 0),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
