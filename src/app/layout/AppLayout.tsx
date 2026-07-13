import { Outlet, useLocation } from "react-router-dom";
import { BottomNavigation } from "../navigation/BottomNavigation";

const routesWithoutNav = new Set(["/", "/profiles", "/admin"]);

export function AppLayout() {
  const location = useLocation();
  const showNav = !routesWithoutNav.has(location.pathname);

  return (
    <div className="app-frame">
      <main className="app-main">
        <Outlet />
      </main>
      {showNav && <BottomNavigation />}
    </div>
  );
}
