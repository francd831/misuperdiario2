import { profileRepository } from "../profiles/profileRepository";
import { walletService } from "../wallet/walletService";
import { entitlementRepository } from "./entitlementRepository";
import { packLoader } from "./packLoader";
import type { PackManifest } from "./types";

// Beta switch: keep every world available in local and deployed test builds.
// Set this to false immediately before the public production release.
export const PREVIEW_ALL_PACKS = true;

const previewAllPacks = PREVIEW_ALL_PACKS || import.meta.env.DEV || import.meta.env.VITE_PREVIEW_ALL_PACKS === "true";

export const packService = {
  listPacks() {
    return packLoader.listPacksWithAssets();
  },

  async listUnlockedPackIds(profileId: string, remotePackIds: string[] = []) {
    if (previewAllPacks) {
      return new Set([...packLoader.listManifests().map((pack) => pack.id), ...remotePackIds]);
    }
    const entitlements = await entitlementRepository.listByProfile(profileId);
    const freeIds = packLoader.listManifests().filter((pack) => pack.free).map((pack) => pack.id);
    return new Set([...freeIds, ...entitlements.map((item) => item.packId)]);
  },

  async isUnlocked(profileId: string, packId: string, remotePack?: PackManifest) {
    const pack = packLoader.getPack(packId) ?? remotePack;
    if (previewAllPacks) return Boolean(pack);
    if (pack?.free) return true;
    return Boolean(await entitlementRepository.get(profileId, packId));
  },

  async unlockForBeta(profileId: string, packId: string) {
    const pack = packLoader.getPack(packId);
    if (!pack) throw new Error("Pack no encontrado.");
    if (pack.free) return undefined;
    return entitlementRepository.unlock(profileId, packId, "admin");
  },

  async purchasePack(profileId: string, packId: string, remotePack?: PackManifest) {
    const pack = packLoader.getPack(packId) ?? remotePack;
    if (!pack) throw new Error("Pack no encontrado.");
    if (pack.free) return entitlementRepository.unlock(profileId, packId, "free");
    if (await this.isUnlocked(profileId, packId, pack)) return undefined;
    const price = pack.priceStars ?? 60;
    await walletService.spendStars(profileId, price, `Compra de pack: ${pack.name}`, `purchase-pack:${packId}`, { packId });
    return entitlementRepository.unlock(profileId, packId, "purchase");
  },

  async setActivePack(profileId: string, packId: string, remotePack?: PackManifest) {
    const unlocked = await this.isUnlocked(profileId, packId, remotePack);
    if (!unlocked) throw new Error("Este pack no esta desbloqueado.");
    const profile = await profileRepository.get(profileId);
    if (!profile) throw new Error("Perfil no encontrado.");
    await profileRepository.save({ ...profile, activePackId: packId });
  },
};
