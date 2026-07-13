import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { DatabaseBackup, HardDrive, ShieldCheck, UsersRound } from "lucide-react";
import { backupService } from "../../core/backups/backupService";
import { useProfiles } from "../../core/profiles/ProfileContext";
import { storagePolicyRepository } from "../../core/settings/storagePolicyRepository";
import type { StoragePolicy } from "../../core/profiles/types";
import { estimateStorageUsage, formatBytes, type StorageUsageSummary } from "../../core/storage/storageUsage";
import { FeatureCard } from "../../shared/ui/FeatureCard";
import { PageHeader } from "../../shared/ui/PageHeader";

export default function AdminPage() {
  const { status, children, createAdmin, createChild, refresh } = useProfiles();
  const [adminName, setAdminName] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [childName, setChildName] = useState("");
  const [childPin, setChildPin] = useState("");
  const [message, setMessage] = useState("");
  const [backupMessage, setBackupMessage] = useState("");
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupMessageTone, setBackupMessageTone] = useState<"success" | "error">("success");
  const [policy, setPolicy] = useState<StoragePolicy | null>(null);
  const [usage, setUsage] = useState<StorageUsageSummary | null>(null);

  async function refreshStorage() {
    const [nextPolicy, nextUsage] = await Promise.all([storagePolicyRepository.get(), estimateStorageUsage()]);
    setPolicy(nextPolicy);
    setUsage(nextUsage);
  }

  useEffect(() => {
    void refreshStorage();
  }, []);

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

  async function handleExportBackup() {
    setBackupBusy(true);
    setBackupMessage("");
    try {
      const blob = await backupService.createBackupBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = backupService.makeFilename();
      link.click();
      URL.revokeObjectURL(url);
      setBackupMessageTone("success");
      setBackupMessage("Backup exportado.");
    } catch (error) {
      setBackupMessageTone("error");
      setBackupMessage(error instanceof Error ? error.message : "No se pudo exportar el backup.");
    } finally {
      setBackupBusy(false);
    }
  }

  async function handleImportBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!window.confirm("Importar este backup reemplazara los datos locales actuales de Mi Super Diario. Continuar?")) {
      return;
    }

    setBackupBusy(true);
    setBackupMessage("");
    try {
      const result = await backupService.importBackup(file);
      await Promise.all([refresh(), refreshStorage()]);
      setBackupMessageTone("success");
      setBackupMessage(
        `Backup importado: ${result.counts.profiles} perfiles, ${result.counts.entries} entradas y ${result.counts.dailyPhotos} fotos.`,
      );
    } catch (error) {
      setBackupMessageTone("error");
      setBackupMessage(error instanceof Error ? error.message : "No se pudo importar el backup.");
    } finally {
      setBackupBusy(false);
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

      <section className="status-panel">
        <h2>Almacenamiento local</h2>
        <p>
          Usado: {usage ? formatBytes(usage.totalBytes) : "-"} de {policy ? formatBytes(policy.maxTotalStorageBytes) : "-"}.
        </p>
        <p>
          Entradas: {usage ? formatBytes(usage.entriesBytes) : "-"} · Fotos: {usage ? formatBytes(usage.dailyPhotosBytes) : "-"}.
        </p>
        <button className="secondary-action" type="button" onClick={() => void refreshStorage()}>
          Actualizar uso
        </button>
      </section>

      <section className="status-panel">
        <h2>Backups</h2>
        <p>Exporta perfiles, entradas, fotos, stickers aplicados, packs comprados, estrellas y logros.</p>
        {backupMessage && <p className={backupMessageTone === "success" ? "form-success" : "form-error"}>{backupMessage}</p>}
        <div className="inline-actions">
          <button className="primary-action" type="button" disabled={backupBusy} onClick={() => void handleExportBackup()}>
            Exportar backup
          </button>
          <label className="secondary-action secondary-action--file">
            Importar backup
            <input accept=".zip,application/zip" disabled={backupBusy} type="file" onChange={(event) => void handleImportBackup(event)} />
          </label>
        </div>
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
