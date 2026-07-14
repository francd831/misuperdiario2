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

    const piratePack = packs.find((pack) => pack.manifest.id === "aventuraPirata");
    expect(piratePack?.frames).toHaveLength(12);

    const paidPack = packs.find((pack) => pack.manifest.id !== "base");
    expect(paidPack?.filters).toHaveLength(5);
    expect(paidPack?.speechBubbles).toHaveLength(5);
    expect(paidPack?.stamps).toHaveLength(5);
    expect(paidPack?.masks).toHaveLength(5);
    expect(paidPack?.effects).toHaveLength(5);
  });
});
