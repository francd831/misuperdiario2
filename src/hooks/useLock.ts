import { useState, useEffect, useCallback } from "react";
import { lockService } from "@/core/auth/lockService";
import { pinService } from "@/core/auth/pinService";
import { profileRepository } from "@/core/storage/repositories/profileRepository";

const DEFAULT_PROFILE_ID = "default";

export function useLock() {
  const [locked, setLocked] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Ensure default profile exists
      let profile = await profileRepository.getById(DEFAULT_PROFILE_ID);
      if (!profile) {
        await profileRepository.save({
          id: DEFAULT_PROFILE_ID,
          name: "Mi Diario",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      const has = await pinService.hasPin(DEFAULT_PROFILE_ID);
      setHasPin(has);
      if (!has) {
        lockService.unlock(DEFAULT_PROFILE_ID);
      }
      setLoading(false);
    };
    init();

    return lockService.subscribe((s) => {
      setLocked(s.locked);
      setProfileId(s.profileId);
    });
  }, []);

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    const ok = await pinService.verifyPin(DEFAULT_PROFILE_ID, pin);
    if (ok) lockService.unlock(DEFAULT_PROFILE_ID);
    return ok;
  }, []);

  const createPin = useCallback(async (pin: string) => {
    await pinService.setPin(DEFAULT_PROFILE_ID, pin);
    setHasPin(true);
    lockService.unlock(DEFAULT_PROFILE_ID);
  }, []);

  return { locked, profileId: profileId ?? DEFAULT_PROFILE_ID, hasPin, loading, unlock, createPin };
}
