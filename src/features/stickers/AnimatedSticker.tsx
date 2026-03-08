/**
 * Animated Sticker component – renders emoji-based stickers with CSS animations.
 * Each sticker has a unique animation style (bounce, spin, pulse, wobble, float).
 */

export type AnimationType = "bounce" | "spin" | "pulse" | "wobble" | "float" | "shake" | "swing" | "jelly" | "heartbeat" | "flash";

export interface AnimatedStickerDef {
  emoji: string;
  label: string;
  animation: AnimationType;
}

/** Animated stickers per pack */
export const ANIMATED_STICKERS: Record<string, AnimatedStickerDef[]> = {
  base: [
    { emoji: "⭐", label: "Estrella", animation: "spin" },
    { emoji: "🎨", label: "Paleta", animation: "wobble" },
    { emoji: "✨", label: "Destello", animation: "pulse" },
    { emoji: "🌈", label: "Arcoíris", animation: "float" },
    { emoji: "💡", label: "Idea", animation: "flash" },
  ],
  reinoMagico: [
    { emoji: "🦄", label: "Unicornio", animation: "bounce" },
    { emoji: "👑", label: "Corona", animation: "wobble" },
    { emoji: "🔮", label: "Bola mágica", animation: "pulse" },
    { emoji: "🧚", label: "Hada", animation: "float" },
    { emoji: "💎", label: "Diamante", animation: "heartbeat" },
  ],
  futbol: [
    { emoji: "⚽", label: "Balón", animation: "spin" },
    { emoji: "🏆", label: "Trofeo", animation: "bounce" },
    { emoji: "🥅", label: "Portería", animation: "shake" },
    { emoji: "👟", label: "Bota", animation: "swing" },
    { emoji: "🎉", label: "Celebración", animation: "jelly" },
  ],
  baloncesto: [
    { emoji: "🏀", label: "Balón", animation: "bounce" },
    { emoji: "🏆", label: "Trofeo", animation: "spin" },
    { emoji: "👟", label: "Zapatilla", animation: "swing" },
    { emoji: "🔥", label: "Fuego", animation: "pulse" },
    { emoji: "💪", label: "Fuerza", animation: "jelly" },
  ],
};

const ANIMATION_STYLES: Record<AnimationType, string> = {
  bounce: "animate-[stk-bounce_0.8s_ease-in-out_infinite]",
  spin: "animate-[stk-spin_2s_linear_infinite]",
  pulse: "animate-[stk-pulse_1.5s_ease-in-out_infinite]",
  wobble: "animate-[stk-wobble_1s_ease-in-out_infinite]",
  float: "animate-[stk-float_2s_ease-in-out_infinite]",
  shake: "animate-[stk-shake_0.6s_ease-in-out_infinite]",
  swing: "animate-[stk-swing_1.2s_ease-in-out_infinite]",
  jelly: "animate-[stk-jelly_0.8s_ease-in-out_infinite]",
  heartbeat: "animate-[stk-heartbeat_1.2s_ease-in-out_infinite]",
  flash: "animate-[stk-flash_2s_ease-in-out_infinite]",
};

interface Props {
  emoji: string;
  animation: AnimationType;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
};

export function AnimatedSticker({ emoji, animation, size = "md" }: Props) {
  return (
    <span className={`inline-block leading-none select-none ${SIZE_MAP[size]} ${ANIMATION_STYLES[animation]}`}>
      {emoji}
    </span>
  );
}

/** Get animation type from an animated sticker key like "animated:spin:⭐" */
export function parseAnimatedKey(key: string): { emoji: string; animation: AnimationType } | null {
  if (!key.startsWith("animated:")) return null;
  const parts = key.split(":");
  if (parts.length < 3) return null;
  return { animation: parts[1] as AnimationType, emoji: parts[2] };
}

/** Create a key for an animated sticker */
export function animatedKey(def: AnimatedStickerDef): string {
  return `animated:${def.animation}:${def.emoji}`;
}
