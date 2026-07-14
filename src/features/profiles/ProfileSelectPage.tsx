import { FormEvent, useState } from "react";
import { ArrowRight, ShieldCheck, UserRoundPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { FeatureCard } from "../../shared/ui/FeatureCard";
import { PageHeader } from "../../shared/ui/PageHeader";
import { ProfileAvatar } from "../../shared/ui/ProfileAvatar";

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
    <section className="page-stack profiles-page">
      <PageHeader
        eyebrow="Perfiles"
        title="Elige jugador"
        description="Cada jugador tiene sus recuerdos, estrellas y packs."
        backTo="/"
      />

      {children.length === 0 ? (
        <section className="empty-state">
          <UserRoundPlus size={32} />
          <h2>Aun no hay perfiles infantiles</h2>
          <p>Entra en administracion para crear el primer perfil.</p>
        </section>
      ) : (
        <form className="form-panel profile-login" onSubmit={handleSubmit}>
          <div className="profile-player-grid" role="list" aria-label="Perfiles infantiles">
            {children.map((profile, index) => {
              const selected = selectedId === profile.id;
              return (
                <button
                  key={profile.id}
                  type="button"
                  className={`player-card ${selected ? "player-card--selected" : ""}`}
                  onClick={() => setSelectedId(profile.id)}
                >
                  <ProfileAvatar profile={profile} className="player-card__avatar" />
                  <span className="player-card__name">{profile.name}</span>
                  <span className="player-card__level">Nivel {index + 1}</span>
                </button>
              );
            })}
          </div>

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
            Entrar <ArrowRight aria-hidden="true" size={18} />
          </button>
        </form>
      )}

      <Link className="card-link" to="/admin">
        <FeatureCard
          title="Acceso adulto"
          description="La administracion permite crear perfiles, configurar limites y hacer backups."
          icon={<ShieldCheck size={24} />}
          tone="sun"
          badge="admin"
        />
      </Link>
    </section>
  );
}
