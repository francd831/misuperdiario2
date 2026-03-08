import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AchievementDef } from "./types";

interface Props {
  achievement: AchievementDef;
  onDismiss: () => void;
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 1.5,
  size: 8 + Math.random() * 16,
  duration: 2 + Math.random() * 2,
}));

export function AchievementCelebration({ achievement, onDismiss }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  return (
    <Dialog open onOpenChange={() => onDismiss()}>
      <DialogContent className="flex flex-col items-center gap-4 border-none bg-background/95 backdrop-blur-md text-center max-w-sm">
        {/* Particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
          {PARTICLES.map((p) => (
            <span
              key={p.id}
              className="absolute animate-fx-candy-rain"
              style={{
                left: `${p.left}%`,
                top: -20,
                fontSize: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            >
              {achievement.emoji}
            </span>
          ))}
        </div>

        {/* Content */}
        <div
          className={`text-7xl transition-all duration-700 ${
            show ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
          style={{ animationDelay: "0.2s" }}
        >
          {achievement.emoji}
        </div>

        <h2
          className={`text-2xl font-extrabold text-foreground transition-all duration-500 delay-300 ${
            show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {achievement.name}
        </h2>

        <p
          className={`text-sm text-muted-foreground transition-all duration-500 delay-500 ${
            show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {achievement.description}
        </p>

        <Button
          onClick={onDismiss}
          className={`mt-2 transition-all duration-500 delay-700 ${
            show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          ¡Genial! 🎉
        </Button>
      </DialogContent>
    </Dialog>
  );
}
