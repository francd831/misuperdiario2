import { openDB, DBSchema, IDBPDatabase } from "idb";

interface VideoDiarioDB extends DBSchema {
  profiles: {
    key: string;
    value: {
      id: string;
      name: string;
      avatar?: string;
      pin?: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  entries: {
    key: string;
    value: {
      id: string;
      profileId: string;
      date: string;
      photoUrl?: string;
      videoUrl?: string;
      audioUrl?: string;
      stickerOverlays?: StickerOverlay[];
      mood?: string;
      note?: string;
      createdAt: string;
      updatedAt: string;
    };
    indexes: { "by-profile": string; "by-date": string };
  };
  daily_photos: {
    key: string;
    value: {
      id: string;
      profileId: string;
      date: string;
      blob: Blob;
      thumbnailBlob?: Blob;
      createdAt: string;
    };
    indexes: { "by-profile": string; "by-date": string };
  };
  settings: {
    key: string;
    value: {
      id: string;
      profileId: string;
      activePack: string;
      theme: string;
      locale: string;
      [key: string]: unknown;
    };
  };
  entitlements: {
    key: string;
    value: {
      packId: string;
      unlocked: boolean;
      unlockedAt?: string;
    };
  };
  avatar_blobs: {
    key: string;
    value: {
      id: string;
      blob: Blob;
    };
  };
  achievements: {
    key: string;
    value: {
      id: string;
      profileId: string;
      achievementId: string;
      unlockedAt: string;
    };
    indexes: { "by-profile": string };
  };
}

export interface StickerOverlay {
  stickerId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const DB_NAME = "video-diario";
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<VideoDiarioDB>> | null = null;

function getDB(): Promise<IDBPDatabase<VideoDiarioDB>> {
  if (!dbPromise) {
    dbPromise = openDB<VideoDiarioDB>(DB_NAME, 3, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("profiles")) {
          db.createObjectStore("profiles", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("entries")) {
          const entryStore = db.createObjectStore("entries", { keyPath: "id" });
          entryStore.createIndex("by-profile", "profileId");
          entryStore.createIndex("by-date", "date");
        }
        if (!db.objectStoreNames.contains("daily_photos")) {
          const photoStore = db.createObjectStore("daily_photos", { keyPath: "id" });
          photoStore.createIndex("by-profile", "profileId");
          photoStore.createIndex("by-date", "date");
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("entitlements")) {
          db.createObjectStore("entitlements", { keyPath: "packId" });
        }
        if (!db.objectStoreNames.contains("avatar_blobs")) {
          db.createObjectStore("avatar_blobs", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("achievements")) {
          const achStore = db.createObjectStore("achievements", { keyPath: "id" });
          achStore.createIndex("by-profile", "profileId");
        }
      },
    });
  }
  return dbPromise;
}

type StoreNames = "profiles" | "entries" | "daily_photos" | "settings" | "entitlements" | "avatar_blobs" | "achievements";

export async function dbGet<T extends StoreNames>(
  store: T,
  key: string
): Promise<VideoDiarioDB[T]["value"] | undefined> {
  const db = await getDB();
  return db.get(store, key);
}

export async function dbSet<T extends StoreNames>(
  store: T,
  value: VideoDiarioDB[T]["value"]
): Promise<string> {
  const db = await getDB();
  return db.put(store, value) as Promise<string>;
}

export async function dbDelete(store: StoreNames, key: string): Promise<void> {
  const db = await getDB();
  return db.delete(store, key);
}

export async function dbList<T extends StoreNames>(
  store: T
): Promise<VideoDiarioDB[T]["value"][]> {
  const db = await getDB();
  return db.getAll(store);
}

export async function dbListByIndex(
  store: "entries" | "daily_photos",
  indexName: string,
  value: string
): Promise<any[]> {
  const db = await getDB();
  return db.getAllFromIndex(store, indexName as any, value as any);
}

export { getDB };
export type { VideoDiarioDB };
