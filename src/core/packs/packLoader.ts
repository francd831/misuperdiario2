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

function isUrl(v: unknown): v is string {
  return typeof v === "string" && !!v;
}

function basename(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? path;
}

export const packLoader = {
  getPackAssetUrl(packId: string, assetPath: string): string | undefined {
    const key = `/src/assets/packs/${packId}/${assetPath}`;
    return allPackAssets[key];
  },

  getPackStickers(packId: string): string[] {
    const prefix = `/src/assets/packs/${packId}/stickers/`;
    return Object.entries(allPackAssets)
      .filter(([key]) => key.startsWith(prefix))
      .map(([, url]) => url)
      .filter(isUrl);
  },

  getPackFrames(packId: string): { key: string; file: string }[] {
    const prefix = `/src/assets/packs/${packId}/frames/`;
    const items: { key: string; file: string }[] = [];
    for (const [key, url] of Object.entries(allPackAssets)) {
      if (key.startsWith(prefix)) {
        const filename = key.replace(prefix, "");
        const name = basename(filename).replace(/\.[^.]+$/, "");
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
        const name = basename(filename).replace(/\.[^.]+$/, "");
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
      const raw: string[] = pack.stickers.categories.flatMap((c: any) => c.items ?? []);
      stickers = raw
        .map((p) => {
          if (typeof p !== "string") return undefined;
          // if already a resolved url, keep it; else resolve via manifest path
          if (p.startsWith("/src/") || p.startsWith("http")) return p;
          return this.getPackAssetUrl(pack.id, p);
        })
        .filter(isUrl);
    } else {
      stickers = this.getPackStickers(pack.id);
    }

    // Frames: support object with autoLoad, items, or simple array fallback
    let frames: { key: string; file: string }[] = [];
    const framesAutoFlag = !!(pack.frames?.autoLoad || (pack as any).framesAuto?.autoLoad);
    if (framesAutoFlag) {
      frames = this.getPackFrames(pack.id);
    } else if (Array.isArray((pack as any).frames?.items)) {
      const raw = (pack as any).frames.items;
      frames = raw
        .map((it: any) => {
          if (typeof it === "string") {
            const fileUrl = this.getPackAssetUrl(pack.id, it);
            if (!fileUrl) return undefined;
            const key = basename(it).replace(/\.[^.]+$/, "");
            return { key, file: fileUrl };
          } else if (it && typeof it.file === "string") {
            const fileUrl = it.file.startsWith("/src/") || it.file.startsWith("http") ? it.file : this.getPackAssetUrl(pack.id, it.file);
            if (!fileUrl) return undefined;
            const key = typeof it.key === "string" ? it.key : basename(it.file).replace(/\.[^.]+$/, "");
            return { key, file: fileUrl };
          }
          return undefined;
        })
        .filter(Boolean) as { key: string; file: string }[];
    } else if (Array.isArray((pack as any).frames)) {
      // allow old-style array of {key,file} or array of strings
      const raw = (pack as any).frames;
      frames = raw
        .map((it: any) => {
          if (typeof it === "string") {
            const fileUrl = this.getPackAssetUrl(pack.id, it);
            if (!fileUrl) return undefined;
            const key = basename(it).replace(/\.[^.]+$/, "");
            return { key, file: fileUrl };
          } else if (it && typeof it.file === "string") {
            const fileUrl = it.file.startsWith("/src/") || it.file.startsWith("http") ? it.file : this.getPackAssetUrl(pack.id, it.file);
            if (!fileUrl) return undefined;
            const key = typeof it.key === "string" ? it.key : basename(it.file).replace(/\.[^.]+$/, "");
            return { key, file: fileUrl };
          }
          return undefined;
        })
        .filter(Boolean) as { key: string; file: string }[];
    } else {
      frames = this.getPackFrames(pack.id);
    }

    // Sounds: prefer manifest flags, support defaultType and fallbacks
    const defaultSoundType =
      pack.sounds?.defaultType || (pack as any).soundsAuto?.defaultType || "effect";
    let sounds: { key: string; file: string; type: string }[] = [];
    const soundsAutoFlag = !!(pack.sounds?.autoLoad || (pack as any).soundsAuto?.autoLoad);
    if (soundsAutoFlag) {
      sounds = this.getPackSounds(pack.id, defaultSoundType);
    } else if (Array.isArray((pack as any).sounds)) {
      const raw = (pack as any).sounds;
      sounds = raw
        .map((it: any) => {
          if (typeof it === "string") {
            const fileUrl = this.getPackAssetUrl(pack.id, it);
            if (!fileUrl) return undefined;
            const key = basename(it).replace(/\.[^.]+$/, "");
            return { key, file: fileUrl, type: defaultSoundType };
          } else if (it && typeof it.file === "string") {
            const fileUrl = it.file.startsWith("/src/") || it.file.startsWith("http") ? it.file : this.getPackAssetUrl(pack.id, it.file);
            if (!fileUrl) return undefined;
            const key = typeof it.key === "string" ? it.key : basename(it.file).replace(/\.[^.]+$/, "");
            const type = typeof it.type === "string" ? it.type : defaultSoundType;
            return { key, file: fileUrl, type };
          }
          return undefined;
        })
        .filter(Boolean) as { key: string; file: string; type: string }[];
    } else if (Array.isArray((pack as any).sounds?.items)) {
      const raw = (pack as any).sounds.items;
      sounds = raw
        .map((it: any) => {
          if (typeof it === "string") {
            const fileUrl = this.getPackAssetUrl(pack.id, it);
            if (!fileUrl) return undefined;
            const key = basename(it).replace(/\.[^.]+$/, "");
            return { key, file: fileUrl, type: defaultSoundType };
          } else if (it && typeof it.file === "string") {
            const fileUrl = it.file.startsWith("/src/") || it.file.startsWith("http") ? it.file : this.getPackAssetUrl(pack.id, it.file);
            if (!fileUrl) return undefined;
            const key = typeof it.key === "string" ? it.key : basename(it.file).replace(/\.[^.]+$/, "");
            const type = typeof it.type === "string" ? it.type : defaultSoundType;
            return { key, file: fileUrl, type };
          }
          return undefined;
        })
        .filter(Boolean) as { key: string; file: string; type: string }[];
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
