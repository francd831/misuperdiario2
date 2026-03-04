import type { ThemeTokens } from "./themeTokens";
import { DEFAULT_TOKENS } from "./themeTokens";
import { packRegistry } from "../packs/packRegistry";

const CSS_VAR_MAP: Record<string, string> = {
  primary: "--primary",
  secondary: "--secondary",
  accent: "--accent",
  background: "--background",
  foreground: "--foreground",
};

function applyTokens(tokens: ThemeTokens): void {
  const root = document.documentElement;
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    const value = tokens[key];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }
  // Apply any extra custom tokens from the pack
  for (const [key, value] of Object.entries(tokens)) {
    if (!CSS_VAR_MAP[key]) {
      root.style.setProperty(`--pack-${key}`, value);
    }
  }
}

export const themeEngine = {
  applyDefaults(): void {
    applyTokens(DEFAULT_TOKENS);
  },

  applyTokens(tokens: ThemeTokens): void {
    applyTokens(tokens);
  },

  async applyActivePack(): Promise<void> {
    try {
      const pack = await packRegistry.getActivePack();
      if (pack?.theme) {
        applyTokens(pack.theme as ThemeTokens);
      }
    } catch {
      applyTokens(DEFAULT_TOKENS);
    }
  },

  resetToDefaults(): void {
    applyTokens(DEFAULT_TOKENS);
    // Clear custom pack vars
    const root = document.documentElement;
    Array.from(root.style).forEach((prop) => {
      if (prop.startsWith("--pack-")) {
        root.style.removeProperty(prop);
      }
    });
  },
};
