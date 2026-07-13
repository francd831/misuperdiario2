import { dbGet, dbSet } from "../storage/db";
import type { StoragePolicy } from "../profiles/types";

export const DEFAULT_STORAGE_POLICY: StoragePolicy = {
  id: "global",
  maxVideoSeconds: 60,
  maxAudioSeconds: 180,
  maxVideosPerDay: 3,
  maxAudiosPerDay: 5,
  maxDailyPhotosPerDay: 1,
  allowDailyPhotoReplacement: true,
  videoQuality: "medium",
  photoQuality: "medium",
  maxTotalStorageBytes: 1024 * 1024 * 1024,
  maxProfileStorageBytes: 300 * 1024 * 1024,
  warningThresholdPercent: 80,
  limitBehavior: "ask-adult",
  updatedAt: new Date(0).toISOString(),
};

export const storagePolicyRepository = {
  async get() {
    return (await dbGet("storagePolicies", "global")) ?? DEFAULT_STORAGE_POLICY;
  },

  async save(policy: StoragePolicy) {
    await dbSet("storagePolicies", { ...policy, updatedAt: new Date().toISOString() });
  },
};
