import { ShieldCheck, UserRoundPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { FeatureCard } from "../../shared/ui/FeatureCard";
import { PageHeader } from "../../shared/ui/PageHeader";

export default function ProfileSelectPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Perfiles"
        title="Quien va a usar el diario?"
        description="En la siguiente fase crearemos perfiles reales con PIN seguro y avatar."
      />

      <div className="grid-two">
        <FeatureCard
          title="Perfil infantil"
          description="Entrara al diario, fotos, tienda y recompensas de su propio espacio."
          icon={<UserRoundPlus size={24} />}
          tone="mint"
        />
        <FeatureCard
          title="Perfil admin"
          description="Gestionara limites, backups, perfiles y almacenamiento local."
          icon={<ShieldCheck size={24} />}
          tone="sun"
        />
      </div>

      <Link className="primary-action" to="/home">
        Continuar al prototipo
      </Link>
    </section>
  );
}
