import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { DailyPhoto } from "../daily-photo/types";
import type { DiaryEntry } from "../diary/types";
import type { PackEntitlement } from "../packs/types";
import type { Profile, StoragePolicy } from "../profiles/types";
import type { WalletTransaction } from "../wallet/types";
import type { ProfileAchievement } from "../achievements/types";

interface SuperDiarioDB extends DBSchema {
  profiles: {
    key: string;
    value: Profile;
    indexes: {
      "by-role": string;
    };
  };
  storagePolicies: {
    key: string;
    value: StoragePolicy;
  };
  entries: {
    key: string;
    value: DiaryEntry;
    indexes: {
      "by-profile": string;
      "by-profile-date": [string, string];
      "by-profile-type": [string, string];
    };
  };
  dailyPhotos: {
    key: string;
    value: DailyPhoto;
    indexes: {
      "by-profile": string;
      "by-profile-date": [string, string];
    };
  };
  packEntitlements: {
    key: string;
    value: PackEntitlement;
    indexes: {
      "by-profile": string;
      "by-pack": string;
    };
  };
  walletTransactions: {
    key: string;
    value: WalletTransaction;
    indexes: {
      "by-profile": string;
    };
  };
  achievements: {
    key: string;
    value: ProfileAchievement;
    indexes: {
      "by-profile": string;
    };
  };
}

const DB_NAME = "mi-super-diario";
const DB_VERSION = 6;

let dbPromise: Promise<IDBPDatabase<SuperDiarioDB>> | null = null;

export function getDB() {
  dbPromise ??= openDB<SuperDiarioDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("profiles")) {
        const store = db.createObjectStore("profiles", { keyPath: "id" });
        store.createIndex("by-role", "role");
      }

      if (!db.objectStoreNames.contains("storagePolicies")) {
        db.createObjectStore("storagePolicies", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("entries")) {
        const store = db.createObjectStore("entries", { keyPath: "id" });
        store.createIndex("by-profile", "profileId");
        store.createIndex("by-profile-date", ["profileId", "date"]);
        store.createIndex("by-profile-type", ["profileId", "type"]);
      }

      if (!db.objectStoreNames.contains("dailyPhotos")) {
        const store = db.createObjectStore("dailyPhotos", { keyPath: "id" });
        store.createIndex("by-profile", "profileId");
        store.createIndex("by-profile-date", ["profileId", "date"]);
      }

      if (!db.objectStoreNames.contains("packEntitlements")) {
        const store = db.createObjectStore("packEntitlements", { keyPath: "id" });
        store.createIndex("by-profile", "profileId");
        store.createIndex("by-pack", "packId");
      }

      if (!db.objectStoreNames.contains("walletTransactions")) {
        const store = db.createObjectStore("walletTransactions", { keyPath: "id" });
        store.createIndex("by-profile", "profileId");
      }

      if (!db.objectStoreNames.contains("achievements")) {
        const store = db.createObjectStore("achievements", { keyPath: "id" });
        store.createIndex("by-profile", "profileId");
      }
    },
  });

  return dbPromise;
}

export async function dbGet<StoreName extends keyof SuperDiarioDB>(
  storeName: StoreName,
  key: SuperDiarioDB[StoreName]["key"],
) {
  const db = await getDB();
  return db.get(storeName, key);
}

export async function dbSet<StoreName extends keyof SuperDiarioDB>(
  storeName: StoreName,
  value: SuperDiarioDB[StoreName]["value"],
) {
  const db = await getDB();
  await db.put(storeName, value);
}

export async function dbDelete<StoreName extends keyof SuperDiarioDB>(
  storeName: StoreName,
  key: SuperDiarioDB[StoreName]["key"],
) {
  const db = await getDB();
  await db.delete(storeName, key);
}

export async function dbClear<StoreName extends keyof SuperDiarioDB>(storeName: StoreName) {
  const db = await getDB();
  await db.clear(storeName);
}

export async function dbList<StoreName extends keyof SuperDiarioDB>(storeName: StoreName) {
  const db = await getDB();
  return db.getAll(storeName);
}

export async function dbListByIndex<
  StoreName extends "profiles" | "entries" | "dailyPhotos" | "packEntitlements" | "walletTransactions" | "achievements"
>(
  storeName: StoreName,
  indexName: keyof SuperDiarioDB[StoreName]["indexes"],
  value: string | [string, string],
) {
  const db = await getDB();
  return db.getAllFromIndex(storeName, indexName as string, value);
}

export type { SuperDiarioDB };
