import { hashPin, isValidPin, verifyPin } from "../auth/pinService";
import { walletService } from "../wallet/walletService";
import { dbDelete, dbListByIndex } from "../storage/db";
import { profileRepository } from "./profileRepository";
import type { Profile, ProfileAvatarPreset, ProfileRole } from "./types";

const ACTIVE_PROFILE_KEY = "msd_active_profile_id";
const avatarColors = ["#ffe4ee", "#e8f8ef", "#e5f3ff", "#fff1c7", "#ede7ff"];
const avatarPresets: ProfileAvatarPreset[] = ["star", "heart", "rocket", "smile", "palette", "crown", "sparkles", "trophy"];

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
    avatarPreset: avatarPresets[Math.floor(Math.random() * avatarPresets.length)],
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
    await walletService.addStars(profile.id, 20, "Bienvenida", "welcome-stars");
    return profile;
  },

  async verifyProfilePin(profileId: string, pin: string) {
    const profile = await profileRepository.get(profileId);
    if (!profile) return false;
    if (!profile.pinHash) return true;
    return verifyPin(pin, profile.pinHash);
  },

  async updateProfile(
    profileId: string,
    input: {
      name: string;
      pin?: string;
      removePin?: boolean;
      avatarPreset?: ProfileAvatarPreset;
      avatarPhotoDataUrl?: string;
    },
  ) {
    const profile = await profileRepository.get(profileId);
    if (!profile) throw new Error("Perfil no encontrado.");

    const name = input.name.trim();
    if (name.length < 2) throw new Error("El nombre debe tener al menos 2 letras.");

    const cleanPin = input.pin?.trim();
    if (cleanPin && !isValidPin(cleanPin)) throw new Error("El PIN debe tener 4 digitos.");

    await profileRepository.save({
      ...profile,
      name,
      pinHash: profile.role === "child" && input.removePin
        ? undefined
        : cleanPin ? await hashPin(cleanPin) : profile.pinHash,
      avatarPreset: input.avatarPhotoDataUrl ? undefined : input.avatarPreset ?? profile.avatarPreset ?? "star",
      avatarPhotoDataUrl: input.avatarPhotoDataUrl,
    });
  },

  async changeAdminPin(currentPin: string, nextPin: string) {
    if (!isValidPin(nextPin)) throw new Error("El nuevo PIN debe tener 4 dígitos.");
    const admin = await profileRepository.getAdmin();
    if (!admin || !(await verifyPin(currentPin, admin.pinHash))) throw new Error("El PIN actual no es correcto.");
    await profileRepository.save({ ...admin, pinHash: await hashPin(nextPin) });
  },

  async deleteChild(profileId: string) {
    const profile = await profileRepository.get(profileId);
    if (!profile || profile.role !== "child") throw new Error("Perfil infantil no encontrado.");
    const stores = ["entries", "dailyPhotos", "packEntitlements", "walletTransactions", "achievements"] as const;
    await Promise.all(stores.map(async (store) => {
      const records = await dbListByIndex(store, "by-profile", profileId);
      await Promise.all(records.map((record) => dbDelete(store, record.id)));
    }));
    await profileRepository.remove(profileId);
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
