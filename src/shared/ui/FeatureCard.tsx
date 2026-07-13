import type { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  tone?: "mint" | "sun" | "berry" | "sky" | "paper";
  badge?: string;
}

export function FeatureCard({ title, description, icon, tone = "paper", badge }: FeatureCardProps) {
  return (
    <article className={`feature-card feature-card--${tone}`}>
      <div className="feature-card__top">
        {icon && <div className="feature-card__icon">{icon}</div>}
        {badge && <span className="feature-card__badge">{badge}</span>}
      </div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </article>
  );
}
