import { describe, expect, it } from "vitest";

import baseManifest from "@/assets/packs/base/manifest.json";
import dulcePasteleriaManifest from "@/assets/packs/dulcePasteleria/manifest.json";
import { packLoader } from "./packLoader";
import type { PackManifest } from "./types";

describe("packLoader", () => {
  it("autoloads sticker and frame folders declared by pack manifests", () => {
    const assets = packLoader.resolvePackAssets(dulcePasteleriaManifest as PackManifest);

    expect(assets.stickers.length).toBeGreaterThan(0);
    expect(assets.frames.length).toBeGreaterThan(0);
  });

  it("falls back to conventional sticker and frame folders when no backgrounds folder exists", () => {
    const assets = packLoader.resolvePackAssets(baseManifest as PackManifest);

    expect(assets.stickers.length).toBeGreaterThan(0);
    expect(assets.frames.length).toBeGreaterThan(0);
    expect(assets.backgrounds).toEqual([]);
  });
});
