import { dbListByIndex } from "../../storage/indexeddb";

export interface TimelapseFrame {
  date: string;
  blob: Blob;
}

export const timelapseService = {
  async loadFrames(profileId: string): Promise<TimelapseFrame[]> {
    const photos = await dbListByIndex("daily_photos", "by-profile", profileId);
    return photos
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((p) => ({ date: p.date, blob: p.blob }));
  },

  createObjectUrls(frames: TimelapseFrame[]): string[] {
    return frames.map((f) => URL.createObjectURL(f.blob));
  },

  revokeObjectUrls(urls: string[]): void {
    urls.forEach((url) => URL.revokeObjectURL(url));
  },

  /**
   * Plays a timelapse sequence, calling onFrame for each image.
   * Returns a cancel function.
   */
  play(
    urls: string[],
    onFrame: (url: string, index: number) => void,
    intervalMs = 500
  ): () => void {
    let index = 0;
    let cancelled = false;

    const step = () => {
      if (cancelled || index >= urls.length) return;
      onFrame(urls[index], index);
      index++;
      setTimeout(step, intervalMs);
    };

    step();
    return () => { cancelled = true; };
  },
};
