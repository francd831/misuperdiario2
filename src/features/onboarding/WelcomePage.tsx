import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import actionPhoto from "../../assets/home/action-photo.webp";
import actionWrite from "../../assets/home/action-write.webp";

export default function WelcomePage() {
  return (
    <section className="welcome-screen">
      <div className="welcome-hero">
        <div className="welcome-copy">
          <p className="welcome-kicker">Tus recuerdos, solo tuyos</p>
          <h1>Mi Super Diario</h1>
          <p>
            Guarda lo que viviste con palabras, voz, fotos y vídeo.
          </p>
        </div>

        <div className="welcome-memory-preview" aria-label="Ejemplos de recuerdos que puedes crear">
          <figure className="welcome-memory-card welcome-memory-card--photo">
            <img src={actionPhoto} alt="Crear un recuerdo con una foto" />
          </figure>
          <figure className="welcome-memory-card welcome-memory-card--write">
            <img src={actionWrite} alt="Escribir un recuerdo personal" />
          </figure>
        </div>
      </div>

      <div className="welcome-actions">
        <Link className="primary-action" to="/profiles">
          Entrar en mi diario <ArrowRight aria-hidden="true" size={20} />
        </Link>
      </div>

      <Link className="welcome-admin-link" to="/admin">
        <ShieldCheck aria-hidden="true" size={17} /> Administración familiar
      </Link>
    </section>
  );
}
