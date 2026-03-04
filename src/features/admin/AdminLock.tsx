import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { settingsRepository } from "@/core/storage/repositories/settingsRepository";

export function AdminLock() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [step, setStep] = useState<"check" | "enter" | "create" | "confirm">("check");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    settingsRepository.get().then((s) => {
      const adminPin = (s as any).adminPin;
      setHasPin(!!adminPin);
      setStep(adminPin ? "enter" : "create");
    });
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      if (Date.now() >= lockedUntil) { setLockedUntil(null); setAttempts(0); setError(""); }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const verify = useCallback(async (value: string) => {
    if (value.length < 4 || lockedUntil) return;
    const s = await settingsRepository.get();
    if ((s as any).adminPin === value) {
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
  }, [attempts, lockedUntil, navigate]);

  const create = async () => {
    if (pin.length < 4) return;
    if (step === "create") { setStep("confirm"); return; }
    if (confirmPin !== pin) {
      setError("No coinciden");
      setConfirmPin("");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    const s = await settingsRepository.get();
    await settingsRepository.save({ ...s, adminPin: pin } as any);
    navigate("/admin");
  };

  if (step === "check") return null;

  const remaining = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <ShieldCheck className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-2xl font-bold">
        {step === "enter" ? "PIN Admin" : step === "create" ? "Crear PIN Admin" : "Confirmar PIN"}
      </h1>

      <div className={shake ? "animate-shake" : ""}>
        {step === "enter" && (
          <InputOTP maxLength={4} value={pin} onChange={(v) => { setPin(v); setError(""); if (v.length === 4) verify(v); }} disabled={!!lockedUntil}>
            <InputOTPGroup>{[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}</InputOTPGroup>
          </InputOTP>
        )}
        {step === "create" && (
          <>
            <InputOTP maxLength={4} value={pin} onChange={(v) => { setPin(v); setError(""); }}>
              <InputOTPGroup>{[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}</InputOTPGroup>
            </InputOTP>
            <Button className="mt-6 w-full" onClick={create} disabled={pin.length < 4}>Siguiente</Button>
          </>
        )}
        {step === "confirm" && (
          <>
            <InputOTP maxLength={4} value={confirmPin} onChange={(v) => { setConfirmPin(v); setError(""); }}>
              <InputOTPGroup>{[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}</InputOTPGroup>
            </InputOTP>
            <Button className="mt-6 w-full" onClick={create} disabled={confirmPin.length < 4}>Crear</Button>
          </>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {lockedUntil && <p className="text-sm text-muted-foreground">Reintenta en {remaining}s</p>}
      <Button variant="ghost" onClick={() => navigate("/settings")}>Volver</Button>
    </div>
  );
}
