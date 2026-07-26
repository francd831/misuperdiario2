import { describe, expect, it } from "vitest";
import { packLoader } from "./packLoader";

describe("packLoader", () => {
  it("loads bundled pack manifests and assets", () => {
    const packs = packLoader.listPacksWithAssets();
    const base = packs.find((pack) => pack.manifest.id === "base");

    expect(base).toBeTruthy();
    expect(base?.manifest.free).toBe(true);
    expect(base?.stickers).toHaveLength(6);
    expect(base?.frames).toHaveLength(6);
    expect(base?.filters).toHaveLength(1);
    expect(base?.speechBubbles).toHaveLength(1);
    expect(base?.stamps).toHaveLength(1);
    expect(base?.masks).toHaveLength(1);
    expect(base?.effects).toHaveLength(1);

    expect(packs.map((pack) => pack.manifest.id)).toEqual(["base"]);
  });
});
