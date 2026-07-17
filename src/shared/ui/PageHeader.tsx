import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  backTo?: string;
  backLabel?: string;
}

export function PageHeader({ title, icon, action, backTo, backLabel = "Volver" }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__identity">
        {backTo && (
          <Link className="page-header__back" to={backTo} aria-label={backLabel}>
            <ArrowLeft aria-hidden="true" size={20} />
          </Link>
        )}
        {icon && <span className="page-header__icon" aria-hidden="true">{icon}</span>}
        <h1>{title}</h1>
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </header>
  );
}
