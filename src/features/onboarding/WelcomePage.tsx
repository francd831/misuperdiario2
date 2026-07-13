import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <section className="welcome-screen">
      <div className="welcome-copy">
        <p className="eyebrow">Beta privada</p>
        <h1>Mi Super Diario</h1>
        <p>
          Un diario creativo y privado para guardar recuerdos con texto, voz,
          video, fotos, stickers y estrellas.
        </p>
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
        <span>Construido desde la especificacion de producto.</span>
      </div>
    </section>
  );
}
