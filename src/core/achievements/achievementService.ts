import { dailyPhotoRepository } from "../daily-photo/dailyPhotoRepository";
import { entryRepository } from "../diary/entryRepository";
import { dbGet, dbListByIndex, dbSet } from "../storage/db";
import { walletService } from "../wallet/walletService";
import { ACHIEVEMENTS, getAchievementDefinition } from "./achievementDefinitions";
import type { ProfileAchievement } from "./types";

function achievementRecordId(profileId: string, achievementId: string) {
  return `${profileId}:${achievementId}`;
}

async function saveAchievement(profileId: string, achievementId: string) {
  const definition = getAchievementDefinition(achievementId);
  if (!definition) return undefined;

  const id = achievementRecordId(profileId, achievementId);
  const existing = await dbGet("achievements", id);
  if (existing) return existing;

  const record: ProfileAchievement = {
    id,
    profileId,
    achievementId,
    rewardStars: definition.rewardStars,
    unlockedAt: new Date().toISOString(),
  };
  await dbSet("achievements", record);
  await walletService.addStars(profileId, definition.rewardStars, `Logro: ${definition.title}`, `achievement:${achievementId}`, {
    achievementId,
  });
  return record;
}

export const achievementService = {
  definitions: ACHIEVEMENTS,

  async listUnlocked(profileId: string) {
    return dbListByIndex("achievements", "by-profile", profileId);
  },

  async syncProfile(profileId: string) {
    const [entries, photos, unlocked] = await Promise.all([
      entryRepository.listByProfile(profileId),
      dailyPhotoRepository.listByProfile(profileId),
      this.listUnlocked(profileId),
    ]);
    const unlockedIds = new Set(unlocked.map((achievement) => achievement.achievementId));
    const next: string[] = [];

    if (entries.length >= 1) next.push("first-entry");
    if (photos.length >= 1) next.push("first-photo");
    if (entries.length >= 10) next.push("entries-10");
    if (photos.length >= 7) next.push("photos-7");
    if (entries.some((entry) => entry.isLocked)) next.push("first-capsule");

    const types = new Set(entries.map((entry) => entry.type));
    if (types.has("text") && types.has("audio") && types.has("video")) {
      next.push("all-entry-types");
    }

    const newlyUnlocked = [];
    for (const achievementId of next) {
      if (!unlockedIds.has(achievementId)) {
        const saved = await saveAchievement(profileId, achievementId);
        if (saved) newlyUnlocked.push(saved);
      }
    }

    return newlyUnlocked;
  },
};
