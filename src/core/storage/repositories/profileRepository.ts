import { dbGet, dbSet, dbDelete, dbList } from "../indexeddb";

export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  pin?: string;
  createdAt: string;
  updatedAt: string;
}

export const profileRepository = {
  async getAll(): Promise<Profile[]> {
    return dbList("profiles") as Promise<Profile[]>;
  },
  async getById(id: string): Promise<Profile | undefined> {
    return dbGet("profiles", id) as Promise<Profile | undefined>;
  },
  async save(profile: Profile): Promise<void> {
    await dbSet("profiles", { ...profile, updatedAt: new Date().toISOString() });
  },
  async remove(id: string): Promise<void> {
    await dbDelete("profiles", id);
  },
};
