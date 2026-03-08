import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { profileService, type ProfileRole } from "./profileService";
import type { Profile } from "../storage/repositories/profileRepository";

type ProfileState =
  | { status: "loading" }
  | { status: "no-profiles" }
  | { status: "needs-admin" }
  | { status: "select" }
  | { status: "active"; profile: Profile };

interface ProfileContextValue {
  state: ProfileState;
  activeProfile: Profile | null;
  login: (profileId: string) => void;
  logout: () => void;
  refresh: () => Promise<void>;
  createProfile: (name: string, pin: string, role?: ProfileRole, packId?: string) => Promise<Profile>;
}

const Ctx = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProfileState>({ status: "loading" });
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  const refresh = useCallback(async () => {
    const hasProfiles = await profileService.hasProfiles();
    if (!hasProfiles) {
      setState({ status: "no-profiles" });
      setActiveProfile(null);
      return;
    }

    // Ensure admin exists even if user profiles are present
    const admin = await profileService.getAdminProfile();
    if (!admin) {
      setState({ status: "needs-admin" });
      setActiveProfile(null);
      return;
    }

    const active = await profileService.getActiveProfile();
    if (active) {
      setState({ status: "active", profile: active });
      setActiveProfile(active);
    } else {
      setState({ status: "select" });
      setActiveProfile(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback((profileId: string) => {
    profileService.login(profileId);
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    profileService.logout();
    refresh();
  }, [refresh]);

  const createProfile = useCallback(async (name: string, pin: string, role: ProfileRole = "user", packId?: string) => {
    const p = await profileService.createProfile(name, pin, role, packId);
    await refresh();
    return p;
  }, [refresh]);

  return (
    <Ctx.Provider value={{ state, activeProfile, login, logout, refresh, createProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProfile must be inside ProfileProvider");
  return ctx;
}
