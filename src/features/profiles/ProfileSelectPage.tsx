import { FormEvent, useState } from "react";
import { ShieldCheck, UserRoundPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { FeatureCard } from "../../shared/ui/FeatureCard";
import { PageHeader } from "../../shared/ui/PageHeader";

export default function ProfileSelectPage() {
  const navigate = useNavigate();
  const { children, login } = useProfiles();
  const [selectedId, setSelectedId] = useState(children[0]?.id ?? "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const ok = await login(selectedId, pin);
    if (!ok) {
      setError("PIN incorrecto.");
      setPin("");
      return;
    }

    navigate("/home");
  }

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Perfiles"
        title="Quien va a usar el diario?"
        description="Cada perfil tiene sus propios recuerdos, estrellas, packs y limites."
      />

      {children.length === 0 ? (
        <section className="empty-state">
          <UserRoundPlus size={32} />
          <h2>Aun no hay perfiles infantiles</h2>
          <p>Entra en administracion para crear el primer perfil.</p>
        </section>
      ) : (
        <form className="form-panel" onSubmit={handleSubmit}>
          <label>
            Perfil
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {children.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            PIN
            <input
              inputMode="numeric"
              maxLength={4}
              placeholder="4 digitos"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-action" type="submit" disabled={!selectedId}>
            Entrar
          </button>
        </form>
      )}

      <FeatureCard
        title="Acceso adulto"
        description="La administracion permite crear perfiles, configurar limites y hacer backups."
        icon={<ShieldCheck size={24} />}
        tone="sun"
      />
    </section>
  );
}
