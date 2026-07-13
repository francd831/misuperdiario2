import { dbList } from "./db";

export interface StorageUsageSummary {
  totalBytes: number;
  entriesBytes: number;
  dailyPhotosBytes: number;
  byProfile: Record<string, number>;
}

function addProfileBytes(map: Record<string, number>, profileId: string, bytes: number) {
  map[profileId] = (map[profileId] ?? 0) + bytes;
}

export async function estimateStorageUsage(): Promise<StorageUsageSummary> {
  const [entries, photos] = await Promise.all([dbList("entries"), dbList("dailyPhotos")]);
  const byProfile: Record<string, number> = {};

  const entriesBytes = entries.reduce((sum, entry) => {
    const bytes = entry.mediaBlob?.size ?? 0;
    addProfileBytes(byProfile, entry.profileId, bytes);
    return sum + bytes;
  }, 0);

  const dailyPhotosBytes = photos.reduce((sum, photo) => {
    const bytes = photo.blob.size + (photo.thumbnailBlob?.size ?? 0);
    addProfileBytes(byProfile, photo.profileId, bytes);
    return sum + bytes;
  }, 0);

  return {
    totalBytes: entriesBytes + dailyPhotosBytes,
    entriesBytes,
    dailyPhotosBytes,
    byProfile,
  };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}
