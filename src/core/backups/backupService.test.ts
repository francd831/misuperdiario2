import JSZip from "jszip";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { backupService } from "./backupService";

const state = vi.hoisted(() => ({
  stores: {} as Record<string, any[]>,
}));

vi.mock("../storage/db", () => ({
  dbList: vi.fn(async (storeName: string) => state.stores[storeName] ?? []),
  dbClear: vi.fn(async (storeName: string) => {
    state.stores[storeName] = [];
  }),
  dbSet: vi.fn(async (storeName: string, value: any) => {
    state.stores[storeName] = [...(state.stores[storeName] ?? []), value];
  }),
}));

describe("backupService", () => {
  beforeEach(() => {
    state.stores = {
      profiles: [{ id: "profile-1", role: "child", name: "Luna", avatarColor: "#fff", activePackId: "base" }],
      storagePolicies: [{ id: "global", maxVideoSeconds: 60 }],
      entries: [
        {
          id: "entry-1",
          profileId: "profile-1",
          type: "audio",
          date: "2026-07-14",
          mediaBlob: new Blob(["audio"], { type: "audio/webm" }),
          isLocked: false,
          createdAt: "2026-07-14T00:00:00.000Z",
          updatedAt: "2026-07-14T00:00:00.000Z",
        },
      ],
      dailyPhotos: [
        {
          id: "photo-1",
          profileId: "profile-1",
          date: "2026-07-14",
          blob: new Blob(["photo"], { type: "image/jpeg" }),
          thumbnailBlob: new Blob(["thumb"], { type: "image/jpeg" }),
          createdAt: "2026-07-14T00:00:00.000Z",
          updatedAt: "2026-07-14T00:00:00.000Z",
        },
      ],
      packEntitlements: [{ id: "profile-1:magic", profileId: "profile-1", packId: "magic" }],
      walletTransactions: [{ id: "profile-1:welcome", profileId: "profile-1", amount: 20 }],
      achievements: [{ id: "profile-1:first-entry", profileId: "profile-1", achievementId: "first-entry" }],
    };
  });

  it("exports structured data and media files into a zip backup", async () => {
    const backup = await backupService.createBackupBlob();
    const zip = await JSZip.loadAsync(backup);
    const manifest = JSON.parse(await zip.file("manifest.json")!.async("string"));
    const data = JSON.parse(await zip.file("data.json")!.async("string"));

    expect(manifest.counts.entries).toBe(1);
    expect(manifest.counts.dailyPhotos).toBe(1);
    expect(data.entries[0].mediaBlob.path).toBe("media/entries/entry-1.blob");
    expect(data.dailyPhotos[0].blob.path).toBe("media/daily-photos/photo-1.blob");
    expect(zip.file("media/entries/entry-1.blob")).toBeTruthy();
    expect(zip.file("media/daily-photos/photo-1-thumbnail.blob")).toBeTruthy();
  });
});
