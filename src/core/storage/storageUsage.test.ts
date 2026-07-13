import { describe, expect, it, vi } from "vitest";
import { estimateStorageUsage, formatBytes } from "./storageUsage";

vi.mock("./db", () => ({
  dbList: vi.fn(async (store: string) => {
    if (store === "entries") {
      return [
        { profileId: "a", mediaBlob: new Blob(["12345"]) },
        { profileId: "b", mediaBlob: new Blob(["12"]) },
      ];
    }
    return [{ profileId: "a", blob: new Blob(["123"]), thumbnailBlob: new Blob(["1"]) }];
  }),
}));

describe("storageUsage", () => {
  it("estimates media bytes by store and profile", async () => {
    const usage = await estimateStorageUsage();

    expect(usage.totalBytes).toBe(11);
    expect(usage.entriesBytes).toBe(7);
    expect(usage.dailyPhotosBytes).toBe(4);
    expect(usage.byProfile.a).toBe(9);
    expect(usage.byProfile.b).toBe(2);
  });

  it("formats bytes for display", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
  });
});
