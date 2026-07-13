import JSZip from "jszip";
import { dbClear, dbList, dbSet } from "../storage/db";
import type { DailyPhoto } from "../daily-photo/types";
import type { DiaryEntry } from "../diary/types";
import type {
  BackupImportResult,
  BackupManifest,
  BackupMediaRef,
  BackupPayload,
  SerializedDailyPhoto,
  SerializedDiaryEntry,
} from "./types";

const DATA_PATH = "data.json";
const MANIFEST_PATH = "manifest.json";

function mediaRef(path: string, blob: Blob): BackupMediaRef {
  return {
    path,
    type: blob.type,
    size: blob.size,
  };
}

function countsFor(payload: BackupPayload): BackupManifest["counts"] {
  return {
    profiles: payload.profiles.length,
    storagePolicies: payload.storagePolicies.length,
    entries: payload.entries.length,
    dailyPhotos: payload.dailyPhotos.length,
    packEntitlements: payload.packEntitlements.length,
    walletTransactions: payload.walletTransactions.length,
    achievements: payload.achievements.length,
  };
}

function createManifest(payload: BackupPayload): BackupManifest {
  return {
    app: "mi-super-diario",
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    counts: countsFor(payload),
  };
}

async function addEntry(zip: JSZip, entry: DiaryEntry): Promise<SerializedDiaryEntry> {
  const { mediaBlob, ...serialized } = entry;
  if (!mediaBlob) return serialized;

  const path = `media/entries/${entry.id}.blob`;
  zip.file(path, mediaBlob);
  return {
    ...serialized,
    mediaBlob: mediaRef(path, mediaBlob),
  };
}

async function addDailyPhoto(zip: JSZip, photo: DailyPhoto): Promise<SerializedDailyPhoto> {
  const { blob, thumbnailBlob, ...serialized } = photo;
  const blobPath = `media/daily-photos/${photo.id}.blob`;
  zip.file(blobPath, blob);

  const next: SerializedDailyPhoto = {
    ...serialized,
    blob: mediaRef(blobPath, blob),
  };

  if (thumbnailBlob) {
    const thumbnailPath = `media/daily-photos/${photo.id}-thumbnail.blob`;
    zip.file(thumbnailPath, thumbnailBlob);
    next.thumbnailBlob = mediaRef(thumbnailPath, thumbnailBlob);
  }

  return next;
}

async function readRequiredJson<T>(zip: JSZip, path: string): Promise<T> {
  const file = zip.file(path);
  if (!file) throw new Error("El backup no contiene los datos esperados.");
  return JSON.parse(await file.async("string")) as T;
}

async function readRequiredBlob(zip: JSZip, ref: BackupMediaRef): Promise<Blob> {
  const file = zip.file(ref.path);
  if (!file) throw new Error(`Falta un archivo de media en el backup: ${ref.path}`);
  const blob = await file.async("blob");
  return new Blob([blob], { type: ref.type });
}

async function clearLocalData() {
  await Promise.all([
    dbClear("achievements"),
    dbClear("walletTransactions"),
    dbClear("packEntitlements"),
    dbClear("dailyPhotos"),
    dbClear("entries"),
    dbClear("storagePolicies"),
    dbClear("profiles"),
  ]);
}

export const backupService = {
  async createBackupBlob() {
    const zip = new JSZip();
    const [profiles, storagePolicies, entries, dailyPhotos, packEntitlements, walletTransactions, achievements] =
      await Promise.all([
        dbList("profiles"),
        dbList("storagePolicies"),
        dbList("entries"),
        dbList("dailyPhotos"),
        dbList("packEntitlements"),
        dbList("walletTransactions"),
        dbList("achievements"),
      ]);

    const payload: BackupPayload = {
      profiles,
      storagePolicies,
      entries: await Promise.all(entries.map((entry) => addEntry(zip, entry))),
      dailyPhotos: await Promise.all(dailyPhotos.map((photo) => addDailyPhoto(zip, photo))),
      packEntitlements,
      walletTransactions,
      achievements,
    };
    const manifest = createManifest(payload);

    zip.file(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    zip.file(DATA_PATH, JSON.stringify(payload, null, 2));

    return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  },

  makeFilename(date = new Date()) {
    return `mi-super-diario-backup-${date.toISOString().slice(0, 10)}.zip`;
  },

  async importBackup(file: Blob): Promise<BackupImportResult> {
    const zip = await JSZip.loadAsync(file);
    const manifest = await readRequiredJson<BackupManifest>(zip, MANIFEST_PATH);
    if (manifest.app !== "mi-super-diario" || manifest.formatVersion !== 1) {
      throw new Error("El archivo no es un backup compatible de Mi Super Diario.");
    }

    const payload = await readRequiredJson<BackupPayload>(zip, DATA_PATH);
    const entries: DiaryEntry[] = await Promise.all(
      payload.entries.map(async ({ mediaBlob, ...entry }) => ({
        ...entry,
        mediaBlob: mediaBlob ? await readRequiredBlob(zip, mediaBlob) : undefined,
      })),
    );
    const dailyPhotos: DailyPhoto[] = await Promise.all(
      payload.dailyPhotos.map(async ({ blob, thumbnailBlob, ...photo }) => ({
        ...photo,
        blob: await readRequiredBlob(zip, blob),
        thumbnailBlob: thumbnailBlob ? await readRequiredBlob(zip, thumbnailBlob) : undefined,
      })),
    );

    await clearLocalData();
    await Promise.all([
      ...payload.profiles.map((profile) => dbSet("profiles", profile)),
      ...payload.storagePolicies.map((policy) => dbSet("storagePolicies", policy)),
      ...entries.map((entry) => dbSet("entries", entry)),
      ...dailyPhotos.map((photo) => dbSet("dailyPhotos", photo)),
      ...payload.packEntitlements.map((entitlement) => dbSet("packEntitlements", entitlement)),
      ...payload.walletTransactions.map((transaction) => dbSet("walletTransactions", transaction)),
      ...payload.achievements.map((achievement) => dbSet("achievements", achievement)),
    ]);

    return {
      manifest,
      counts: countsFor(payload),
    };
  },
};
