import { FormEvent, useState } from "react";
import { DatabaseBackup, HardDrive, ShieldCheck, UsersRound } from "lucide-react";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { FeatureCard } from "../../shared/ui/FeatureCard";
import { PageHeader } from "../../shared/ui/PageHeader";

export default function AdminPage() {
  const { status, children, createAdmin, createChild } = useProfiles();
  const [adminName, setAdminName] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [childName, setChildName] = useState("");
  const [childPin, setChildPin] = useState("");
  const [message, setMessage] = useState("");

  async function handleCreateAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await createAdmin(adminName, adminPin);
      setAdminName("");
      setAdminPin("");
      setMessage("Administrador creado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo crear el administrador.");
    }
  }

  async function handleCreateChild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await createChild(childName, childPin);
      setChildName("");
      setChildPin("");
      setMessage("Perfil infantil creado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo crear el perfil.");
    }
  }

  if (status === "needs-admin") {
    return (
      <section className="page-stack page-stack--admin">
        <PageHeader
          eyebrow="Primer arranque"
          title="Crea el perfil administrador"
          description="Este PIN protege la zona adulta de Mi Super Diario."
        />

        <form className="form-panel" onSubmit={handleCreateAdmin}>
          <label>
            Nombre
            <input value={adminName} onChange={(event) => setAdminName(event.target.value)} required />
          </label>
          <label>
            PIN admin
            <input
              inputMode="numeric"
              maxLength={4}
              placeholder="4 digitos"
              type="password"
              value={adminPin}
              onChange={(event) => setAdminPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              required
            />
          </label>
          {message && <p className="form-error">{message}</p>}
          <button className="primary-action" type="submit">
            Crear administrador
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="page-stack page-stack--admin">
      <PageHeader
        eyebrow="Administracion"
        title="Control adulto"
        description="Perfiles, PIN admin, backups, limites y almacenamiento."
      />

      <form className="form-panel" onSubmit={handleCreateChild}>
        <h2>Crear perfil infantil</h2>
        <label>
          Nombre
          <input value={childName} onChange={(event) => setChildName(event.target.value)} required />
        </label>
        <label>
          PIN infantil
          <input
            inputMode="numeric"
            maxLength={4}
            placeholder="Opcional"
            type="password"
            value={childPin}
            onChange={(event) => setChildPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </label>
        {message && <p className="form-success">{message}</p>}
        <button className="primary-action" type="submit">
          Crear perfil
        </button>
      </form>

      <section className="status-panel">
        <h2>Perfiles infantiles</h2>
        <p>{children.length === 0 ? "Aun no hay perfiles." : `${children.length} perfil(es) creados.`}</p>
      </section>

      <div className="grid-two">
        <FeatureCard title="Perfiles" description="Crear, editar y restablecer PIN." icon={<UsersRound size={24} />} tone="mint" />
        <FeatureCard title="Seguridad" description="PIN hasheado y bloqueo por intentos." icon={<ShieldCheck size={24} />} tone="sky" />
        <FeatureCard title="Almacenamiento" description="Cuotas, calidad y limites diarios." icon={<HardDrive size={24} />} tone="sun" />
        <FeatureCard title="Backups" description="Exportar e importar todo el diario." icon={<DatabaseBackup size={24} />} tone="berry" />
      </div>
    </section>
  );
}
