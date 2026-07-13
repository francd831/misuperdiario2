import type { ProfileAchievement } from "../achievements/types";
import type { DailyPhoto } from "../daily-photo/types";
import type { DiaryEntry } from "../diary/types";
import type { PackEntitlement } from "../packs/types";
import type { Profile, StoragePolicy } from "../profiles/types";
import type { WalletTransaction } from "../wallet/types";

export interface BackupMediaRef {
  path: string;
  type: string;
  size: number;
}

export type SerializedDiaryEntry = Omit<DiaryEntry, "mediaBlob"> & {
  mediaBlob?: BackupMediaRef;
};

export type SerializedDailyPhoto = Omit<DailyPhoto, "blob" | "thumbnailBlob"> & {
  blob: BackupMediaRef;
  thumbnailBlob?: BackupMediaRef;
};

export interface BackupPayload {
  profiles: Profile[];
  storagePolicies: StoragePolicy[];
  entries: SerializedDiaryEntry[];
  dailyPhotos: SerializedDailyPhoto[];
  packEntitlements: PackEntitlement[];
  walletTransactions: WalletTransaction[];
  achievements: ProfileAchievement[];
}

export interface BackupManifest {
  app: "mi-super-diario";
  formatVersion: 1;
  exportedAt: string;
  counts: Record<keyof BackupPayload, number>;
}

export interface BackupImportResult {
  manifest: BackupManifest;
  counts: BackupManifest["counts"];
}
