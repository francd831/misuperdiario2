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

  async resolveSound(soundKey: string): Promise<string | undefined> {
    const pack = await packRegistry.getActivePack();
    const sounds = packLoader.getPackSounds(pack.id);
    return sounds[soundKey];
  },

  async resolvePreview(): Promise<string | undefined> {
    const pack = await packRegistry.getActivePack();
    return packLoader.getPackAssetUrl(pack.id, "preview/preview.png");
  },
};
