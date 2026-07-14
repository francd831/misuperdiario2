export type ProfileRole = "admin" | "child";

export type ProfileAvatarPreset = "star" | "heart" | "rocket" | "smile" | "palette" | "crown" | "sparkles" | "trophy";

export interface Profile {
  id: string;
  role: ProfileRole;
  name: string;
  avatarColor: string;
  avatarPreset?: ProfileAvatarPreset;
  avatarPhotoDataUrl?: string;
  pinHash?: string;
  activePackId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoragePolicy {
  id: "global";
  maxVideoSeconds: number;
  maxAudioSeconds: number;
  maxVideosPerDay: number;
  maxAudiosPerDay: number;
  maxDailyPhotosPerDay: number;
  allowDailyPhotoReplacement: boolean;
  videoQuality: "low" | "medium" | "high";
  photoQuality: "low" | "medium" | "high";
  maxTotalStorageBytes: number;
  maxProfileStorageBytes: number;
  warningThresholdPercent: number;
  limitBehavior: "block" | "ask-adult";
  updatedAt: string;
}
