import { describe, expect, it, vi } from "vitest";
import { entryRepository } from "./entryRepository";

vi.mock("../storage/db", () => {
  const entries: any[] = [];

  return {
    dbSet: vi.fn(async (_store: string, value: any) => {
      entries.push(value);
    }),
    dbGet: vi.fn(async (_store: string, id: string) => entries.find((entry) => entry.id === id)),
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
});
