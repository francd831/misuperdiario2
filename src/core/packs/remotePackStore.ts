import { openDB, type DBSchema } from "idb";
import JSZip from "jszip";
import type { PackAsset, PackAssetKind, PackManifest, PackWithAssets } from "./types";
import type {
  InstalledRemotePack,
  PackRuntimeResources,
  RemoteDistributionManifest,
  RemotePackCatalog,
  RemotePackCatalogEntry,
} from "./remotePackTypes";

const CATALOG_URL = import.meta.env.VITE_PACK_CATALOG_URL
  ?? "https://rydvdxiulcumonhoinwr.supabase.co/storage/v1/object/public/world-packs/catalog.json";
const CACHED_CATALOG_KEY = "misuperdiario:remote-pack-catalog";

interface StoredPack {
  id: string;
  version: string;
  installedAt: string;
  distribution: RemoteDistributionManifest;
}

interface StoredFile {
  key: string;
  packId: string;
  path: string;
  blob: Blob;
}

interface PackDatabase extends DBSchema {
  packs: {
    key: string;
    value: StoredPack;
  };
  files: {
    key: string;
    value: StoredFile;
    indexes: { "by-pack": string };
  };
}

let databasePromise: ReturnType<typeof openDB<PackDatabase>> | undefined;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDB<PackDatabase>("mi-super-diario-packs", 1, {
      upgrade(db) {
        db.createObjectStore("packs", { keyPath: "id" });
        const files = db.createObjectStore("files", { keyPath: "key" });
        files.createIndex("by-pack", "packId");
      },
    });
  }
  return databasePromise;
}

const kinds: PackAssetKind[] = ["stickers", "frames", "filters", "speechBubbles", "stamps", "masks", "effects"];
const defaultFolders: Record<PackAssetKind, string> = {
  stickers: "stickers",
  frames: "frames",
  filters: "filters",
  speechBubbles: "speech-bubbles",
  stamps: "stamps",
  masks: "masks",
  effects: "effects",
};

function normalize(path: string) {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

function mimeType(path: string) {
  const extension = path.split(".").pop()?.toLowerCase();
  return {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
    gif: "image/gif", svg: "image/svg+xml", json: "application/json",
  }[extension ?? ""] ?? "application/octet-stream";
}

function displayName(path: string) {
  return path.split("/").pop()!.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
}

function resolvePack(manifest: PackManifest, urls: Map<string, string>, distribution: RemoteDistributionManifest): PackWithAssets {
  const root = normalize(distribution.content.assetsRoot);
  const assets = (kind: PackAssetKind): PackAsset[] => {
    const config = manifest[kind];
    const paths = Array.isArray(config)
      ? config.map(normalize)
      : [...urls.keys()]
          .filter((path) => path.startsWith(`${root}/${normalize(config?.folder ?? defaultFolders[kind])}/`));
    return paths.flatMap((path) => {
      const fullPath = path.startsWith(`${root}/`) ? path : `${root}/${path}`;
      const url = urls.get(fullPath);
      if (!url) return [];
      const id = fullPath.split("/").pop()!.replace(/\.[^.]+$/, "");
      return [{ id, packId: manifest.id, name: displayName(fullPath), url }];
    });
  };
  return {
    manifest,
    previewUrl: urls.get(normalize(distribution.content.preview)),
    stickers: assets("stickers"),
    frames: assets("frames"),
    filters: assets("filters"),
    speechBubbles: assets("speechBubbles"),
    stamps: assets("stamps"),
    masks: assets("masks"),
    effects: assets("effects"),
  };
}

function runtimeResources(distribution: RemoteDistributionManifest, urls: Map<string, string>): PackRuntimeResources {
  const sceneEntries = Object.entries(distribution.content.scenes)
    .filter(([name]) => name !== "home")
    .map(([name, path]) => [name, urls.get(normalize(path))]);
  return {
    home: urls.get(normalize(distribution.content.scenes.home)),
    scenes: Object.fromEntries(sceneEntries.filter((entry): entry is [string, string] => Boolean(entry[1]))),
    profileDoor: urls.get(normalize(distribution.content.profileDoor)),
    mascotSprite: urls.get(normalize(distribution.content.mascotSprite)),
  };
}

async function materialize(stored: StoredPack, files: StoredFile[]): Promise<InstalledRemotePack> {
  const urls = new Map(files.map((file) => [normalize(file.path), URL.createObjectURL(file.blob)]));
  const manifestFile = files.find((file) => normalize(file.path) === normalize(stored.distribution.content.packManifest));
  if (!manifestFile) throw new Error(`El pack ${stored.id} no contiene su manifiesto.`);
  const manifest = JSON.parse(await manifestFile.blob.text()) as PackManifest;
  return {
    ...stored,
    pack: resolvePack(manifest, urls, stored.distribution),
    resources: runtimeResources(stored.distribution, urls),
  };
}

function revoke(pack: InstalledRemotePack) {
  const urls = [
    pack.pack.previewUrl,
    ...kinds.flatMap((kind) => pack.pack[kind].map((asset) => asset.url)),
    pack.resources.home,
    pack.resources.profileDoor,
    pack.resources.mascotSprite,
    ...Object.values(pack.resources.scenes ?? {}),
  ];
  new Set(urls.filter(Boolean)).forEach((url) => URL.revokeObjectURL(url!));
}

async function digestHex(buffer: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function fetchRemoteCatalog(): Promise<RemotePackCatalog> {
  try {
    const response = await fetch(CATALOG_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Catálogo no disponible (${response.status}).`);
    const catalog = await response.json() as RemotePackCatalog;
    localStorage.setItem(CACHED_CATALOG_KEY, JSON.stringify(catalog));
    return catalog;
  } catch (error) {
    const cached = localStorage.getItem(CACHED_CATALOG_KEY);
    if (cached) return JSON.parse(cached) as RemotePackCatalog;
    throw error;
  }
}

export async function loadInstalledRemotePacks() {
  if (typeof indexedDB === "undefined") return [];
  const db = await getDatabase();
  const storedPacks = await db.getAll("packs");
  return Promise.all(storedPacks.map(async (stored) => {
    const files = await db.getAllFromIndex("files", "by-pack", stored.id);
    return materialize(stored, files);
  }));
}

export async function installRemotePack(entry: RemotePackCatalogEntry, onProgress?: (progress: number) => void) {
  const [manifestResponse, archiveResponse] = await Promise.all([
    fetch(entry.manifestUrl, { cache: "no-cache" }),
    fetch(entry.archiveUrl, { cache: "no-cache" }),
  ]);
  if (!manifestResponse.ok || !archiveResponse.ok) throw new Error("No se pudo descargar el mundo.");
  const distribution = await manifestResponse.json() as RemoteDistributionManifest;
  const total = Number(archiveResponse.headers.get("content-length")) || entry.sizeBytes;
  let received = 0;
  const chunks: Uint8Array[] = [];
  if (!archiveResponse.body) throw new Error("La descarga no está disponible en este dispositivo.");
  const reader = archiveResponse.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    onProgress?.(Math.min(90, Math.round(received / total * 90)));
  }
  const archive = new Uint8Array(received);
  let offset = 0;
  chunks.forEach((chunk) => { archive.set(chunk, offset); offset += chunk.byteLength; });
  const checksum = await digestHex(archive.buffer);
  if (checksum !== entry.checksumSha256.toUpperCase()) throw new Error("La descarga está dañada. Inténtalo de nuevo.");
  onProgress?.(92);
  const zip = await JSZip.loadAsync(archive);
  const files: StoredFile[] = [];
  for (const [path, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;
    const normalizedPath = normalize(path);
    const blob = await zipEntry.async("blob");
    files.push({
      key: `${entry.id}:${normalizedPath}`,
      packId: entry.id,
      path: normalizedPath,
      blob: new Blob([blob], { type: mimeType(normalizedPath) }),
    });
  }
  const manifestFile = files.find((file) => normalize(file.path) === normalize(distribution.content.packManifest));
  if (!manifestFile) throw new Error("La actualización no contiene un manifiesto válido.");
  const packManifest = JSON.parse(await manifestFile.blob.text()) as PackManifest;
  if (distribution.id !== entry.id || packManifest.id !== entry.id || distribution.version !== entry.version) {
    throw new Error("La actualización no corresponde con este mundo.");
  }
  const db = await getDatabase();
  const transaction = db.transaction(["packs", "files"], "readwrite");
  const oldKeys = await transaction.objectStore("files").index("by-pack").getAllKeys(entry.id);
  await Promise.all(oldKeys.map((key) => transaction.objectStore("files").delete(key)));
  const stored: StoredPack = { id: entry.id, version: entry.version, installedAt: new Date().toISOString(), distribution };
  await transaction.objectStore("packs").put(stored);
  await Promise.all(files.map((file) => transaction.objectStore("files").put(file)));
  await transaction.done;
  onProgress?.(100);
  return materialize(stored, files);
}

export async function removeRemotePack(pack: InstalledRemotePack) {
  const db = await getDatabase();
  const transaction = db.transaction(["packs", "files"], "readwrite");
  const keys = await transaction.objectStore("files").index("by-pack").getAllKeys(pack.id);
  await Promise.all(keys.map((key) => transaction.objectStore("files").delete(key)));
  await transaction.objectStore("packs").delete(pack.id);
  await transaction.done;
  revoke(pack);
}

export function releaseRemotePack(pack: InstalledRemotePack) {
  revoke(pack);
}
