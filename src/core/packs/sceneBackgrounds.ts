import cinemaBase from "../../assets/recording/cinema-memories-base-v2.webp";
import voiceBase from "../../assets/recording/voice-studio-base.webp";
import writingBase from "../../assets/recording/story-desk-base.webp";
import photoBase from "../../assets/recording/photo-corner-base-v2.webp";
import galleryBase from "../../assets/diary/memory-gallery-base.webp";
import storeBase from "../../assets/store/world-boutique-base.webp";

export interface PackSceneBackgrounds {
  video: string;
  voice: string;
  writing: string;
  photo: string;
  settings?: string;
  store: string;
  gallery: string;
}

export const basePackScenes: PackSceneBackgrounds = {
  video: cinemaBase,
  voice: voiceBase,
  writing: writingBase,
  photo: photoBase,
  store: storeBase,
  gallery: galleryBase,
};

export function getPackSceneBackgrounds(_packId?: string, remote?: Partial<PackSceneBackgrounds>) {
  return { ...basePackScenes, ...remote };
}
