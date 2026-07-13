export interface DailyPhoto {
  id: string;
  profileId: string;
  date: string;
  blob: Blob;
  thumbnailBlob?: Blob;
  caption?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveDailyPhotoInput {
  profileId: string;
  blob: Blob;
  thumbnailBlob?: Blob;
  caption?: string;
}
