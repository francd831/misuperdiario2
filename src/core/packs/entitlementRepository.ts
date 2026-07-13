import { dbGet, dbListByIndex, dbSet } from "../storage/db";
import type { PackEntitlement } from "./types";

function entitlementId(profileId: string, packId: string) {
  return `${profileId}:${packId}`;
}

export const entitlementRepository = {
  async get(profileId: string, packId: string) {
    return dbGet("packEntitlements", entitlementId(profileId, packId));
  },

  async listByProfile(profileId: string) {
    return dbListByIndex("packEntitlements", "by-profile", profileId);
  },

  async unlock(profileId: string, packId: string, source: PackEntitlement["source"] = "purchase") {
    const entitlement: PackEntitlement = {
      id: entitlementId(profileId, packId),
      profileId,
      packId,
      source,
      unlockedAt: new Date().toISOString(),
    };
    await dbSet("packEntitlements", entitlement);
    return entitlement;
  },
};
