import { ArrowRight, Camera, Mic, PenLine, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <section className="welcome-screen">
      <div className="welcome-hero">
        <div className="welcome-copy">
          <p className="eyebrow">Beta privada</p>
          <h1>Mi Super Diario</h1>
          <p>
            Un lugar privado para guardar recuerdos con voz, fotos, videos,
            stickers y pequenas recompensas.
          </p>
        </div>

        <div className="memory-orbit" aria-hidden="true">
          <span><PenLine size={28} /></span>
          <span><Camera size={30} /></span>
          <span><Mic size={28} /></span>
          <span><Star size={30} /></span>
        </div>
      </div>

      <div className="welcome-actions">
        <Link className="primary-action" to="/profiles">
          Empezar <ArrowRight aria-hidden="true" size={20} />
        </Link>
        <Link className="secondary-action" to="/admin">
          <ShieldCheck aria-hidden="true" size={18} /> Administracion
        </Link>
      </div>

      <div className="welcome-note">
        <Sparkles aria-hidden="true" size={18} />
        <span>Diario local, privado y pensado para beta familiar.</span>
      </div>
    </section>
  );
}
