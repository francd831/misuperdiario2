import type { PackAsset, PackManifest, PackWithAssets } from "./types";

const manifestModules = import.meta.glob<{ default: PackManifest }>("/src/assets/packs/**/manifest.json", {
  eager: true,
});

const assetModules = import.meta.glob<string>("/src/assets/packs/**/*", {
  eager: true,
  query: "?url",
  import: "default",
});

function assetIdFromPath(path: string) {
  return path.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, "");
}

function assetNameFromId(id: string) {
  return id
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

function normalizeFolder(folder: string | undefined, fallback: string) {
  return (folder?.trim() || fallback).replace(/^\/+|\/+$/g, "");
}

function assetsFromFolder(packId: string, folder: string): PackAsset[] {
  const normalized = normalizeFolder(folder, "");
  const prefix = `/src/assets/packs/${packId}/${normalized}/`;

  return Object.entries(assetModules)
    .filter(([path]) => path.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, url]) => {
      const id = assetIdFromPath(path);
      return { id, packId, name: assetNameFromId(id), url };
    });
}

function getPackAssetUrl(packId: string, assetPath: string) {
  return assetModules[`/src/assets/packs/${packId}/${assetPath.replace(/^\/+/, "")}`];
}

function resolveAssets(pack: PackManifest, kind: "stickers" | "frames") {
  const value = pack[kind];
  if (Array.isArray(value)) {
    return value
      .map((assetPath) => {
        const url = getPackAssetUrl(pack.id, assetPath);
        if (!url) return undefined;
        const id = assetIdFromPath(assetPath);
        return { id, packId: pack.id, name: assetNameFromId(id), url };
      })
      .filter((asset): asset is PackAsset => Boolean(asset));
  }

  if (value?.autoLoad || !value) {
    return assetsFromFolder(pack.id, normalizeFolder(value?.folder, kind));
  }

  return [];
}

function withDefaults(manifest: PackManifest): PackManifest {
  return {
    ...manifest,
    priceStars: manifest.free ? 0 : manifest.priceStars ?? 60,
  };
}

const packs = Object.values(manifestModules)
  .map((module) => withDefaults(module.default ?? (module as unknown as PackManifest)))
  .filter((manifest) => Boolean(manifest.id))
  .sort((a, b) => Number(Boolean(a.free)) === Number(Boolean(b.free)) ? a.name.localeCompare(b.name) : a.free ? -1 : 1);

export const packLoader = {
  listManifests() {
    return packs;
  },

  getPack(packId: string) {
    return packs.find((pack) => pack.id === packId);
  },

  listPacksWithAssets(): PackWithAssets[] {
    return packs.map((manifest) => ({
      manifest,
      previewUrl: getPackAssetUrl(manifest.id, manifest.preview ?? "preview.png"),
      stickers: resolveAssets(manifest, "stickers"),
      frames: resolveAssets(manifest, "frames"),
    }));
  },

  getPackWithAssets(packId: string) {
    return this.listPacksWithAssets().find((pack) => pack.manifest.id === packId);
  },
};
