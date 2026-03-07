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

  getPackSounds(packId: string, defaultType = "effect"): { key: string; file: string; type: string }[] {
    const prefix = `/src/assets/packs/${packId}/sounds/`;
    const items: { key: string; file: string; type: string }[] = [];
    for (const [key, url] of Object.entries(allPackAssets)) {
      if (key.startsWith(prefix)) {
        const filename = key.replace(prefix, "");
        const name = filename.replace(/\.[^.]+$/, "");
        items.push({ key: name, file: url, type: defaultType });
      }
    }
    return items;
  },

  async getActivePackAssets() {
    const pack: PackManifest = await packRegistry.getActivePack();

    // Stickers: prefer autoLoad, else use categories.items if present
    let stickers: string[] = [];
    if (pack.stickers?.autoLoad) {
      stickers = this.getPackStickers(pack.id);
    } else if (Array.isArray(pack.stickers?.categories)) {
      stickers = pack.stickers.categories.flatMap((c: any) => c.items ?? []);
    } else {
      // fallback to scanning
      stickers = this.getPackStickers(pack.id);
    }

    // Frames: support object with autoLoad, items, or simple array fallback
    let frames: { key: string; file: string }[] = [];
    if (pack.frames?.autoLoad || (pack as any).framesAuto?.autoLoad) {
      frames = this.getPackFrames(pack.id);
    } else if (Array.isArray((pack as any).frames?.items)) {
      frames = (pack as any).frames.items;
    } else if (Array.isArray((pack as any).frames)) {
      // allow old-style array of {key,file}
      frames = (pack as any).frames;
    } else {
      frames = this.getPackFrames(pack.id);
    }

    // Sounds: prefer manifest flags, support defaultType and fallbacks
    const defaultSoundType =
      pack.sounds?.defaultType || (pack as any).soundsAuto?.defaultType || "effect";
    let sounds: { key: string; file: string; type: string }[] = [];
    if (pack.sounds?.autoLoad || (pack as any).soundsAuto?.autoLoad) {
      sounds = this.getPackSounds(pack.id, defaultSoundType);
    } else if (Array.isArray((pack as any).sounds)) {
      // assume array of {key,file,type}
      sounds = (pack as any).sounds;
    } else if (Array.isArray((pack as any).sounds?.items)) {
      sounds = (pack as any).sounds.items;
    } else {
      sounds = this.getPackSounds(pack.id, defaultSoundType);
    }

    return {
      pack,
      stickers,
      frames,
      sounds,
    };
  },
};
