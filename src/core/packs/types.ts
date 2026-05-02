export interface PackManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  free?: boolean;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    [key: string]: string;
  };
  stickers?: string[] | { autoLoad?: boolean; folder?: string; categories?: PackStickerCategory[] };
  frames?: PackFrameItem[] | { autoLoad?: boolean; folder?: string; items?: PackFrameItem[] };
  framesAuto?: { autoLoad?: boolean; folder?: string };
  backgrounds?: { autoLoad?: boolean; folder?: string };
  filter?: string;
  intro?: string;
  preview?: string;
}

export interface PackStickerCategory {
  id?: string;
  name?: string;
  items?: string[];
}

export interface PackFrameItem {
  key?: string;
  file: string;
}
