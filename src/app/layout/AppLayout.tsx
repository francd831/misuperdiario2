import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AppNavigation } from "../navigation/AppNavigation";
import { AdminNavigation } from "../navigation/AdminNavigation";
import { useProfile } from "@/core/auth/ProfileContext";
import { AdminSetup } from "@/features/profiles/AdminSetup";
import { ProfileSelect } from "@/features/profiles/ProfileSelect";
import { PackBackground } from "@/features/backgrounds/PackBackground";

interface AppLayoutProps {
  children: ReactNode;
}

const FULL_SCREEN_ROUTES = ["/record/video", "/record/audio", "/daily-photo/capture", "/lock"];
const NO_NAV_ROUTES = ["/record/video", "/record/audio", "/daily-photo/capture", "/admin-lock"];
/** Routes where a detail view with its own overlay tray needs full screen (no bottom nav) */
const DETAIL_ROUTE_RE = /^\/(daily-photo|entry)\/[^/]+$/;

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { state, activeProfile } = useProfile();
  const location = useLocation();

  if (state.status === "loading") {
    return (
      <div className="relative flex min-h-screen items-center justify-center text-foreground">
        <PackBackground />
        <p className="relative z-10 text-lg text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (state.status === "no-profiles" || state.status === "needs-admin") {
    return (
      <div className="relative min-h-screen text-foreground">
        <PackBackground />
        <div className="relative z-10">
          <AdminSetup />
        </div>
      </div>
    );
  }

  if (state.status === "select") {
    return <ProfileSelect />;
  }

  const isAdmin = activeProfile?.role === "admin";
  const isDetailRoute = DETAIL_ROUTE_RE.test(location.pathname) && !location.pathname.endsWith("/capture");
  const isFullScreen = isDetailRoute || FULL_SCREEN_ROUTES.some((r) => location.pathname.startsWith(r));
  const showNav = !isDetailRoute && !NO_NAV_ROUTES.some((r) => location.pathname.startsWith(r));

  if (isFullScreen && !isAdmin) {
    return (
      <div className="relative min-h-screen">
        <PackBackground />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      <PackBackground />
      <main className="relative z-10 flex-1">{children}</main>
      {showNav && (isAdmin ? <AdminNavigation /> : <AppNavigation />)}
    </div>
  );
};
