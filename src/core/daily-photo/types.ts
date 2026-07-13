import type { OverlayProject } from "../overlays/types";

export interface DailyPhoto {
  id: string;
  profileId: string;
  date: string;
  blob: Blob;
  thumbnailBlob?: Blob;
  caption?: string;
  overlayProject?: OverlayProject;
  createdAt: string;
  updatedAt: string;
}

export interface SaveDailyPhotoInput {
  profileId: string;
  blob: Blob;
  thumbnailBlob?: Blob;
  caption?: string;
  overlayProject?: OverlayProject;
}
