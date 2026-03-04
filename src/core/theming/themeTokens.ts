export interface ThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  [key: string]: string;
}

export const DEFAULT_TOKENS: ThemeTokens = {
  primary: "222.2 47.4% 11.2%",
  secondary: "210 40% 96.1%",
  accent: "210 40% 96.1%",
  background: "0 0% 100%",
  foreground: "222.2 84% 4.9%",
};
