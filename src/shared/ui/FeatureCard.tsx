import type { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  tone?: "mint" | "sun" | "berry" | "sky" | "paper";
}

export function FeatureCard({ title, description, icon, tone = "paper" }: FeatureCardProps) {
  return (
    <article className={`feature-card feature-card--${tone}`}>
      {icon && <div className="feature-card__icon">{icon}</div>}
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </article>
  );
}
