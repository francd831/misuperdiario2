import { profileRepository } from "../storage/repositories/profileRepository";

export const pinService = {
  async setPin(profileId: string, pin: string): Promise<void> {
    const profile = await profileRepository.getById(profileId);
    if (!profile) throw new Error("Profile not found");
    await profileRepository.save({ ...profile, pin });
  },

  async verifyPin(profileId: string, pin: string): Promise<boolean> {
    const profile = await profileRepository.getById(profileId);
    if (!profile) return false;
    return profile.pin === pin;
  },

  async hasPin(profileId: string): Promise<boolean> {
    const profile = await profileRepository.getById(profileId);
    return !!profile?.pin;
  },

  async removePin(profileId: string): Promise<void> {
    const profile = await profileRepository.getById(profileId);
    if (!profile) return;
    await profileRepository.save({ ...profile, pin: undefined });
  },
};
