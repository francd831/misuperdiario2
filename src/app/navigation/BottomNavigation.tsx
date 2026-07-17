import { BookOpen, Camera, Home, Settings, ShoppingBag } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/home", label: "Inicio", icon: Home },
  { to: "/diary", label: "Diario", icon: BookOpen },
  { to: "/daily-photo", label: "Foto", icon: Camera },
  { to: "/store", label: "Tienda", icon: ShoppingBag },
  { to: "/settings", label: "Ajustes", icon: Settings },
];

export function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className="bottom-nav__item">
          <Icon aria-hidden="true" size={20} strokeWidth={2.4} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
