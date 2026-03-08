import { useState, useEffect, useCallback } from "react";
import { profileService } from "@/core/auth/profileService";
import { useProfile } from "@/core/auth/ProfileContext";
import type { Profile } from "@/core/storage/repositories/profileRepository";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { LongPress } from "@/app/components/LongPress";
import { Shield, ArrowLeft } from "lucide-react";

const COLORS = [
  "bg-rose-400", "bg-amber-400", "bg-emerald-400", "bg-sky-400",
  "bg-violet-400", "bg-pink-400", "bg-teal-400", "bg-orange-400",
];

export function ProfileSelect() {
  const { login, refresh } = useProfile();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [adminPinMode, setAdminPinMode] = useState(false);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);

  useEffect(() => {
    profileService.getVisibleProfiles().then(setProfiles);
    profileService.getAdminProfile().then((a) => setAdminProfile(a ?? null));
  }, []);

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

  const remaining = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  // Admin PIN entry
  if (adminPinMode && adminProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6">
        <Button variant="ghost" size="icon" className="absolute left-4 top-4" onClick={() => { setAdminPinMode(false); setPin(""); setError(""); setAttempts(0); }}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">PIN Admin</h1>
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
    const colorIdx = profiles.indexOf(selected) % COLORS.length;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6">
        <Button variant="ghost" size="icon" className="absolute left-4 top-4" onClick={() => { setSelected(null); setPin(""); setError(""); setAttempts(0); }}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className={`flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold text-white ${COLORS[colorIdx]}`}>
          {selected.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold">{selected.name}</h1>
        <p className="text-sm text-muted-foreground">Ingresa tu PIN</p>
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6">
      <h1 className="text-3xl font-bold">¿Quién eres?</h1>

      {profiles.length === 0 ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">👤</p>
          <p className="text-muted-foreground">No hay perfiles de usuario todavía.</p>
          <p className="text-sm text-muted-foreground">
            Accede como administrador para crear perfiles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {profiles.map((p, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <button
                key={p.id}
                onClick={() => { setSelected(p); setPin(""); setError(""); setAttempts(0); }}
                className="flex flex-col items-center gap-3 rounded-2xl p-6 transition-transform active:scale-95 hover:bg-muted/50"
              >
                <div className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg ${color}`}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-base font-semibold">{p.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Hidden admin access via long press */}
      {adminProfile && (
        <LongPress onLongPress={() => setAdminPinMode(true)} duration={2500}>
          <div className="flex items-center justify-center py-4 opacity-30">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </LongPress>
      )}
    </div>
  );
}
