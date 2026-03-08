import { dbList, dbListByIndex } from "@/core/storage/indexeddb";
import { profileRepository, type Profile } from "@/core/storage/repositories/profileRepository";

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

function blobSize(val: any): number {
  let size = 0;
  if (!val) return size;
  if (val instanceof Blob) return val.size;
  if (typeof val === "string") return val.length * 2; // rough estimate
  if (typeof val === "object") {
    for (const k of Object.keys(val)) {
      const v = val[k];
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
    const profileEntries = allEntries.filter((e: any) => e.profileId === profile.id);
    const profilePhotos = allPhotos.filter((ph: any) => ph.profileId === profile.id);

    let entryBytes = 0;
    for (const e of profileEntries) {
      entryBytes += blobSize(e);
      // Check common blob fields
      const entry = e as any;
      if (entry.mediaBlob instanceof Blob) entryBytes += entry.mediaBlob.size;
      if (entry.photoBlob instanceof Blob) entryBytes += entry.photoBlob.size;
    }

    let photoBytes = 0;
    for (const ph of profilePhotos) {
      const photo = ph as any;
      if (photo.blob instanceof Blob) photoBytes += photo.blob.size;
      if (photo.thumbnailBlob instanceof Blob) photoBytes += photo.thumbnailBlob.size;
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
