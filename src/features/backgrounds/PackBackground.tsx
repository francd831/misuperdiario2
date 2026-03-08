import { useContext } from "react";
import { useMemo } from "react";
import { PackCtx } from "@/core/packs/PackContext";

interface FloatingItem {
  emoji: string;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  opacity: number;
  rotation: number;
}

const PACK_DECORATIONS: Record<string, string[]> = {
  base: ["📖", "✏️", "🖍️", "📝", "🎨", "✨", "📚", "🖊️", "📒", "🌟", "🎵", "💡", "🔖", "📎", "🧩"],
  reinoMagico: ["🦄", "🌈", "👑", "⭐", "🏰", "🪄", "🦋", "💎", "🌸", "✨", "🧚", "🌙", "💫", "🔮", "🌺"],
  futbol: ["⚽", "🥅", "🏆", "👟", "🎽", "🏅", "📣", "⭐", "🟢", "🟡", "🔵", "🟥", "💪", "🎯", "🥇"],
  baloncesto: ["🏀", "🏆", "👟", "🎽", "🏅", "💪", "⭐", "🔥", "🎯", "🥇", "📣", "🟠", "🔴", "🟡", "🏟️"],
};

const DEFAULT_DECORATIONS = ["✨", "⭐", "🌟", "💫", "🎈", "🎉"];

function generateItems(emojis: string[], count: number): FloatingItem[] {
  const items: FloatingItem[] = [];
  // Use deterministic pseudo-random based on index for consistent layout
  for (let i = 0; i < count; i++) {
    const seed = (i * 7 + 13) % 100;
    const seed2 = (i * 11 + 7) % 100;
    const seed3 = (i * 3 + 17) % 100;
    items.push({
      emoji: emojis[i % emojis.length],
      size: 18 + (seed % 20),
      x: (seed * 1.01) % 100,
      y: (seed2 * 1.01) % 100,
      delay: (seed3 * 0.15),
      duration: 12 + (seed % 18),
      opacity: 0.08 + (seed % 12) * 0.01,
      rotation: (seed3 * 3.6) % 360,
    });
  }
  return items;
}

export function PackBackground() {
  const { activePack } = usePack();
  const packId = activePack?.id ?? "base";

  const items = useMemo(() => {
    const emojis = PACK_DECORATIONS[packId] ?? DEFAULT_DECORATIONS;
    return generateItems(emojis, 22);
  }, [packId]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Color blobs layer */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 5% 95%, hsl(var(--pack-bgBlob1) / 0.30) 0%, transparent 60%),
            radial-gradient(ellipse 70% 55% at 95% 10%, hsl(var(--pack-bgBlob2) / 0.25) 0%, transparent 55%),
            radial-gradient(ellipse 65% 55% at 50% 50%, hsl(var(--pack-bgBlob3) / 0.18) 0%, transparent 50%),
            radial-gradient(ellipse 90% 45% at 85% 85%, hsl(var(--pack-bgBlob4) / 0.22) 0%, transparent 50%),
            radial-gradient(ellipse 55% 65% at 15% 25%, hsl(var(--pack-bgBlob5) / 0.20) 0%, transparent 50%),
            hsl(var(--background))
          `,
        }}
      />
      {/* Floating emojis layer */}
      {items.map((item, i) => (
        <span
          key={i}
          className="absolute animate-float select-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
            opacity: item.opacity,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            transform: `rotate(${item.rotation}deg)`,
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
