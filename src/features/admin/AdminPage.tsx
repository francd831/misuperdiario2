import { DatabaseBackup, HardDrive, ShieldCheck, UsersRound } from "lucide-react";
import { FeatureCard } from "../../shared/ui/FeatureCard";
import { PageHeader } from "../../shared/ui/PageHeader";

export default function AdminPage() {
  return (
    <section className="page-stack page-stack--admin">
      <PageHeader
        eyebrow="Administracion"
        title="Control adulto"
        description="Aqui viviran perfiles, PIN admin, backups, limites y almacenamiento."
      />

      <div className="grid-two">
        <FeatureCard title="Perfiles" description="Crear, editar y restablecer PIN." icon={<UsersRound size={24} />} tone="mint" />
        <FeatureCard title="Seguridad" description="PIN hasheado y bloqueo por intentos." icon={<ShieldCheck size={24} />} tone="sky" />
        <FeatureCard title="Almacenamiento" description="Cuotas, calidad y limites diarios." icon={<HardDrive size={24} />} tone="sun" />
        <FeatureCard title="Backups" description="Exportar e importar todo el diario." icon={<DatabaseBackup size={24} />} tone="berry" />
      </div>
    </section>
  );
}
