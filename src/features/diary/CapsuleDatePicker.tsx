import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  isCapsule: boolean;
  onCapsuleChange: (v: boolean) => void;
  unlockDate: string; // YYYY-MM-DD
  onUnlockDateChange: (v: string) => void;
}

export function CapsuleDatePicker({ isCapsule, onCapsuleChange, unlockDate, onUnlockDateChange }: Props) {
  const [open, setOpen] = useState(false);

  // Auto-open calendar when capsule is toggled on
  useEffect(() => {
    if (isCapsule && !unlockDate) {
      // Small delay so the popover trigger is rendered
      const t = setTimeout(() => setOpen(true), 100);
      return () => clearTimeout(t);
    }
  }, [isCapsule, unlockDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = unlockDate ? new Date(unlockDate + "T00:00:00") : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Switch checked={isCapsule} onCheckedChange={onCapsuleChange} id="capsule" />
        <Label htmlFor="capsule">Cápsula del tiempo</Label>
      </div>

      {isCapsule && (
        <div className="space-y-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !unlockDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selected ? format(selected, "d 'de' MMMM yyyy", { locale: es }) : "Selecciona fecha de desbloqueo"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={(date) => {
                  if (date) {
                    onUnlockDateChange(format(date, "yyyy-MM-dd"));
                    setOpen(false);
                  }
                }}
                disabled={(date) => date < today}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {!unlockDate && (
            <p className="text-xs text-destructive">Debes seleccionar una fecha de desbloqueo</p>
          )}
        </div>
      )}
    </div>
  );
}
