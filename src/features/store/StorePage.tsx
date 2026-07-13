import { ShoppingBag, Star } from "lucide-react";
import { FeatureCard } from "../../shared/ui/FeatureCard";
import { PageHeader } from "../../shared/ui/PageHeader";

export default function StorePage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Tienda"
        title="Packs por estrellas"
        description="Los packs cosmeticos se compraran con estrellas del perfil activo."
      />

      <div className="grid-two">
        <FeatureCard
          title="Saldo"
          description="El monedero llegara con transacciones e historial."
          icon={<Star size={24} />}
          tone="sun"
        />
        <FeatureCard
          title="Packs"
          description="Conservamos los assets actuales para reusarlos en el rebuild."
          icon={<ShoppingBag size={24} />}
          tone="berry"
        />
      </div>
    </section>
  );
}
