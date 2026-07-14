import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  backTo?: string;
  backLabel?: string;
}

export function PageHeader({ eyebrow, title, description, action, backTo, backLabel = "Volver" }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {backTo && (
          <Link className="page-header__back" to={backTo} aria-label={backLabel}>
            <ArrowLeft aria-hidden="true" size={18} />
            <span>{backLabel}</span>
          </Link>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </header>
  );
}
