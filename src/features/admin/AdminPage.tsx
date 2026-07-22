import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ArrowLeft, DatabaseBackup, Delete, HardDrive, LockKeyhole, Pencil, Save, ShieldCheck, Trash2, UserPlus, UsersRound, X } from "lucide-react";
import { Link } from "react-router-dom";
import adultStudyBackground from "../../assets/profiles/adult-family-study.png";
import { backupService } from "../../core/backups/backupService";
import { profileService } from "../../core/profiles/profileService";
import { useProfiles } from "../../core/profiles/ProfileContext";
import type { Profile, StoragePolicy } from "../../core/profiles/types";
import { storagePolicyRepository } from "../../core/settings/storagePolicyRepository";
import { estimateStorageUsage, formatBytes, type StorageUsageSummary } from "../../core/storage/storageUsage";

export default function AdminPage() {
  const { status, children, createAdmin, createChild, updateProfile, deleteChild, refresh } = useProfiles();
  const [admin, setAdmin] = useState<Profile>();
  const [unlocked, setUnlocked] = useState(false);
  const [accessPin, setAccessPin] = useState("");
  const [accessError, setAccessError] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [childName, setChildName] = useState("");
  const [childPin, setChildPin] = useState("");
  const [editingId, setEditingId] = useState<string>();
  const [editName, setEditName] = useState("");
  const [editPin, setEditPin] = useState("");
  const [currentAdminPin, setCurrentAdminPin] = useState("");
  const [newAdminPin, setNewAdminPin] = useState("");
  const [message, setMessage] = useState("");
  const [backupMessage, setBackupMessage] = useState("");
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupMessageTone, setBackupMessageTone] = useState<"success" | "error">("success");
  const [policy, setPolicy] = useState<StoragePolicy | null>(null);
  const [usage, setUsage] = useState<StorageUsageSummary | null>(null);
  const [totalLimitGb, setTotalLimitGb] = useState("1");
  const [profileLimitMb, setProfileLimitMb] = useState("300");
  const studyStyle = { "--adult-study-background": `url(${adultStudyBackground})` } as React.CSSProperties;

  async function refreshStorage() {
    const [nextPolicy, nextUsage] = await Promise.all([storagePolicyRepository.get(), estimateStorageUsage()]);
    setPolicy(nextPolicy); setUsage(nextUsage);
    setTotalLimitGb((nextPolicy.maxTotalStorageBytes / 1024 ** 3).toFixed(1).replace(".0", ""));
    setProfileLimitMb(Math.round(nextPolicy.maxProfileStorageBytes / 1024 ** 2).toString());
  }

  useEffect(() => { void Promise.all([refreshStorage(), profileService.bootstrapState().then((state) => setAdmin(state.admin))]); }, []);

  async function handleUnlock(event: FormEvent) {
    event.preventDefault(); setAccessError("");
    if (!admin || !(await profileService.verifyProfilePin(admin.id, accessPin))) { setAccessError("El PIN no es correcto."); setAccessPin(""); return; }
    setUnlocked(true); setAccessPin("");
  }

  function addAccessDigit(digit: string) {
    setAccessError("");
    setAccessPin((value) => `${value}${digit}`.slice(0, 4));
  }

  async function handleCreateAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    try { await createAdmin(adminName, adminPin); const state = await profileService.bootstrapState(); setAdmin(state.admin); setUnlocked(true); setMessage("Administrador creado."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo crear el administrador."); }
  }

  async function handleCreateChild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    try { await createChild(childName, childPin); setChildName(""); setChildPin(""); setMessage("Perfil creado."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo crear el perfil."); }
  }

  function startEditing(profile: Profile) { setEditingId(profile.id); setEditName(profile.name); setEditPin(""); setMessage(""); }

  async function saveProfile(profile: Profile) {
    try { await updateProfile(profile.id, { name: editName, pin: editPin || undefined }); setEditingId(undefined); setMessage("Perfil actualizado."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo actualizar el perfil."); }
  }

  async function removeProfile(profile: Profile) {
    if (!window.confirm(`Eliminar el perfil de ${profile.name} y todos sus recuerdos guardados? Esta acción no se puede deshacer.`)) return;
    try { await deleteChild(profile.id); setMessage(`Perfil de ${profile.name} eliminado.`); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo eliminar el perfil."); }
  }

  async function saveStorage(event: FormEvent) {
    event.preventDefault(); if (!policy) return;
    const total = Number(totalLimitGb); const perProfile = Number(profileLimitMb);
    if (total <= 0 || perProfile <= 0) { setMessage("Los límites deben ser mayores que cero."); return; }
    await storagePolicyRepository.save({ ...policy, maxTotalStorageBytes: Math.round(total * 1024 ** 3), maxProfileStorageBytes: Math.round(perProfile * 1024 ** 2) });
    await refreshStorage(); setMessage("Límites de almacenamiento actualizados.");
  }

  async function changeAdminPin(event: FormEvent) {
    event.preventDefault(); setMessage("");
    try { await profileService.changeAdminPin(currentAdminPin, newAdminPin); setCurrentAdminPin(""); setNewAdminPin(""); setMessage("PIN de adulto actualizado."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo cambiar el PIN."); }
  }

  async function handleExportBackup() {
    setBackupBusy(true); setBackupMessage("");
    try { const blob = await backupService.createBackupBlob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = backupService.makeFilename(); link.click(); URL.revokeObjectURL(url); setBackupMessageTone("success"); setBackupMessage("Backup exportado."); }
    catch (error) { setBackupMessageTone("error"); setBackupMessage(error instanceof Error ? error.message : "No se pudo exportar el backup."); }
    finally { setBackupBusy(false); }
  }

  async function handleImportBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    if (!window.confirm("Importar este backup reemplazará los datos locales actuales. ¿Continuar?")) return;
    setBackupBusy(true); setBackupMessage("");
    try { const result = await backupService.importBackup(file); await Promise.all([refresh(), refreshStorage()]); setBackupMessageTone("success"); setBackupMessage(`Backup importado: ${result.counts.profiles} perfiles, ${result.counts.entries} entradas y ${result.counts.dailyPhotos} fotos.`); }
    catch (error) { setBackupMessageTone("error"); setBackupMessage(error instanceof Error ? error.message : "No se pudo importar el backup."); }
    finally { setBackupBusy(false); }
  }

  const Header = ({ title = "Control familiar" }: { title?: string }) => <header className="adult-study__header"><Link className="adult-study__back" to="/profiles" aria-label="Volver"><ArrowLeft size={20} /></Link><div><span>Zona de adultos</span><h1>{title}</h1></div><ShieldCheck size={30} aria-hidden="true" /></header>;

  if (status === "needs-admin") return <main className="adult-study" style={studyStyle}><section className="adult-study__board adult-study__board--setup"><Header title="Configurar familia" /><form className="adult-study__panel adult-study__form adult-study__access-form" onSubmit={handleCreateAdmin}><h2>Crear acceso adulto</h2><label>Nombre<input value={adminName} onChange={(e) => setAdminName(e.target.value)} required /></label><label>PIN adulto<input inputMode="numeric" maxLength={4} type="password" value={adminPin} onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, "").slice(0, 4))} required /></label>{message && <p className="form-error">{message}</p>}<button className="adult-study__primary" type="submit">Crear administrador</button></form></section></main>;

  if (!unlocked) return <main className="adult-study" style={studyStyle}><section className="adult-study__board adult-study__board--locked"><form className="adult-study__access-form" onSubmit={handleUnlock}><div className="adult-study__access-main"><Link className="adult-study__access-back" to="/profiles" aria-label="Volver"><ArrowLeft size={21} /></Link><LockKeyhole size={40} aria-hidden="true" /><h2>Introduce tu PIN</h2><input aria-label="PIN de adulto" autoFocus inputMode="numeric" maxLength={4} placeholder="••••" type="password" value={accessPin} onChange={(e) => setAccessPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />{accessError && <p className="form-error" role="alert">{accessError}</p>}<button className="adult-study__primary" disabled={accessPin.length !== 4} type="submit">Entrar</button></div><div className="adult-study__keypad" aria-label="Teclado numérico">{["1","2","3","4","5","6","7","8","9"].map((digit) => <button key={digit} type="button" onClick={() => addAccessDigit(digit)}>{digit}</button>)}<button type="button" aria-label="Borrar todo" onClick={() => setAccessPin("")}><X /></button><button type="button" onClick={() => addAccessDigit("0")}>0</button><button type="button" aria-label="Borrar último número" onClick={() => setAccessPin((value) => value.slice(0, -1))}><Delete /></button></div></form></section></main>;

  return <main className="adult-study" style={studyStyle}><section className="adult-study__board adult-study__board--expanded"><Header /><div className="adult-study__content adult-study__content--expanded">
    <section className="adult-study__panel adult-study__profiles"><div className="adult-study__panel-title"><UsersRound size={21} /><h2>Perfiles infantiles</h2><span>{children.length}</span></div><div className="adult-study__profile-list">{children.length === 0 ? <p>Aún no hay perfiles.</p> : children.map((profile) => <article className="adult-study__profile-row" key={profile.id}>{editingId === profile.id ? <><div className="adult-study__edit-fields"><label>Nombre<input value={editName} onChange={(e) => setEditName(e.target.value)} /></label><label>Nuevo PIN<input inputMode="numeric" maxLength={4} placeholder="Sin cambios" type="password" value={editPin} onChange={(e) => setEditPin(e.target.value.replace(/\D/g, "").slice(0, 4))} /></label></div><div className="adult-study__row-actions"><button className="adult-study__icon" type="button" aria-label="Guardar perfil" onClick={() => void saveProfile(profile)}><Save /></button><button className="adult-study__icon" type="button" aria-label="Cancelar" onClick={() => setEditingId(undefined)}><X /></button></div></> : <><div><strong>{profile.name}</strong><small>{profile.pinHash ? "Con PIN" : "Sin PIN"} · Pack {profile.activePackId}</small></div><div className="adult-study__row-actions"><button className="adult-study__icon" type="button" aria-label={`Editar ${profile.name}`} onClick={() => startEditing(profile)}><Pencil /></button><button className="adult-study__icon adult-study__icon--danger" type="button" aria-label={`Eliminar ${profile.name}`} onClick={() => void removeProfile(profile)}><Trash2 /></button></div></>}</article>)}</div></section>
    <form className="adult-study__panel adult-study__form" onSubmit={handleCreateChild}><div className="adult-study__panel-title"><UserPlus size={21} /><h2>Nuevo perfil</h2></div><label>Nombre<input value={childName} onChange={(e) => setChildName(e.target.value)} required /></label><label>PIN infantil<input inputMode="numeric" maxLength={4} placeholder="Opcional" type="password" value={childPin} onChange={(e) => setChildPin(e.target.value.replace(/\D/g, "").slice(0, 4))} /></label><button className="adult-study__primary" type="submit">Crear perfil</button></form>
    <form className="adult-study__panel adult-study__storage" onSubmit={saveStorage}><div className="adult-study__panel-title"><HardDrive size={21} /><h2>Almacenamiento</h2></div><p>Usado: {usage ? formatBytes(usage.totalBytes) : "-"}</p><div className="adult-study__limits"><label>Límite total (GB)<input min="0.1" step="0.1" type="number" value={totalLimitGb} onChange={(e) => setTotalLimitGb(e.target.value)} /></label><label>Por perfil (MB)<input min="50" step="50" type="number" value={profileLimitMb} onChange={(e) => setProfileLimitMb(e.target.value)} /></label></div><button className="adult-study__secondary" type="submit">Guardar límites</button></form>
    <form className="adult-study__panel adult-study__security" onSubmit={changeAdminPin}><div className="adult-study__panel-title"><LockKeyhole size={21} /><h2>PIN de adulto</h2></div><div className="adult-study__limits"><label>PIN actual<input inputMode="numeric" maxLength={4} type="password" value={currentAdminPin} onChange={(e) => setCurrentAdminPin(e.target.value.replace(/\D/g, "").slice(0, 4))} /></label><label>Nuevo PIN<input inputMode="numeric" maxLength={4} type="password" value={newAdminPin} onChange={(e) => setNewAdminPin(e.target.value.replace(/\D/g, "").slice(0, 4))} /></label></div><button className="adult-study__secondary" disabled={currentAdminPin.length !== 4 || newAdminPin.length !== 4} type="submit">Cambiar PIN</button></form>
    <section className="adult-study__panel adult-study__backup"><div className="adult-study__panel-title"><DatabaseBackup size={21} /><h2>Copias de seguridad</h2></div><p>Guarda o recupera todos los recuerdos y ajustes.</p>{backupMessage && <p className={backupMessageTone === "success" ? "form-success" : "form-error"}>{backupMessage}</p>}<div className="inline-actions"><button className="adult-study__primary" type="button" disabled={backupBusy} onClick={() => void handleExportBackup()}>Exportar</button><label className="adult-study__secondary adult-study__file">Importar<input accept=".zip,application/zip" disabled={backupBusy} type="file" onChange={(e) => void handleImportBackup(e)} /></label></div></section>
    {message && <p className="adult-study__notice" role="status">{message}</p>}
  </div></section></main>;
}
