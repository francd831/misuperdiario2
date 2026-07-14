import { Gauge, HardDrive, ShieldCheck, Timer } from "lucide-react";
import { FeatureCard } from "../../shared/ui/FeatureCard";
import { PageHeader } from "../../shared/ui/PageHeader";

export default function SettingsPage() {
  return (
    <section className="page-stack settings-page">
      <PageHeader
        eyebrow="Mochila"
        title="Mochila segura"
        description="Aqui veras el estado de tu espacio. Los limites importantes los cuida un adulto."
        backTo="/home"
      />

      <div className="grid-two">
        <FeatureCard title="Tiempo" description="Videos y audios tienen limites para cuidar el espacio." icon={<Timer size={24} />} tone="mint" badge="regla" />
        <FeatureCard title="Calidad" description="Fotos y videos se guardan con una calidad equilibrada." icon={<Gauge size={24} />} tone="sky" badge="media" />
        <FeatureCard title="Espacio" description="La app avisa antes de llenar el dispositivo." icon={<HardDrive size={24} />} tone="sun" badge="local" />
        <FeatureCard title="Privacidad" description="Tus recuerdos viven en este dispositivo." icon={<ShieldCheck size={24} />} tone="berry" badge="seguro" />
      </div>
    </section>
  );
}
