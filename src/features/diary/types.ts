import type { DiaryEntry } from "@/core/storage/repositories/entryRepository";

export type EntryType = "video" | "audio" | "text";

/** Extended entry with fields stored alongside the base entry in IndexedDB */
export interface ExtendedEntry extends DiaryEntry {
  title?: string;
  duration?: number;
  type?: EntryType;
  isLocked?: boolean;
  unlockAt?: string;
  mediaBlob?: Blob;
}

export function isUnlocked(entry: ExtendedEntry): boolean {
  if (!entry.isLocked) return true;
  if (!entry.unlockAt) return false;
  return new Date() >= new Date(entry.unlockAt);
}
