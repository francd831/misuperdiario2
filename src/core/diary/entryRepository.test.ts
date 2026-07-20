import { describe, expect, it, vi } from "vitest";
import { entryRepository } from "./entryRepository";

vi.mock("../storage/db", () => {
  const entries: any[] = [];

  return {
    dbSet: vi.fn(async (_store: string, value: any) => {
      const index = entries.findIndex((entry) => entry.id === value.id);
      if (index >= 0) entries[index] = value;
      else entries.push(value);
    }),
    dbGet: vi.fn(async (_store: string, id: string) => entries.find((entry) => entry.id === id)),
    dbDelete: vi.fn(async (_store: string, id: string) => {
      const index = entries.findIndex((entry) => entry.id === id);
      if (index >= 0) entries.splice(index, 1);
    }),
    dbListByIndex: vi.fn(async (_store: string, indexName: string, value: any) => {
      if (indexName === "by-profile") return entries.filter((entry) => entry.profileId === value);
      if (indexName === "by-profile-type") {
        const [profileId, type] = value;
        return entries.filter((entry) => entry.profileId === profileId && entry.type === type);
      }
      if (indexName === "by-profile-date") {
        const [profileId, date] = value;
        return entries.filter((entry) => entry.profileId === profileId && entry.date === date);
      }
      return [];
    }),
  };
});

describe("entryRepository", () => {
  it("creates text entries attached to a profile", async () => {
    const entry = await entryRepository.createTextEntry({
      profileId: "profile-1",
      title: "Mi dia",
      note: "Hoy he escrito mi primer recuerdo.",
    });

    expect(entry.profileId).toBe("profile-1");
    expect(entry.type).toBe("text");
    expect(entry.note).toBe("Hoy he escrito mi primer recuerdo.");
  });

  it("creates media entries attached to a profile", async () => {
    const mediaBlob = new Blob(["audio"], { type: "audio/webm" });
    const entry = await entryRepository.createMediaEntry({
      profileId: "profile-1",
      type: "audio",
      durationSeconds: 12,
      mediaBlob,
    });

    expect(entry.profileId).toBe("profile-1");
    expect(entry.type).toBe("audio");
    expect(entry.durationSeconds).toBe(12);
    expect(entry.mediaBlob).toBe(mediaBlob);
  });

  it("removes an entry and its stored media", async () => {
    const entry = await entryRepository.createMediaEntry({
      profileId: "profile-delete",
      type: "video",
      durationSeconds: 4,
      mediaBlob: new Blob(["video"], { type: "video/webm" }),
    });

    await entryRepository.remove(entry.id);

    expect(await entryRepository.get(entry.id)).toBeUndefined();
  });

  it("adds optional details after a media entry is safely stored", async () => {
    const entry = await entryRepository.createMediaEntry({
      profileId: "profile-details",
      type: "audio",
      durationSeconds: 8,
      mediaBlob: new Blob(["audio"], { type: "audio/webm" }),
    });

    const updated = await entryRepository.updateDetails(entry.id, {
      title: "Mi canción",
      note: "La grabé esta tarde",
      isLocked: false,
      unlockAt: undefined,
    });

    expect(updated.title).toBe("Mi canción");
    expect((await entryRepository.get(entry.id))?.note).toBe("La grabé esta tarde");
  });
});
