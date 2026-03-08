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
    const p: any = pack;

    let stickers: string[] = [];
    if (p.stickers?.autoLoad) {
      stickers = this.getPackStickers(pack.id);
    } else if (p.stickers && Array.isArray(p.stickers.categories)) {
      stickers = p.stickers.categories.flatMap((c: any) => c.items ?? []);
    } else if (Array.isArray(p.stickers)) {
      stickers = p.stickers.map((s: string) => (typeof s === "string" ? (s.startsWith("/src/") || s.startsWith("http") ? s : this.getPackAssetUrl(pack.id, s)) : undefined)).filter(Boolean) as string[];
    } else {
      stickers = this.getPackStickers(pack.id);
    }

    let frames: { key: string; file: string }[] = [];
    if (p.frames?.autoLoad || p.framesAuto?.autoLoad) {
      frames = this.getPackFrames(pack.id);
    } else if (p.frames && Array.isArray(p.frames.items)) {
      frames = p.frames.items;
    } else if (Array.isArray(p.frames)) {
      frames = p.frames
        .map((it: any) => {
          if (typeof it === "string") {
            const file = this.getPackAssetUrl(pack.id, it);
            if (!file) return undefined;
            return { key: it.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, ""), file };
          } else if (it && typeof it.file === "string") {
            const file = it.file.startsWith("/src/") || it.file.startsWith("http") ? it.file : this.getPackAssetUrl(pack.id, it.file);
            if (!file) return undefined;
            return { key: it.key ?? it.file.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, ""), file };
          }
          return undefined;
        })
        .filter(Boolean) as { key: string; file: string }[];
    } else {
      frames = this.getPackFrames(pack.id);
    }

    return { pack, stickers, frames };
  },
};
