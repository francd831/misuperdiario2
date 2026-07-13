import { Lock, Search } from "lucide-react";
import { PageHeader } from "../../shared/ui/PageHeader";

export default function DiaryPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Diario"
        title="Tus recuerdos"
        description="Lista, filtros y busqueda de entradas por perfil."
      />

      <div className="toolbar-placeholder">
        <Search size={18} />
        <span>Buscar por titulo o texto</span>
      </div>

      <section className="empty-state">
        <Lock size={28} />
        <h2>Aun no hay entradas</h2>
        <p>Cuando creemos la persistencia local apareceran aqui textos, audios, videos y capsulas.</p>
      </section>
    </section>
  );
}
