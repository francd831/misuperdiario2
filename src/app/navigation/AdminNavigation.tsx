import { NavLink } from "react-router-dom";
import { Users, FileText, Settings, LogOut } from "lucide-react";
import { useProfile } from "@/core/auth/ProfileContext";

const navItems = [
  { to: "/admin", icon: Users, label: "Panel" },
  { to: "/admin/profiles", icon: Users, label: "Perfiles" },
  { to: "/admin/content", icon: FileText, label: "Contenido" },
  { to: "/admin/settings", icon: Settings, label: "Ajustes" },
];

export const AdminNavigation = () => {
  const { logout } = useProfile();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-md justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
};
