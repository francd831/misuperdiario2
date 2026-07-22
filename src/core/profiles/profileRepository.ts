import { dbDelete, dbGet, dbList, dbListByIndex, dbSet } from "../storage/db";
import type { Profile } from "./types";

export const profileRepository = {
  async list() {
    return dbList("profiles");
  },

  async listChildren() {
    return dbListByIndex("profiles", "by-role", "child");
  },

  async get(id: string) {
    return dbGet("profiles", id);
  },

  async getAdmin() {
    const admins = await dbListByIndex("profiles", "by-role", "admin");
    return admins[0];
  },

  async save(profile: Profile) {
    await dbSet("profiles", {
      ...profile,
      updatedAt: new Date().toISOString(),
    });
  },

  async remove(id: string) {
    await dbDelete("profiles", id);
  },
};
