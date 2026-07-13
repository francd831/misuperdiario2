import { profileRepository } from "../profiles/profileRepository";
import { entitlementRepository } from "./entitlementRepository";
import { packLoader } from "./packLoader";

export const packService = {
  listPacks() {
    return packLoader.listPacksWithAssets();
  },

  async listUnlockedPackIds(profileId: string) {
    const entitlements = await entitlementRepository.listByProfile(profileId);
    const freeIds = packLoader.listManifests().filter((pack) => pack.free).map((pack) => pack.id);
    return new Set([...freeIds, ...entitlements.map((item) => item.packId)]);
  },

  async isUnlocked(profileId: string, packId: string) {
    const pack = packLoader.getPack(packId);
    if (pack?.free) return true;
    return Boolean(await entitlementRepository.get(profileId, packId));
  },

  async unlockForBeta(profileId: string, packId: string) {
    const pack = packLoader.getPack(packId);
    if (!pack) throw new Error("Pack no encontrado.");
    if (pack.free) return undefined;
    return entitlementRepository.unlock(profileId, packId, "admin");
  },

  async setActivePack(profileId: string, packId: string) {
    const unlocked = await this.isUnlocked(profileId, packId);
    if (!unlocked) throw new Error("Este pack no esta desbloqueado.");
    const profile = await profileRepository.get(profileId);
    if (!profile) throw new Error("Perfil no encontrado.");
    await profileRepository.save({ ...profile, activePackId: packId });
  },
};
