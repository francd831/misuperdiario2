import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Profile, StoragePolicy } from "../profiles/types";

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
}

const DB_NAME = "mi-super-diario";
const DB_VERSION = 1;

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

export async function dbList<StoreName extends keyof SuperDiarioDB>(storeName: StoreName) {
  const db = await getDB();
  return db.getAll(storeName);
}

export async function dbListByIndex<StoreName extends "profiles">(
  storeName: StoreName,
  indexName: keyof SuperDiarioDB[StoreName]["indexes"],
  value: string,
) {
  const db = await getDB();
  return db.getAllFromIndex(storeName, indexName as string, value);
}

export type { SuperDiarioDB };
