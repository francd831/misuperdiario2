import { Gauge, HardDrive, Timer } from "lucide-react";
import { FeatureCard } from "../../shared/ui/FeatureCard";
import { PageHeader } from "../../shared/ui/PageHeader";

export default function SettingsPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Ajustes"
        title="Preferencias del perfil"
        description="La zona infantil sera sencilla; los limites avanzados viven en administracion."
      />

      <div className="grid-two">
        <FeatureCard title="Tiempo" description="Limites de audio y video." icon={<Timer size={24} />} tone="mint" />
        <FeatureCard title="Calidad" description="Foto y video en baja, media o alta." icon={<Gauge size={24} />} tone="sky" />
        <FeatureCard title="Espacio" description="Avisos antes de llenar el dispositivo." icon={<HardDrive size={24} />} tone="sun" />
      </div>
    </section>
  );
}
