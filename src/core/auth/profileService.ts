import { profileRepository, type Profile } from "../storage/repositories/profileRepository";

const ACTIVE_KEY = "vd_active_profile";

/** Simple hash – sufficient for local-only PIN */
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "vd_salt_2024");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type ProfileRole = "admin" | "user";

export const profileService = {
  /* ─── Queries ─── */

  async getProfiles(): Promise<Profile[]> {
    return profileRepository.getAll();
  },

  async getVisibleProfiles(): Promise<Profile[]> {
    const all = await profileRepository.getAll();
    return all.filter((p) => p.role !== "admin");
  },

  async getAdminProfile(): Promise<Profile | undefined> {
    const all = await profileRepository.getAll();
    return all.find((p) => p.role === "admin");
  },

  async hasProfiles(): Promise<boolean> {
    const all = await profileRepository.getAll();
    return all.length > 0;
  },

  /* ─── Mutations ─── */

  async createProfile(name: string, pin: string, role: ProfileRole = "user", activePackId = "base"): Promise<Profile> {
    if (role === "admin") {
      const existing = await this.getAdminProfile();
      if (existing) throw new Error("Admin already exists");
    }
    const pinHash = await hashPin(pin);
    const profile: Profile = {
      id: crypto.randomUUID(),
      name,
      pin: pinHash,
      role,
      activePackId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await profileRepository.save(profile);
    return profile;
  },

  async deleteProfile(id: string): Promise<void> {
    const profile = await profileRepository.getById(id);
    if (profile?.role === "admin") throw new Error("Cannot delete admin");
    await profileRepository.remove(id);
  },

  async resetPin(id: string, newPin: string): Promise<void> {
    const profile = await profileRepository.getById(id);
    if (!profile) throw new Error("Profile not found");
    const pinHash = await hashPin(newPin);
    await profileRepository.save({ ...profile, pin: pinHash });
  },

  async removePin(id: string): Promise<void> {
    const profile = await profileRepository.getById(id);
    if (!profile) return;
    await profileRepository.save({ ...profile, pin: undefined });
  },

  /* ─── Auth ─── */

  async verifyPin(profileId: string, pin: string): Promise<boolean> {
    const profile = await profileRepository.getById(profileId);
    if (!profile?.pin) return false;
    const pinHash = await hashPin(pin);
    return profile.pin === pinHash;
  },

  /* ─── Session ─── */

  login(profileId: string): void {
    sessionStorage.setItem(ACTIVE_KEY, profileId);
  },

  logout(): void {
    sessionStorage.removeItem(ACTIVE_KEY);
  },

  getActiveProfileId(): string | null {
    return sessionStorage.getItem(ACTIVE_KEY);
  },

  async getActiveProfile(): Promise<Profile | null> {
    const id = this.getActiveProfileId();
    if (!id) return null;
    const p = await profileRepository.getById(id);
    return p ?? null;
  },

  /* ─── Pack ─── */

  async setActivePack(profileId: string, packId: string): Promise<void> {
    const profile = await profileRepository.getById(profileId);
    if (!profile) return;
    await profileRepository.save({ ...profile, activePackId: packId });
  },
};
