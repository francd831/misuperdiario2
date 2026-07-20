import { useMemo, type CSSProperties } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { packLoader } from "../../core/packs/packLoader";
import type { PackManifest } from "../../core/packs/types";
import { useProfiles } from "../../core/profiles/ProfileContext";
const fallbackPackId = "base";

type ThemeVariables = CSSProperties & Record<`--${string}`, string>;

function hsl(value: string | undefined, fallback: string) {
  return `hsl(${value?.trim() || fallback})`;
}

function hslAlpha(value: string | undefined, fallback: string, alpha: number) {
  return `hsl(${value?.trim() || fallback} / ${alpha})`;
}

function themeVariables(pack: PackManifest | undefined): ThemeVariables {
  const theme = pack?.theme;
  const primary = hsl(theme?.primary, "255 83% 67%");
  const secondary = hsl(theme?.secondary, "340 100% 78%");
  const accent = hsl(theme?.accent, "43 100% 67%");
  const background = hsl(theme?.background, "43 100% 94%");
  const foreground = hsl(theme?.foreground, "270 27% 19%");

  return {
    "--theme-primary": primary,
    "--theme-secondary": secondary,
    "--theme-accent": accent,
    "--theme-background": background,
    "--theme-foreground": foreground,
    "--theme-primary-soft": hslAlpha(theme?.primary, "255 83% 67%", 0.22),
    "--theme-secondary-soft": hslAlpha(theme?.secondary, "340 100% 78%", 0.34),
    "--theme-accent-soft": hslAlpha(theme?.accent, "43 100% 67%", 0.42),
    "--ink": foreground,
    "--berry": secondary,
    "--sun": accent,
    "--violet": primary,
  };
}

export function AppLayout() {
  const { activeProfile } = useProfiles();
  const location = useLocation();
  const activePackId = activeProfile?.activePackId ?? fallbackPackId;
  const activePack = packLoader.getPack(activePackId) ?? packLoader.getPack(fallbackPackId);
  const style = useMemo(() => themeVariables(activePack), [activePack]);

  return (
    <div className={`app-frame ${location.pathname === "/home" ? "app-frame--home" : ""}`} data-pack-theme={activePack?.id ?? fallbackPackId} style={style}>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
