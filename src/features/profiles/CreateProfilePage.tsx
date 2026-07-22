import { FormEvent, useState } from "react";
import { ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import creativeRoom from "../../assets/home/giant-creative-room-world-v4.png";
import profileWorkshop from "../../assets/profiles/profile-workshop-base.png";
import baseDoor from "../../assets/profiles/doors/door-base.png";
import { useProfiles } from "../../core/profiles/ProfileContext";

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const { createChild } = useProfiles();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setError("Escribe un nombre de al menos 2 letras.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await createChild(cleanName, pin || undefined);
      navigate("/profiles", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo crear el perfil.");
      setSaving(false);
    }
  }

  return (
    <section className="profile-create" aria-labelledby="profile-create-title">
      <div className="profile-create__backdrop" style={{ backgroundImage: `url(${creativeRoom})` }} aria-hidden="true" />
      <div className="profile-create__room" style={{ backgroundImage: `url(${profileWorkshop})` }}>
        <header className="profile-create__sign">
          <Link to="/profiles" aria-label="Volver a las puertas">
            <ArrowLeft aria-hidden="true" />
          </Link>
          <h1 id="profile-create-title">Prepara tu puerta</h1>
        </header>

        <form className="profile-create__workbench" onSubmit={handleSubmit}>
          <div className="profile-create__door-preview" aria-label="Vista previa de la nueva puerta">
            <img src={baseDoor} alt="" aria-hidden="true" />
            <strong>{name.trim() || "Tu nombre"}</strong>
            <span className="profile-create__door-glow" aria-hidden="true" />
          </div>

          <div className="profile-create__board">
            <div className="profile-create__board-pin" aria-hidden="true" />
            <label className="profile-create__field profile-create__field--name">
              <span>¿Cómo te llamas?</span>
              <input
                autoFocus
                autoComplete="nickname"
                maxLength={18}
                placeholder="Escribe tu nombre"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label className="profile-create__field profile-create__field--pin">
              <span><KeyRound size={18} aria-hidden="true" /> PIN secreto <small>(opcional)</small></span>
              <input
                aria-describedby="profile-pin-help"
                inputMode="numeric"
                maxLength={4}
                placeholder="• • • •"
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              />
            </label>
            <p id="profile-pin-help" className="profile-create__hint">Si lo dejas vacío, podrás entrar directamente.</p>

            {error && <p className="profile-create__error" role="alert">{error}</p>}

            <button className="profile-create__submit" type="submit" disabled={saving}>
              <Sparkles aria-hidden="true" />
              {saving ? "Preparando..." : "Colocar mi puerta"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
