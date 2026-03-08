import { packLoader } from "./packLoader";
import { packRegistry } from "./packRegistry";

/**
 * High-level API for resolving pack assets.
 * Components should use this instead of packLoader directly.
 */
export const assetResolver = {
  async resolveSticker(stickerId: string): Promise<string | undefined> {
    const pack = await packRegistry.getActivePack();
    return packLoader.getPackAssetUrl(pack.id, `stickers/${stickerId}`);
  },

  async resolveFrame(frameId: string): Promise<string | undefined> {
    const pack = await packRegistry.getActivePack();
    return packLoader.getPackAssetUrl(pack.id, `frames/${frameId}`);
  },

  async resolvePreview(): Promise<string | undefined> {
    const pack = await packRegistry.getActivePack();
    return packLoader.getPackAssetUrl(pack.id, "preview/preview.png");
  },
};
