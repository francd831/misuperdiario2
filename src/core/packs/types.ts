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
  stickers?: string[] | { autoLoad?: boolean; folder?: string; categories?: any[] };
  frames?: string[] | { autoLoad?: boolean; folder?: string; items?: any[] };
  backgrounds?: { autoLoad?: boolean; folder?: string };
  sounds?: { [key: string]: string } | { autoLoad?: boolean; defaultType?: string };
  filter?: string;
  intro?: string;
  preview?: string;
}
