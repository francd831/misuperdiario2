import { Camera, Gauge, HardDrive, Save, ShieldCheck, Timer } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useProfiles } from "../../core/profiles/ProfileContext";
import type { ProfileAvatarPreset } from "../../core/profiles/types";
import { FeatureCard } from "../../shared/ui/FeatureCard";
import { PageHeader } from "../../shared/ui/PageHeader";
import { ProfileAvatar, profileAvatarPresets } from "../../shared/ui/ProfileAvatar";

async function stopStream(stream?: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export default function SettingsPage() {
  const { activeProfile, updateProfile } = useProfiles();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [name, setName] = useState(activeProfile?.name ?? "");
  const [pin, setPin] = useState("");
  const [avatarPreset, setAvatarPreset] = useState<ProfileAvatarPreset>(activeProfile?.avatarPreset ?? "star");
  const [avatarPhotoDataUrl, setAvatarPhotoDataUrl] = useState<string | undefined>(activeProfile?.avatarPhotoDataUrl);
  const [cameraActive, setCameraActive] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeProfile) return;
    setName(activeProfile.name);
    setAvatarPreset(activeProfile.avatarPreset ?? "star");
    setAvatarPhotoDataUrl(activeProfile.avatarPhotoDataUrl);
  }, [activeProfile]);

  useEffect(() => {
    return () => {
      void stopStream(streamRef.current);
    };
  }, []);

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setError("No se pudo abrir la camara.");
    }
  }

  async function captureAvatarPhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;

    const sourceSize = Math.min(video.videoWidth, video.videoHeight);
    const sourceX = (video.videoWidth - sourceSize) / 2;
    const sourceY = (video.videoHeight - sourceSize) / 2;
    context.drawImage(video, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
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
    setError("");
    setMessage("");

    try {
      await updateProfile(activeProfile.id, {
        name,
        pin: pin || undefined,
        avatarPreset,
        avatarPhotoDataUrl,
      });
      setPin("");
      setMessage("Perfil actualizado.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar el perfil.");
    }
  }

  const previewProfile = activeProfile
    ? {
        ...activeProfile,
        name,
        avatarPreset,
        avatarPhotoDataUrl,
      }
    : undefined;

  return (
    <section className="page-stack settings-page">
      <PageHeader
        eyebrow="Mochila"
        title="Mochila segura"
        description="Aqui veras el estado de tu espacio. Los limites importantes los cuida un adulto."
        backTo="/home"
      />

      {activeProfile && previewProfile && (
        <form className="form-panel" onSubmit={handleSubmit}>
          <h2>Mi perfil</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <ProfileAvatar profile={previewProfile} className="player-avatar" size={34} />
            <label style={{ flex: "1 1 220px" }}>
              Nombre
              <input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} />
            </label>
            <label style={{ flex: "0 1 160px" }}>
              Nuevo PIN
              <input
                inputMode="numeric"
                maxLength={4}
                placeholder="4 digitos"
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              />
            </label>
          </div>

          <section>
            <h3>Icono</h3>
            <div className="sticker-tray" aria-label="Iconos predeterminados">
              {profileAvatarPresets.map(({ id, label, Icon }) => (
                <button key={id} type="button" className="sticker-button" aria-label={label} onClick={() => choosePreset(id)}>
                  <Icon size={30} />
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3>Foto de perfil</h3>
            {cameraActive && (
              <div className="media-preview" style={{ maxWidth: 260 }}>
                <video ref={videoRef} playsInline muted style={{ width: "100%", borderRadius: "1rem" }} />
              </div>
            )}
            <div className="actions-row">
              <button className="secondary-action" type="button" onClick={() => void startCamera()}>
                <Camera size={18} /> Abrir camara
              </button>
              <button className="secondary-action" type="button" disabled={!cameraActive} onClick={() => void captureAvatarPhoto()}>
                Sacar foto
              </button>
            </div>
          </section>

          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}

          <button className="primary-action" type="submit">
            <Save size={18} /> Guardar perfil
          </button>
        </form>
      )}

      <div className="grid-two">
        <FeatureCard title="Tiempo" description="Videos y audios tienen limites para cuidar el espacio." icon={<Timer size={24} />} tone="mint" badge="regla" />
        <FeatureCard title="Calidad" description="Fotos y videos se guardan con una calidad equilibrada." icon={<Gauge size={24} />} tone="sky" badge="media" />
        <FeatureCard title="Espacio" description="La app avisa antes de llenar el dispositivo." icon={<HardDrive size={24} />} tone="sun" badge="local" />
        <FeatureCard title="Privacidad" description="Tus recuerdos viven en este dispositivo." icon={<ShieldCheck size={24} />} tone="berry" badge="seguro" />
      </div>
    </section>
  );
}
