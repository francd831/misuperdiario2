import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { profileService } from "@/core/auth/profileService";
import { useProfile } from "@/core/auth/ProfileContext";

export function AdminLock() {
  const navigate = useNavigate();
  const { login } = useProfile();
  const [pin, setPin] = useState("");
  const [adminId, setAdminId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    profileService.getAdminProfile().then((a) => {
      if (a) setAdminId(a.id);
      else navigate("/settings");
    });
  }, [navigate]);

  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      if (Date.now() >= lockedUntil) { setLockedUntil(null); setAttempts(0); setError(""); }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const verify = useCallback(async (value: string) => {
    if (value.length < 4 || lockedUntil || !adminId) return;
    const ok = await profileService.verifyPin(adminId, value);
    if (ok) {
      login(adminId);
      navigate("/admin");
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
  }, [attempts, lockedUntil, adminId, login, navigate]);

  if (!adminId) return null;

  const remaining = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <ShieldCheck className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">PIN Admin</h1>

      <div className={shake ? "animate-shake" : ""}>
        <InputOTP maxLength={4} value={pin} onChange={(v) => { setPin(v); setError(""); if (v.length === 4) verify(v); }} disabled={!!lockedUntil}>
          <InputOTPGroup>{[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}</InputOTPGroup>
        </InputOTP>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {lockedUntil && <p className="text-sm text-muted-foreground">Reintenta en {remaining}s</p>}
      <Button variant="ghost" onClick={() => navigate("/settings")}>Volver</Button>
    </div>
  );
}
