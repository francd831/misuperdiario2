import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AppNavigation } from "../navigation/AppNavigation";
import { useProfile } from "@/core/auth/ProfileContext";
import { AdminSetup } from "@/features/profiles/AdminSetup";
import { ProfileSelect } from "@/features/profiles/ProfileSelect";

interface AppLayoutProps {
  children: ReactNode;
}

const FULL_SCREEN_ROUTES = ["/record/video", "/record/audio", "/daily-photo/capture", "/lock"];
const NO_NAV_ROUTES = ["/record/video", "/record/audio", "/daily-photo/capture", "/admin-lock"];

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { state } = useProfile();
  const location = useLocation();

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (state.status === "no-profiles") {
    return <AdminSetup />;
  }

  if (state.status === "select") {
    return <ProfileSelect />;
  }

  const isFullScreen = FULL_SCREEN_ROUTES.some((r) => location.pathname.startsWith(r));
  const showNav = !NO_NAV_ROUTES.some((r) => location.pathname.startsWith(r));

  if (isFullScreen) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">{children}</main>
      {showNav && <AppNavigation />}
    </div>
  );
};
