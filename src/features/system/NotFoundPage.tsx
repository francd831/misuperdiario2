import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="empty-state">
      <h1>Pagina no encontrada</h1>
      <p>Esta ruta no existe en Mi Super Diario.</p>
      <Link className="primary-action" to="/home">
        Volver al inicio
      </Link>
    </section>
  );
}
