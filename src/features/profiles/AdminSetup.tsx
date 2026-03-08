import { useState, useCallback } from "react";
import { useProfile } from "@/core/auth/ProfileContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";

export function AdminSetup() {
  const { createProfile, login } = useProfile();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"name" | "pin" | "confirm">("name");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const normalizePin = (value: string) => value.replace(/\D/g, "").slice(0, 4);

  const handleNext = () => {
    if (step === "name") {
      if (!name.trim()) return;
      setStep("pin");
    } else if (step === "pin") {
      if (normalizePin(pin).length < 4) return;
      setStep("confirm");
    }
  };

  const handleCreate = useCallback(async () => {
    const normalizedPin = normalizePin(pin);
    const normalizedConfirm = normalizePin(confirmPin);
    if (normalizedConfirm !== normalizedPin) {
      setError("Los PINs no coinciden");
      setConfirmPin("");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    const profile = await createProfile(name.trim(), normalizedPin, "admin");
    login(profile.id);
  }, [name, pin, confirmPin, createProfile, login]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <ShieldCheck className="h-10 w-10 text-primary" />
      </div>

      {step === "name" && (
        <>
          <h1 className="text-2xl font-bold">Crear administrador</h1>
          <p className="text-sm text-muted-foreground text-center">
            El administrador gestiona los perfiles y la configuración de la app.
          </p>
          <Input
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs text-center text-lg"
            autoFocus
          />
          <Button onClick={handleNext} disabled={!name.trim()} className="w-full max-w-xs">
            Siguiente
          </Button>
        </>
      )}

      {step === "pin" && (
        <>
          <h1 className="text-2xl font-bold">Crea un PIN</h1>
          <p className="text-sm text-muted-foreground">4 dígitos para el administrador</p>
          <InputOTP maxLength={4} value={pin} onChange={(v) => { setPin(normalizePin(v)); setError(""); }}>
            <InputOTPGroup>
              {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}
            </InputOTPGroup>
          </InputOTP>
          <Button onClick={handleNext} disabled={pin.length < 4} className="w-full max-w-xs">
            Siguiente
          </Button>
        </>
      )}

      {step === "confirm" && (
        <>
          <h1 className="text-2xl font-bold">Confirma tu PIN</h1>
          <div className={shake ? "animate-shake" : ""}>
            <InputOTP maxLength={4} value={confirmPin} onChange={(v) => { setConfirmPin(normalizePin(v)); setError(""); }}>
              <InputOTPGroup>
                {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleCreate} disabled={confirmPin.length < 4} className="w-full max-w-xs">
            Crear administrador
          </Button>
        </>
      )}
    </div>
  );
}
