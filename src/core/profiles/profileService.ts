import { hashPin, isValidPin, verifyPin } from "../auth/pinService";
import { profileRepository } from "./profileRepository";
import type { Profile, ProfileRole } from "./types";

const ACTIVE_PROFILE_KEY = "msd_active_profile_id";
const avatarColors = ["#ffe4ee", "#e8f8ef", "#e5f3ff", "#fff1c7", "#ede7ff"];

function now() {
  return new Date().toISOString();
}

function createProfileModel(name: string, role: ProfileRole, pinHash?: string): Profile {
  const createdAt = now();

  return {
    id: crypto.randomUUID(),
    role,
    name: name.trim(),
    avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
    pinHash,
    activePackId: "base",
    createdAt,
    updatedAt: createdAt,
  };
}

export const profileService = {
  async bootstrapState() {
    const admin = await profileRepository.getAdmin();
    const children = await profileRepository.listChildren();
    const activeProfile = await this.getActiveProfile();

    return {
      hasAdmin: Boolean(admin),
      admin,
      children,
      activeProfile,
    };
  },

  async createAdmin(name: string, pin: string) {
    if (!isValidPin(pin)) throw new Error("El PIN debe tener 4 digitos.");
    const existing = await profileRepository.getAdmin();
    if (existing) throw new Error("Ya existe un perfil administrador.");

    const profile = createProfileModel(name, "admin", await hashPin(pin));
    await profileRepository.save(profile);
    return profile;
  },

  async createChild(name: string, pin?: string) {
    const cleanPin = pin?.trim();
    if (cleanPin && !isValidPin(cleanPin)) throw new Error("El PIN debe tener 4 digitos.");

    const profile = createProfileModel(name, "child", cleanPin ? await hashPin(cleanPin) : undefined);
    await profileRepository.save(profile);
    return profile;
  },

  async verifyProfilePin(profileId: string, pin: string) {
    const profile = await profileRepository.get(profileId);
    if (!profile) return false;
    if (!profile.pinHash) return true;
    return verifyPin(pin, profile.pinHash);
  },

  login(profileId: string) {
    sessionStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  },

  logout() {
    sessionStorage.removeItem(ACTIVE_PROFILE_KEY);
  },

  async getActiveProfile() {
    const id = sessionStorage.getItem(ACTIVE_PROFILE_KEY);
    if (!id) return undefined;
    return profileRepository.get(id);
  },
};
