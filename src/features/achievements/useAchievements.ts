import { useState, useEffect } from "react";
import { useProfile } from "@/core/auth/ProfileContext";
import { entryRepository } from "@/core/storage/repositories/entryRepository";
import { dbListByIndex } from "@/core/storage/indexeddb";
import type { ExtendedEntry } from "@/features/diary/types";
import type { AchievementDef, UnlockedAchievement } from "./types";
import {
  calculateStreak,
  getNewlyUnlocked,
  getStoredAchievements,
  saveAchievement,
} from "./achievementService";

export function useAchievements() {
  const { activeProfile } = useProfile();
  const [streak, setStreak] = useState(0);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [celebration, setCelebration] = useState<AchievementDef | null>(null);
  const [queue, setQueue] = useState<AchievementDef[]>([]);

  useEffect(() => {
    if (!activeProfile) return;

    async function check() {
      const entries = (await entryRepository.getByProfile(activeProfile!.id)) as ExtendedEntry[];
      const photos = await dbListByIndex("daily_photos", "by-profile", activeProfile!.id);

      setStreak(calculateStreak(entries));

      const stored = await getStoredAchievements(activeProfile!.id);
      setUnlocked(stored.map((s) => s.achievementId));

      const newOnes = await getNewlyUnlocked(activeProfile!.id, entries, photos.length);
      if (newOnes.length > 0) {
        // Save all immediately
        for (const a of newOnes) {
          await saveAchievement(activeProfile!.id, a.id);
        }
        setUnlocked((prev) => [...prev, ...newOnes.map((a) => a.id)]);
        // Queue celebrations
        setQueue(newOnes);
        setCelebration(newOnes[0]);
      }
    }

    check();
  }, [activeProfile]);

  function dismissCelebration() {
    setQueue((prev) => {
      const next = prev.slice(1);
      setCelebration(next[0] ?? null);
      return next;
    });
  }

  return { streak, unlocked, celebration, dismissCelebration };
}
