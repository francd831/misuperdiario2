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

  getPackFrames(packId: string): string[] {
    const prefix = `/src/assets/packs/${packId}/frames/`;
    return Object.entries(allPackAssets)
      .filter(([key]) => key.startsWith(prefix))
      .map(([, url]) => url);
  },

  getPackSounds(packId: string): Record<string, string> {
    const prefix = `/src/assets/packs/${packId}/sounds/`;
    const sounds: Record<string, string> = {};
    for (const [key, url] of Object.entries(allPackAssets)) {
      if (key.startsWith(prefix)) {
        const name = key.replace(prefix, "").replace(/\.[^.]+$/, "");
        sounds[name] = url;
      }
    }
    return sounds;
  },

  async getActivePackAssets() {
    const pack = await packRegistry.getActivePack();
    return {
      pack,
      stickers: this.getPackStickers(pack.id),
      frames: this.getPackFrames(pack.id),
      sounds: this.getPackSounds(pack.id),
    };
  },
};
