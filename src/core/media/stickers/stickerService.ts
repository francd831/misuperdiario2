import { packLoader } from "../../packs/packLoader";
import { packRegistry } from "../../packs/packRegistry";
import type { StickerOverlay } from "../../storage/indexeddb";

export interface StickerConfig {
  stickerId: string;
  url: string;
}

export const stickerService = {
  async getAvailableStickers(): Promise<StickerConfig[]> {
    const pack = await packRegistry.getActivePack();
    const urls = packLoader.getPackStickers(pack.id);
    return urls.map((url, i) => ({
      stickerId: `${pack.id}-sticker-${i}`,
      url,
    }));
  },

  createOverlay(
    stickerId: string,
    x: number,
    y: number,
    scale = 1,
    rotation = 0
  ): StickerOverlay {
    return { stickerId, x, y, scale, rotation };
  },

  serializeOverlays(overlays: StickerOverlay[]): string {
    return JSON.stringify(overlays);
  },

  deserializeOverlays(json: string): StickerOverlay[] {
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  },
};
