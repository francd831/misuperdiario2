import { dbListByIndex, dbSet, dbList } from "@/core/storage/indexeddb";
import type { ExtendedEntry } from "@/features/diary/types";
import {
  ALL_ACHIEVEMENTS,
  STREAK_ACHIEVEMENTS,
  MILESTONE_ACHIEVEMENTS,
  type AchievementDef,
  type UnlockedAchievement,
} from "./types";

/** Calculate current streak in days from entries */
export function calculateStreak(entries: ExtendedEntry[]): number {
  if (entries.length === 0) return 0;

  const uniqueDays = new Set<string>();
  for (const e of entries) {
    const day = (e.date || e.createdAt).slice(0, 10);
    uniqueDays.add(day);
  }

  const sorted = Array.from(uniqueDays).sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Streak must include today or yesterday
  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;

  let streak = 1;
  let current = new Date(sorted[0]);

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 1);
    const prevStr = prev.toISOString().slice(0, 10);
    if (sorted[i] === prevStr) {
      streak++;
      current = prev;
    } else {
      break;
    }
  }

  return streak;
}

/** Determine which achievements should be unlocked based on current data */
export function evaluateAchievements(
  entries: ExtendedEntry[],
  dailyPhotoCount: number
): string[] {
  const earned: string[] = [];
  const streak = calculateStreak(entries);

  // Streak achievements
  for (const a of STREAK_ACHIEVEMENTS) {
    if (a.streakDays && streak >= a.streakDays) {
      earned.push(a.id);
    }
  }

  // Entry count milestones
  const entryCount = entries.length;
  for (const a of MILESTONE_ACHIEVEMENTS) {
    if (a.id === "first-entry" && entryCount >= 1) earned.push(a.id);
    if (a.id === "entries-10" && entryCount >= 10) earned.push(a.id);
    if (a.id === "entries-50" && entryCount >= 50) earned.push(a.id);
    if (a.id === "entries-100" && entryCount >= 100) earned.push(a.id);
    if (a.id === "photos-25" && dailyPhotoCount >= 25) earned.push(a.id);
    if (a.id === "capsules-10") {
      const capsules = entries.filter((e) => e.isLocked);
      if (capsules.length >= 10) earned.push(a.id);
    }
    if (a.id === "all-types") {
      const types = new Set(entries.map((e) => e.type).filter(Boolean));
      if (types.has("video") && types.has("audio") && types.has("text")) {
        earned.push(a.id);
      }
    }
  }

  return earned;
}

/** Get stored achievements for a profile */
export async function getStoredAchievements(profileId: string): Promise<UnlockedAchievement[]> {
  return dbListByIndex("achievements" as any, "by-profile", profileId);
}

/** Save a newly unlocked achievement */
export async function saveAchievement(profileId: string, achievementId: string): Promise<void> {
  const id = `${profileId}-${achievementId}`;
  await dbSet("achievements" as any, {
    id,
    profileId,
    achievementId,
    unlockedAt: new Date().toISOString(),
  });
}

/** Find newly unlocked achievements (not yet stored) */
export async function getNewlyUnlocked(
  profileId: string,
  entries: ExtendedEntry[],
  dailyPhotoCount: number
): Promise<AchievementDef[]> {
  const earned = evaluateAchievements(entries, dailyPhotoCount);
  const stored = await getStoredAchievements(profileId);
  const storedIds = new Set(stored.map((s) => s.achievementId));

  const newIds = earned.filter((id) => !storedIds.has(id));
  return newIds
    .map((id) => ALL_ACHIEVEMENTS.find((a) => a.id === id))
    .filter(Boolean) as AchievementDef[];
}
