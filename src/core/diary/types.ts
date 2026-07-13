import type { OverlayProject } from "../overlays/types";

export type EntryType = "text" | "audio" | "video";

export interface DiaryEntry {
  id: string;
  profileId: string;
  type: EntryType;
  date: string;
  title?: string;
  note?: string;
  durationSeconds?: number;
  mediaBlob?: Blob;
  overlayProject?: OverlayProject;
  isLocked: boolean;
  unlockAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTextEntryInput {
  profileId: string;
  title?: string;
  note: string;
  isLocked?: boolean;
  unlockAt?: string;
}

export interface CreateMediaEntryInput {
  profileId: string;
  type: "audio" | "video";
  title?: string;
  note?: string;
  durationSeconds: number;
  mediaBlob: Blob;
  isLocked?: boolean;
  unlockAt?: string;
}
