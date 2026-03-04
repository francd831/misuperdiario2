import JSZip from "jszip";
import { saveAs } from "file-saver";
import { dbList } from "../../storage/indexeddb";

export const backupService = {
  async exportBackup(): Promise<void> {
    const zip = new JSZip();

    const profiles = await dbList("profiles");
    const entries = await dbList("entries");
    const settings = await dbList("settings");
    const photos = await dbList("daily_photos");

    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profiles,
      entries,
      settings,
    };

    zip.file("backup.json", JSON.stringify(backupData, null, 2));

    const photosFolder = zip.folder("photos");
    for (const photo of photos) {
      if (photo.blob) {
        photosFolder?.file(`${photo.id}.jpg`, photo.blob);
      }
    }

    // videos/ and audio/ folders reserved for future use
    zip.folder("videos");
    zip.folder("audio");

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `video-diario-backup-${new Date().toISOString().slice(0, 10)}.zip`);
  },

  async importBackup(file: File): Promise<void> {
    const zip = await JSZip.loadAsync(file);

    const backupJson = await zip.file("backup.json")?.async("string");
    if (!backupJson) throw new Error("Invalid backup: missing backup.json");

    const data = JSON.parse(backupJson);

    const { dbSet } = await import("../../storage/indexeddb");

    // Restore profiles
    for (const profile of data.profiles ?? []) {
      await dbSet("profiles", profile);
    }

    // Restore entries
    for (const entry of data.entries ?? []) {
      await dbSet("entries", entry);
    }

    // Restore settings
    for (const setting of data.settings ?? []) {
      await dbSet("settings", setting);
    }

    // Restore photos
    const photosFolder = zip.folder("photos");
    if (photosFolder) {
      const photoFiles = Object.keys(zip.files).filter((f) =>
        f.startsWith("photos/") && !f.endsWith("/")
      );
      for (const path of photoFiles) {
        const blob = await zip.file(path)?.async("blob");
        if (blob) {
          const id = path.replace("photos/", "").replace(".jpg", "");
          await dbSet("daily_photos", {
            id,
            profileId: "default",
            date: new Date().toISOString().slice(0, 10),
            blob,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  },
};
