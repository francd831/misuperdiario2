import type { PackFrameItem, PackManifest } from "./types";
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

export const packLoader = {
  getPackAssetUrl(packId: string, assetPath: string): string | undefined {
    const key = `/src/assets/packs/${packId}/${assetPath}`;
    return allPackAssets[key];
  },

  getPackStickers(packId: string): string[] {
    const prefix = `/src/assets/packs/${packId}/stickers/`;
    return Object.entries(allPackAssets)
      .filter(([key]) => key.startsWith(prefix))
      .map(([, url]) => url);
  },

  getPackFrames(packId: string): { key: string; file: string }[] {
    const prefix = `/src/assets/packs/${packId}/frames/`;
    const items: { key: string; file: string }[] = [];
    for (const [key, url] of Object.entries(allPackAssets)) {
      if (key.startsWith(prefix)) {
        const filename = key.replace(prefix, "");
        const name = filename.replace(/\.[^.]+$/, "");
        items.push({ key: name, file: url });
      }
    }
    return items;
  },

  getPackBackgrounds(packId: string): string[] {
    const prefix = `/src/assets/packs/${packId}/backgrounds/`;
    return Object.entries(allPackAssets)
      .filter(([key]) => key.startsWith(prefix))
      .map(([, url]) => url);
  },

  async getActivePackAssets() {
    const pack: PackManifest = await packRegistry.getActivePack();

    let stickers: string[] = [];
    if (!Array.isArray(pack.stickers) && pack.stickers?.autoLoad) {
      stickers = this.getPackStickers(pack.id);
    } else if (!Array.isArray(pack.stickers) && Array.isArray(pack.stickers?.categories)) {
      stickers = pack.stickers.categories.flatMap((category) => category.items ?? []);
    } else if (Array.isArray(pack.stickers)) {
      stickers = pack.stickers
        .map((sticker) => (sticker.startsWith("/src/") || sticker.startsWith("http") ? sticker : this.getPackAssetUrl(pack.id, sticker)))
        .filter((sticker): sticker is string => Boolean(sticker));
    } else {
      stickers = this.getPackStickers(pack.id);
    }

    let frames: { key: string; file: string }[] = [];
    if ((!Array.isArray(pack.frames) && pack.frames?.autoLoad) || pack.framesAuto?.autoLoad) {
      frames = this.getPackFrames(pack.id);
    } else if (!Array.isArray(pack.frames) && Array.isArray(pack.frames?.items)) {
      frames = pack.frames.items.map((item) => ({
        key: item.key ?? item.file.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, ""),
        file: item.file,
      }));
    } else if (Array.isArray(pack.frames)) {
      frames = pack.frames
        .map((item) => {
          if (typeof item === "string") {
            const file = this.getPackAssetUrl(pack.id, item);
            if (!file) return undefined;
            return { key: item.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, ""), file };
          } else if (item && typeof item.file === "string") {
            const file = item.file.startsWith("/src/") || item.file.startsWith("http") ? item.file : this.getPackAssetUrl(pack.id, item.file);
            if (!file) return undefined;
            return { key: item.key ?? item.file.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, ""), file };
          }
          return undefined;
        })
        .filter((item): item is PackFrameItem & { key: string } => Boolean(item));
    } else {
      frames = this.getPackFrames(pack.id);
    }

    return { pack, stickers, frames };
  },
};
