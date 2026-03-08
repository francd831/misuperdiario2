import { useState } from "react";
import { ALL_ACHIEVEMENTS } from "./types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  unlocked: string[];
}

export function AchievementBadges({ unlocked }: Props) {
  const [open, setOpen] = useState(false);
  const unlockedSet = new Set(unlocked);
  const count = unlocked.length;

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between py-1"
      >
        <h3 className="text-base font-bold text-foreground">
          🏅 Mis logros ({count}/{ALL_ACHIEVEMENTS.length})
        </h3>
        <span className="text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {open && (
        <div className="grid grid-cols-4 gap-3">
          {ALL_ACHIEVEMENTS.map((a) => {
            const isUnlocked = unlockedSet.has(a.id);
            return (
              <div
                key={a.id}
                className="flex flex-col items-center gap-1 text-center"
                title={isUnlocked ? `${a.name}: ${a.description}` : "???"}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all ${
                    isUnlocked
                      ? "bg-primary/10 scale-100"
                      : "bg-muted/50 grayscale opacity-40 scale-90"
                  }`}
                >
                  {a.emoji}
                </div>
                <span className={`text-[10px] leading-tight font-medium ${
                  isUnlocked ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {isUnlocked ? a.name : "???"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
