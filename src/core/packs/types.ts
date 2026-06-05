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
  stickers?: string[] | { autoLoad?: boolean; folder?: string; categories?: { items?: string[] }[] };
  frames?: string[] | { autoLoad?: boolean; folder?: string; items?: { key?: string; file: string }[] };
  backgrounds?: { autoLoad?: boolean; folder?: string };
  filter?: string;
  intro?: string;
  preview?: string;
}
