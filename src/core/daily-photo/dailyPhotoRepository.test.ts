import { describe, expect, it, vi } from "vitest";
import { dailyPhotoRepository } from "./dailyPhotoRepository";

vi.mock("../storage/db", () => {
  const photos: any[] = [];

  return {
    dbSet: vi.fn(async (_store: string, value: any) => {
      const index = photos.findIndex((photo) => photo.id === value.id);
      if (index >= 0) photos[index] = value;
      else photos.push(value);
    }),
    dbGet: vi.fn(async (_store: string, id: string) => photos.find((photo) => photo.id === id)),
    dbDelete: vi.fn(async (_store: string, id: string) => {
      const index = photos.findIndex((photo) => photo.id === id);
      if (index >= 0) photos.splice(index, 1);
    }),
    dbListByIndex: vi.fn(async (_store: string, indexName: string, value: any) => {
      if (indexName === "by-profile") return photos.filter((photo) => photo.profileId === value);
      if (indexName === "by-profile-date") {
        const [profileId, date] = value;
        return photos.filter((photo) => photo.profileId === profileId && photo.date === date);
      }
      return [];
    }),
  };
});

describe("dailyPhotoRepository", () => {
  it("saves one photo for today per profile", async () => {
    const photo = await dailyPhotoRepository.saveToday(
      {
        profileId: "profile-1",
        blob: new Blob(["photo"]),
        caption: "Hoy",
      },
      true,
    );

    expect(photo.profileId).toBe("profile-1");
    expect(photo.caption).toBe("Hoy");

    const photos = await dailyPhotoRepository.listByProfile("profile-1");
    expect(photos).toHaveLength(1);
  });

  it("blocks replacement when policy disallows it", async () => {
    await expect(
      dailyPhotoRepository.saveToday(
        {
          profileId: "profile-1",
          blob: new Blob(["new"]),
        },
        false,
      ),
    ).rejects.toThrow("Ya existe una foto para hoy.");
  });
});
