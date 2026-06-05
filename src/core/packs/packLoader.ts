import type { PackManifest } from "./types";
import { packRegistry } from "./packRegistry";

/**
 * Dynamically loads assets from a pack's directory.
 * Uses import.meta.glob patterns resolved at build time.
 */

const allPackAssets = import.meta.glob<string>("/src/assets/packs/**/*", {
  eager: true,
  query: "?url",
  import: "default",
});

type FrameAsset = { key: string; file: string };

function normalizeFolder(folder: string | undefined, fallback: string): string {
  return (folder?.trim() || fallback).replace(/^\/+|\/+$/g, "");
}

function isRemoteOrAbsoluteUrl(path: string): boolean {
  return path.startsWith("/src/") || path.startsWith("/") || /^https?:\/\//.test(path);
}

function assetKeyFromPath(path: string): string {
  return path.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, "");
}

function assetUrlsFromFolder(packId: string, folder: string): string[] {
  const normalizedFolder = normalizeFolder(folder, "");
  const prefix = `/src/assets/packs/${packId}/${normalizedFolder}/`;

  return Object.entries(allPackAssets)
    .filter(([key]) => key.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url);
}

function frameAssetsFromFolder(packId: string, folder: string): FrameAsset[] {
  const normalizedFolder = normalizeFolder(folder, "");
  const prefix = `/src/assets/packs/${packId}/${normalizedFolder}/`;

  return Object.entries(allPackAssets)
    .filter(([key]) => key.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, url]) => {
      const filename = key.replace(prefix, "");
      return { key: assetKeyFromPath(filename), file: url };
    });
}

export const packLoader = {
  getPackAssetUrl(packId: string, assetPath: string): string | undefined {
    if (isRemoteOrAbsoluteUrl(assetPath)) return assetPath;

    const key = `/src/assets/packs/${packId}/${assetPath.replace(/^\/+/, "")}`;
    return allPackAssets[key];
  },

  getPackStickers(packId: string, folder = "stickers"): string[] {
    return assetUrlsFromFolder(packId, folder);
  },

  getPackFrames(packId: string, folder = "frames"): FrameAsset[] {
    return frameAssetsFromFolder(packId, folder);
  },

  getPackBackgrounds(packId: string, folder = "backgrounds"): string[] {
    return assetUrlsFromFolder(packId, folder);
  },

  resolvePackStickers(pack: PackManifest): string[] {
    const stickers = pack.stickers;

    if (Array.isArray(stickers)) {
      return stickers
        .map((assetPath) => this.getPackAssetUrl(pack.id, assetPath))
        .filter((url): url is string => Boolean(url));
    }

    if (stickers?.categories) {
      return stickers.categories
        .flatMap((category) => category.items ?? [])
        .map((assetPath) => (typeof assetPath === "string" ? this.getPackAssetUrl(pack.id, assetPath) : undefined))
        .filter((url): url is string => Boolean(url));
    }

    if (stickers?.autoLoad || !stickers) {
      return this.getPackStickers(pack.id, normalizeFolder(stickers?.folder, "stickers"));
    }

    return [];
  },

  resolvePackFrames(pack: PackManifest): FrameAsset[] {
    const frames = pack.frames;

    if (Array.isArray(frames)) {
      return frames
        .map((item) => {
          const file = this.getPackAssetUrl(pack.id, item);
          if (!file) return undefined;
          return { key: assetKeyFromPath(item), file };
        })
        .filter((item): item is FrameAsset => Boolean(item));
    }

    if (frames?.items) {
      return frames.items
        .map((item) => {
          const file = this.getPackAssetUrl(pack.id, item.file);
          if (!file) return undefined;
          return { key: item.key ?? assetKeyFromPath(item.file), file };
        })
        .filter((item): item is FrameAsset => Boolean(item));
    }

    if (frames?.autoLoad || !frames) {
      return this.getPackFrames(pack.id, normalizeFolder(frames?.folder, "frames"));
    }

    return [];
  },

  resolvePackBackgrounds(pack: PackManifest): string[] {
    const backgrounds = pack.backgrounds;

    if (backgrounds?.autoLoad || !backgrounds) {
      return this.getPackBackgrounds(pack.id, normalizeFolder(backgrounds?.folder, "backgrounds"));
    }

    return [];
  },

  resolvePackAssets(pack: PackManifest) {
    return {
      pack,
      stickers: this.resolvePackStickers(pack),
      frames: this.resolvePackFrames(pack),
      backgrounds: this.resolvePackBackgrounds(pack),
    };
  },

  async getActivePackAssets() {
    const pack = await packRegistry.getActivePack();
    return this.resolvePackAssets(pack);
  },
};
