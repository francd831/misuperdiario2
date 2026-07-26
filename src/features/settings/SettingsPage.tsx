import { ArrowLeft, Camera, Check, KeyRound, Save, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { MASCOT_VISIBILITY_EVENT, MASCOT_VISIBILITY_KEY } from "../../app/mascot/FloatingMascot";
import { getPackSceneBackgrounds } from "../../core/packs/sceneBackgrounds";
import { useProfiles } from "../../core/profiles/ProfileContext";
import type { ProfileAvatarPreset } from "../../core/profiles/types";
import { ProfileAvatar, profileAvatarPresets } from "../../shared/ui/ProfileAvatar";
import { useRemotePacks } from "../../core/packs/RemotePackContext";

async function stopStream(stream?: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function themeColor(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  return value.includes("(") || value.startsWith("#") ? value : `hsl(${value})`;
}

export default function SettingsPage() {
  const { activeProfile, updateProfile } = useProfiles();
  const { getPack, getResources } = useRemotePacks();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [name, setName] = useState(activeProfile?.name ?? "");
  const [pin, setPin] = useState("");
  const [pinEnabled, setPinEnabled] = useState(Boolean(activeProfile?.pinHash));
  const [avatarPreset, setAvatarPreset] = useState<ProfileAvatarPreset>(activeProfile?.avatarPreset ?? "star");
  const [avatarPhotoDataUrl, setAvatarPhotoDataUrl] = useState<string | undefined>(activeProfile?.avatarPhotoDataUrl);
  const [cameraActive, setCameraActive] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mascotVisible, setMascotVisible] = useState(() => localStorage.getItem(MASCOT_VISIBILITY_KEY) !== "false");

  const activePack = getPack(activeProfile?.activePackId);
  const packName = activePack?.manifest.name ?? "Básico";
  const packTheme = activePack?.manifest.theme;
  const settingsForeground = activePack?.manifest.id === "espacio"
    ? "hsl(226 45% 20%)"
    : themeColor(packTheme?.foreground, "hsl(270 24% 20%)");
  const packDecorations = (activePack?.stickers.length ? activePack.stickers : activePack?.stamps ?? []).slice(0, 3);
  const settingsStyle = {
    "--settings-primary": themeColor(packTheme?.primary, "hsl(265 75% 60%)"),
    "--settings-secondary": themeColor(packTheme?.secondary, "hsl(40 85% 58%)"),
    "--settings-accent": themeColor(packTheme?.accent, "hsl(170 65% 48%)"),
    "--settings-background": themeColor(packTheme?.background, "hsl(40 33% 98%)"),
    "--settings-foreground": settingsForeground,
    "--settings-preview": activePack?.previewUrl ? `url(${activePack.previewUrl})` : "none",
    "--settings-scene": getPackSceneBackgrounds(activePack?.manifest.id, getResources(activePack?.manifest.id).scenes).settings
      ? `url(${getPackSceneBackgrounds(activePack?.manifest.id, getResources(activePack?.manifest.id).scenes).settings})`
      : "none",
  } as React.CSSProperties;

  useEffect(() => {
    if (!activeProfile) return;
    setName(activeProfile.name);
    setAvatarPreset(activeProfile.avatarPreset ?? "star");
    setAvatarPhotoDataUrl(activeProfile.avatarPhotoDataUrl);
    setPinEnabled(Boolean(activeProfile.pinHash));
  }, [activeProfile]);

  useEffect(() => () => { void stopStream(streamRef.current); }, []);

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        void videoRef.current.play();
      });
    } catch {
      setError("No se pudo abrir la cámara.");
    }
  }

  async function captureAvatarPhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;
    const sourceSize = Math.min(video.videoWidth, video.videoHeight);
    context.drawImage(video, (video.videoWidth - sourceSize) / 2, (video.videoHeight - sourceSize) / 2, sourceSize, sourceSize, 0, 0, size, size);
    setAvatarPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.78));
    await stopStream(streamRef.current);
    streamRef.current = null;
    setCameraActive(false);
  }

  function choosePreset(nextPreset: ProfileAvatarPreset) {
    setAvatarPreset(nextPreset);
    setAvatarPhotoDataUrl(undefined);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeProfile) return;
    setError(""); setMessage("");
    try {
      if (pinEnabled && !activeProfile.pinHash && pin.length !== 4) {
        throw new Error("Escribe un PIN de 4 dígitos para activarlo.");
      }
      await updateProfile(activeProfile.id, {
        name,
        pin: pinEnabled ? pin || undefined : undefined,
        removePin: !pinEnabled,
        avatarPreset,
        avatarPhotoDataUrl,
      });
      setPin(""); setMessage("Perfil actualizado.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar el perfil.");
    }
  }

  const previewProfile = activeProfile ? { ...activeProfile, name, avatarPreset, avatarPhotoDataUrl } : undefined;

  if (!activeProfile) return <Navigate to="/profiles" replace />;

  return (
    <section className="world-settings" data-pack={activeProfile?.activePackId ?? "base"} style={settingsStyle}>
      <div className="world-settings__ambient" aria-hidden="true" />
      {packDecorations.map((asset, index) => <img className={`world-settings__decoration world-settings__decoration--${index + 1}`} key={asset.id} src={asset.url} alt="" aria-hidden="true" />)}

      <header className="world-settings__header">
        <Link to="/home" className="world-settings__back" aria-label="Volver a la habitación"><ArrowLeft /></Link>
        <div><span>Mi espacio</span><h1>Ajustes</h1></div>
        <div className="world-settings__pack"><Sparkles /><span>Mundo</span><strong>{packName}</strong></div>
      </header>

      {activeProfile && previewProfile && (
        <form className="world-settings__console" onSubmit={handleSubmit}>
          <section className="world-settings__identity">
            <div className="world-settings__avatar-stage">
              {cameraActive ? <video ref={videoRef} playsInline muted /> : <ProfileAvatar profile={previewProfile} className="world-settings__avatar" size={52} />}
              <button type="button" aria-label="Abrir cámara" onClick={() => void startCamera()}><Camera /></button>
            </div>
            <div className="world-settings__identity-copy"><span>Este soy yo</span><strong>{name || "Mi perfil"}</strong></div>
            <div className="world-settings__avatar-picker" aria-label="Elegir icono">
              {profileAvatarPresets.map(({ id, label, Icon }) => <button key={id} type="button" className={avatarPreset === id && !avatarPhotoDataUrl ? "is-selected" : ""} aria-label={label} onClick={() => choosePreset(id)}><Icon /><Check /></button>)}
            </div>
            {cameraActive && <button className="world-settings__capture" type="button" onClick={() => void captureAvatarPhoto()}><Camera /> Usar esta foto</button>}
          </section>

          <section className="world-settings__controls">
            <div className="world-settings__section-title"><UserRound /><div><span>Perfil</span><h2>Tu identidad</h2></div></div>
            <div className="world-settings__fields">
              <label><span>Nombre</span><input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} /></label>
              {pinEnabled && <label><span>{activeProfile.pinHash ? "Cambiar PIN" : "Crear PIN"}</span><div className="world-settings__pin"><KeyRound /><input inputMode="numeric" maxLength={4} placeholder="4 dígitos" type="password" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} /></div></label>}
            </div>
            <div className="world-settings__mascot-row world-settings__pin-row">
              <div><ShieldCheck /><span><strong>Pedir PIN para entrar</strong><small>{pinEnabled ? "Protege el acceso a este perfil" : "Entrada directa desde su puerta"}</small></span></div>
              <label className="world-settings__switch"><input type="checkbox" checked={pinEnabled} onChange={(event) => { setPinEnabled(event.target.checked); if (!event.target.checked) setPin(""); }} /><span /></label>
            </div>
            <div className="world-settings__mascot-row">
              <div><Sparkles /><span><strong>Mascota del mundo</strong><small>Te acompaña por la habitación</small></span></div>
              <label className="world-settings__switch"><input type="checkbox" checked={mascotVisible} onChange={(event) => { const next = event.target.checked; setMascotVisible(next); localStorage.setItem(MASCOT_VISIBILITY_KEY, String(next)); window.dispatchEvent(new Event(MASCOT_VISIBILITY_EVENT)); }} /><span /></label>
            </div>
            <div className="world-settings__privacy"><ShieldCheck /><span><strong>Recuerdos protegidos</strong><small>Se guardan en este dispositivo</small></span></div>
            {error && <p className="form-error">{error}</p>}
            {message && <p className="form-success">{message}</p>}
            <button className="world-settings__save" type="submit"><Save /> Guardar cambios</button>
          </section>
        </form>
      )}
    </section>
  );
}
