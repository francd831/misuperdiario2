import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { profileService } from "./profileService";
import type { Profile, ProfileAvatarPreset } from "./types";

type ProfileStatus = "loading" | "needs-admin" | "select-profile" | "active";

interface ProfileContextValue {
  status: ProfileStatus;
  activeProfile?: Profile;
  children: Profile[];
  refresh: () => Promise<void>;
  createAdmin: (name: string, pin: string) => Promise<void>;
  createChild: (name: string, pin?: string) => Promise<void>;
  updateProfile: (
    profileId: string,
    input: { name: string; pin?: string; avatarPreset?: ProfileAvatarPreset; avatarPhotoDataUrl?: string },
  ) => Promise<void>;
  login: (profileId: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ProfileStatus>("loading");
  const [activeProfile, setActiveProfile] = useState<Profile | undefined>();
  const [childProfiles, setChildProfiles] = useState<Profile[]>([]);

  const refresh = useCallback(async () => {
    const state = await profileService.bootstrapState();
    setChildProfiles(state.children);
    setActiveProfile(state.activeProfile);

    if (!state.hasAdmin) {
      setStatus("needs-admin");
    } else if (state.activeProfile) {
      setStatus("active");
    } else {
      setStatus("select-profile");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      status,
      activeProfile,
      children: childProfiles,
      refresh,
      async createAdmin(name, pin) {
        await profileService.createAdmin(name, pin);
        await refresh();
      },
      async createChild(name, pin) {
        await profileService.createChild(name, pin);
        await refresh();
      },
      async updateProfile(profileId, input) {
        await profileService.updateProfile(profileId, input);
        await refresh();
      },
      async login(profileId, pin) {
        const ok = await profileService.verifyProfilePin(profileId, pin);
        if (!ok) return false;
        profileService.login(profileId);
        await refresh();
        return true;
      },
      async logout() {
        profileService.logout();
        await refresh();
      },
    }),
    [activeProfile, childProfiles, refresh, status],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfiles() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfiles must be used inside ProfileProvider");
  return context;
}
