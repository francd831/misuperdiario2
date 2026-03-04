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
  stickers?: string[];
  frames?: string[];
  sounds?: { [key: string]: string };
  intro?: string;
  preview?: string;
}
