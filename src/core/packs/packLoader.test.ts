import { describe, expect, it } from "vitest";
import { packLoader } from "./packLoader";

describe("packLoader", () => {
  it("loads bundled pack manifests and assets", () => {
    const packs = packLoader.listPacksWithAssets();
    const base = packs.find((pack) => pack.manifest.id === "base");

    expect(base).toBeTruthy();
    expect(base?.manifest.free).toBe(true);
    expect(base?.stickers.length).toBeGreaterThan(0);
  });
});
