import { useState, useCallback, useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Lock, KeyRound } from "lucide-react";

interface Props {
  hasPin: boolean;
  onUnlock: (pin: string) => Promise<boolean>;
  onCreatePin: (pin: string) => void;
}

export function LockScreen({ hasPin, onUnlock, onCreatePin }: Props) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "create" | "confirm">(hasPin ? "enter" : "create");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [shake, setShake] = useState(false);

  const isTimeLocked = lockedUntil != null && Date.now() < lockedUntil;

  useEffect(() => {
    if (!isTimeLocked) return;
    const id = setInterval(() => {
      if (Date.now() >= lockedUntil!) {
        setLockedUntil(null);
        setAttempts(0);
        setError("");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isTimeLocked, lockedUntil]);

  const handleVerify = useCallback(async (value: string) => {
    if (value.length < 4) return;
    if (isTimeLocked) return;
    const ok = await onUnlock(value);
    if (!ok) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      if (newAttempts >= 5) {
        setLockedUntil(Date.now() + 30000);
        setError("Demasiados intentos. Espera 30 segundos.");
      } else {
        setError(`PIN incorrecto (${newAttempts}/5)`);
      }
      setPin("");
    }
  }, [onUnlock, attempts, isTimeLocked]);

  const handleCreate = () => {
    if (pin.length < 4) return;
    setConfirmPin("");
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (confirmPin !== pin) {
      setError("Los PINs no coinciden");
      setConfirmPin("");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    onCreatePin(pin);
  };

  const remainingSeconds = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          {step === "enter" ? (
            <Lock className="h-10 w-10 text-primary" />
          ) : (
            <KeyRound className="h-10 w-10 text-primary" />
          )}
        </div>
        <h1 className="text-2xl font-bold">
          {step === "enter" ? "Ingresa tu PIN" : step === "create" ? "Crea un PIN" : "Confirma tu PIN"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === "enter" ? "4 dígitos para acceder" : step === "create" ? "Elige 4 dígitos" : "Repite tu PIN"}
        </p>
      </div>

      <div className={shake ? "animate-shake" : ""}>
        {step === "enter" && (
          <InputOTP maxLength={4} value={pin} onChange={(v) => { setPin(v); setError(""); if (v.length === 4) handleVerify(v); }} disabled={isTimeLocked}>
            <InputOTPGroup>
              {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}
            </InputOTPGroup>
          </InputOTP>
        )}
        {step === "create" && (
          <>
            <InputOTP maxLength={4} value={pin} onChange={(v) => { setPin(v); setError(""); }}>
              <InputOTPGroup>
                {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}
              </InputOTPGroup>
            </InputOTP>
            <Button className="mt-6 w-full" onClick={handleCreate} disabled={pin.length < 4}>Siguiente</Button>
          </>
        )}
        {step === "confirm" && (
          <>
            <InputOTP maxLength={4} value={confirmPin} onChange={(v) => { setConfirmPin(v); setError(""); }}>
              <InputOTPGroup>
                {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}
              </InputOTPGroup>
            </InputOTP>
            <Button className="mt-6 w-full" onClick={handleConfirm} disabled={confirmPin.length < 4}>Crear PIN</Button>
          </>
        )}
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {isTimeLocked && <p className="text-sm text-muted-foreground">Reintenta en {remainingSeconds}s</p>}
    </div>
  );
}
