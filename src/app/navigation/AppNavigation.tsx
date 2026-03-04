import { NavLink } from "react-router-dom";
import { BookOpen, Camera, ShoppingBag, Settings } from "lucide-react";

const navItems = [
  { to: "/", icon: BookOpen, label: "Diario" },
  { to: "/daily-photo", icon: Camera, label: "Foto" },
  { to: "/store", icon: ShoppingBag, label: "Tienda" },
  { to: "/settings", icon: Settings, label: "Ajustes" },
];

export const AppNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-md justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
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
      </div>
    </nav>
  );
};
