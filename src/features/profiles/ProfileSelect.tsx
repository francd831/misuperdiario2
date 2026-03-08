import { useState, useEffect, useCallback } from "react";
import { profileService } from "@/core/auth/profileService";
import { useProfile } from "@/core/auth/ProfileContext";
import type { Profile } from "@/core/storage/repositories/profileRepository";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Shield, ArrowLeft, UserPlus } from "lucide-react";
import ShaderAnimation from "@/components/ui/shader-animation";
import { ProfileAvatar } from "./ProfileAvatar";

type CreateStep = "name" | "pin" | "confirm";

export function ProfileSelect() {
  const { login, refresh, createProfile } = useProfile();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [adminPinMode, setAdminPinMode] = useState(false);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);

  // Create profile state
  const [creating, setCreating] = useState(false);
  const [createStep, setCreateStep] = useState<CreateStep>("name");
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [createError, setCreateError] = useState("");

  const loadProfiles = useCallback(() => {
    profileService.getVisibleProfiles().then(setProfiles);
    profileService.getAdminProfile().then((a) => setAdminProfile(a ?? null));
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      if (Date.now() >= lockedUntil) { setLockedUntil(null); setAttempts(0); setError(""); }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const verify = useCallback(async (value: string, profileId: string) => {
    if (value.length < 4 || lockedUntil) return;
    const ok = await profileService.verifyPin(profileId, value);
    if (ok) {
      login(profileId);
    } else {
      const n = attempts + 1;
      setAttempts(n);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      if (n >= 5) {
        setLockedUntil(Date.now() + 30000);
        setError("Espera 30 segundos.");
      } else {
        setError(`PIN incorrecto (${n}/5)`);
      }
      setPin("");
    }
  }, [attempts, lockedUntil, login]);

  const resetCreate = () => {
    setCreating(false);
    setCreateStep("name");
    setNewName("");
    setNewPin("");
    setConfirmPin("");
    setCreateError("");
  };

  const normalizePin = (value: string) => value.replace(/\D/g, "").slice(0, 4);

  const handleCreateNext = async () => {
    if (createStep === "name") {
      if (newName.trim().length < 2) { setCreateError("Mínimo 2 caracteres"); return; }
      setCreateError("");
      setCreateStep("pin");
    } else if (createStep === "pin") {
      if (normalizePin(newPin).length < 4) return;
      setCreateError("");
      setCreateStep("confirm");
    }
  };

  const remaining = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  // Create new profile flow
  if (creating) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6">
        <div className="absolute inset-0 -z-10"><ShaderAnimation /></div>
        <Button variant="ghost" size="icon" className="absolute left-4 top-4 text-white" onClick={resetCreate}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <UserPlus className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Nuevo perfil</h1>

        {createStep === "name" && (
          <>
            <p className="text-sm text-white/70">¿Cómo te llamas?</p>
            <Input
              placeholder="Tu nombre"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setCreateError(""); }}
              className="max-w-xs text-center text-lg"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateNext()}
            />
          </>
        )}

        {createStep === "pin" && (
          <>
            <p className="text-sm text-white/70">Crea un PIN de 4 dígitos</p>
            <InputOTP maxLength={4} value={newPin} onChange={(v) => { const normalized = normalizePin(v); setNewPin(normalized); setCreateError(""); if (normalized.length === 4) { setCreateStep("confirm"); } }}>
              <InputOTPGroup>{[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}</InputOTPGroup>
            </InputOTP>
          </>
        )}

        {createStep === "confirm" && (
          <>
            <p className="text-sm text-white/70">Confirma tu PIN</p>
            <InputOTP maxLength={4} value={confirmPin} onChange={async (v) => { const normalized = normalizePin(v); setConfirmPin(normalized); setCreateError(""); if (normalized.length === 4) { if (normalized !== newPin) { setCreateError("Los PINs no coinciden"); setConfirmPin(""); return; } await createProfile(newName.trim(), newPin, "user"); resetCreate(); loadProfiles(); } }}>
              <InputOTPGroup>{[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}</InputOTPGroup>
            </InputOTP>
          </>
        )}

        {createError && <p className="text-sm text-destructive">{createError}</p>}

        {createStep === "name" && (
          <Button onClick={handleCreateNext} disabled={newName.trim().length < 2}>Siguiente</Button>
        )}
      </div>
    );
  }

  // Admin PIN entry
  if (adminPinMode && adminProfile) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6">
        <div className="absolute inset-0 -z-10"><ShaderAnimation /></div>
        <Button variant="ghost" size="icon" className="absolute left-4 top-4 text-white" onClick={() => { setAdminPinMode(false); setPin(""); setError(""); setAttempts(0); }}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">PIN Admin</h1>
        <div className={shake ? "animate-shake" : ""}>
          <InputOTP maxLength={4} value={pin} onChange={(v) => { setPin(v); setError(""); if (v.length === 4) verify(v, adminProfile.id); }} disabled={!!lockedUntil}>
            <InputOTPGroup>{[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}</InputOTPGroup>
          </InputOTP>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {lockedUntil && <p className="text-sm text-muted-foreground">Reintenta en {remaining}s</p>}
      </div>
    );
  }

  // Profile PIN entry
  if (selected) {
    const colorIdx = profiles.indexOf(selected);
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6">
        <div className="absolute inset-0 -z-10"><ShaderAnimation /></div>
        <Button variant="ghost" size="icon" className="absolute left-4 top-4 text-white" onClick={() => { setSelected(null); setPin(""); setError(""); setAttempts(0); }}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <ProfileAvatar avatar={selected.avatar} name={selected.name} colorIndex={profiles.indexOf(selected)} size="lg" />
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">{selected.name}</h1>
        <p className="text-sm text-white/70">Ingresa tu PIN</p>
        <div className={shake ? "animate-shake" : ""}>
          <InputOTP maxLength={4} value={pin} onChange={(v) => { setPin(v); setError(""); if (v.length === 4) verify(v, selected.id); }} disabled={!!lockedUntil}>
            <InputOTPGroup>{[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}</InputOTPGroup>
          </InputOTP>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {lockedUntil && <p className="text-sm text-muted-foreground">Reintenta en {remaining}s</p>}
      </div>
    );
  }

  // Profile grid
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="absolute inset-0 -z-10"><ShaderAnimation /></div>
      <h1 className="text-3xl font-bold text-white drop-shadow-lg">¿Quién eres?</h1>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {profiles.map((p, i) => (
            <button
              key={p.id}
              onClick={() => { setSelected(p); setPin(""); setError(""); setAttempts(0); }}
              className="flex flex-col items-center gap-3 rounded-2xl p-6 transition-transform active:scale-95 hover:bg-white/10"
            >
              <ProfileAvatar avatar={p.avatar} name={p.name} colorIndex={i} size="md" />
              <span className="text-base font-semibold text-white drop-shadow">{p.name}</span>
            </button>
          ))}

        {/* Botón crear nuevo perfil */}
        <button
          onClick={() => setCreating(true)}
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-white/30 p-6 transition-transform active:scale-95 hover:bg-white/10"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-3xl">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <span className="text-base font-semibold text-white/70">Nuevo</span>
        </button>
      </div>

      {/* Admin access */}
      {adminProfile && (
        <button
          onClick={() => setAdminPinMode(true)}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <span className="text-base font-semibold text-white/70">Admin</span>
        </button>
      )}
    </div>
  );
}
