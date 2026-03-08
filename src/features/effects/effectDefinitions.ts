/**
 * Animated overlay effects per pack.
 * Each effect is a full-screen CSS animation rendered on top of media.
 */

export interface EffectDef {
  id: string;
  label: string;
  emoji: string;          // icon shown in the tray
  animation: EffectAnimation;
  /** particles / elements spawned */
  particles: string[];
  /** Number of particles */
  count: number;
  /** Duration in seconds for the full loop */
  duration: number;
}

export type EffectAnimation =
  | "stardust"
  | "rainbow-shine"
  | "magic-portal"
  | "dino-steps"
  | "leaves-wind"
  | "volcano-eruption"
  | "confetti-burst"
  | "scoreboard-flash"
  | "ball-spin"
  | "net-swish"
  | "ball-bounce"
  | "nba-scoreboard"
  | "meteors"
  | "shooting-stars"
  | "planet-orbit"
  // New unique animations for themed packs
  | "candy-rain"
  | "sweet-pop"
  | "frosting-wave"
  | "paw-walk"
  | "hearts-rise"
  | "bubbles-float"
  | "spell-cast"
  | "rune-glow"
  | "potion-bubble"
  | "wave-rock"
  | "cannon-blast"
  | "treasure-sparkle"
  | "speed-lines"
  | "drift-smoke"
  | "finish-flag"
  | "paint-drip-down"
  | "brush-sweep"
  | "color-splat";

export const PACK_EFFECTS: Record<string, EffectDef[]> = {
  reinoMagico: [
    {
      id: "stardust",
      label: "Polvo de estrellas",
      emoji: "✨",
      animation: "stardust",
      particles: ["✨", "⭐", "💫", "🌟"],
      count: 18,
      duration: 4,
    },
    {
      id: "rainbow-shine",
      label: "Arcoíris brillante",
      emoji: "🌈",
      animation: "rainbow-shine",
      particles: ["🌈"],
      count: 1,
      duration: 6,
    },
    {
      id: "magic-portal",
      label: "Portal mágico",
      emoji: "🔮",
      animation: "magic-portal",
      particles: ["🔮", "✨", "💜", "🌀"],
      count: 14,
      duration: 5,
    },
  ],
  dinosaurios: [
    {
      id: "dino-steps",
      label: "Pisadas de dinosaurio",
      emoji: "🐾",
      animation: "dino-steps",
      particles: ["🐾"],
      count: 6,
      duration: 4,
    },
    {
      id: "leaves-wind",
      label: "Hojas moviéndose",
      emoji: "🍃",
      animation: "leaves-wind",
      particles: ["🍃", "🌿", "🍂", "🌱"],
      count: 16,
      duration: 5,
    },
    {
      id: "volcano-eruption",
      label: "Volcán",
      emoji: "🌋",
      animation: "volcano-eruption",
      particles: ["🔥", "💥", "🌋", "☄️"],
      count: 14,
      duration: 4,
    },
  ],
  futbol: [
    {
      id: "confetti-burst",
      label: "Explosión de confeti",
      emoji: "🎊",
      animation: "confetti-burst",
      particles: ["🎊", "🎉", "🥳", "✨"],
      count: 20,
      duration: 4,
    },
    {
      id: "scoreboard-flash",
      label: "Marcador animado",
      emoji: "📊",
      animation: "scoreboard-flash",
      particles: ["⚽"],
      count: 1,
      duration: 3,
    },
    {
      id: "ball-spin",
      label: "Balón girando",
      emoji: "⚽",
      animation: "ball-spin",
      particles: ["⚽"],
      count: 1,
      duration: 2,
    },
  ],
  baloncesto: [
    {
      id: "net-swish",
      label: "Red moviéndose",
      emoji: "🏀",
      animation: "net-swish",
      particles: ["🥅"],
      count: 1,
      duration: 3,
    },
    {
      id: "ball-bounce",
      label: "Balón botando",
      emoji: "🏀",
      animation: "ball-bounce",
      particles: ["🏀"],
      count: 1,
      duration: 2,
    },
    {
      id: "nba-scoreboard",
      label: "Marcador NBA style",
      emoji: "🏆",
      animation: "nba-scoreboard",
      particles: ["🏆"],
      count: 1,
      duration: 4,
    },
  ],
  espacio: [
    {
      id: "meteors",
      label: "Meteoritos",
      emoji: "☄️",
      animation: "meteors",
      particles: ["☄️", "💥", "🪨"],
      count: 10,
      duration: 3,
    },
    {
      id: "shooting-stars",
      label: "Estrellas fugaces",
      emoji: "🌠",
      animation: "shooting-stars",
      particles: ["⭐", "🌟", "💫"],
      count: 12,
      duration: 4,
    },
    {
      id: "planet-orbit",
      label: "Planeta orbitando",
      emoji: "🪐",
      animation: "planet-orbit",
      particles: ["🪐", "🌍", "🌙"],
      count: 3,
      duration: 8,
    },
  ],
  dulcePasteleria: [
    {
      id: "candy-rain",
      label: "Lluvia de caramelos",
      emoji: "🍬",
      animation: "candy-rain",
      particles: ["🍬", "🍭", "🍩", "🧁", "🍪", "🍫"],
      count: 22,
      duration: 5,
    },
    {
      id: "sweet-pop",
      label: "Dulces saltarines",
      emoji: "🧁",
      animation: "sweet-pop",
      particles: ["🧁", "🍰", "🎂", "🍦"],
      count: 10,
      duration: 3,
    },
    {
      id: "frosting-wave",
      label: "Ola de glaseado",
      emoji: "🌊",
      animation: "frosting-wave",
      particles: ["🩷", "💗", "🤍", "💜"],
      count: 12,
      duration: 6,
    },
  ],
  animalesDivertidos: [
    {
      id: "paw-walk",
      label: "Patitas caminando",
      emoji: "🐾",
      animation: "paw-walk",
      particles: ["🐾"],
      count: 8,
      duration: 4,
    },
    {
      id: "hearts-rise",
      label: "Corazones subiendo",
      emoji: "💕",
      animation: "hearts-rise",
      particles: ["❤️", "💕", "💖", "💗", "🩷"],
      count: 16,
      duration: 5,
    },
    {
      id: "bubbles-float",
      label: "Burbujas flotantes",
      emoji: "🫧",
      animation: "bubbles-float",
      particles: ["🫧", "🔵", "⚪", "💧"],
      count: 18,
      duration: 6,
    },
  ],
  escuelaMagia: [
    {
      id: "spell-cast",
      label: "Hechizo lanzado",
      emoji: "🪄",
      animation: "spell-cast",
      particles: ["✨", "⚡", "💫", "🌟", "🪄"],
      count: 20,
      duration: 3,
    },
    {
      id: "rune-glow",
      label: "Runas brillantes",
      emoji: "🔮",
      animation: "rune-glow",
      particles: ["🔮", "✡️", "☪️", "✴️", "💠"],
      count: 8,
      duration: 5,
    },
    {
      id: "potion-bubble",
      label: "Burbujas de poción",
      emoji: "🧪",
      animation: "potion-bubble",
      particles: ["🧪", "💜", "💚", "🟣", "🫧"],
      count: 14,
      duration: 4,
    },
  ],
  aventuraPirata: [
    {
      id: "wave-rock",
      label: "Olas meciendo",
      emoji: "🌊",
      animation: "wave-rock",
      particles: ["🌊", "🐚", "🐠", "🦀", "⚓"],
      count: 10,
      duration: 5,
    },
    {
      id: "cannon-blast",
      label: "Cañonazo pirata",
      emoji: "💣",
      animation: "cannon-blast",
      particles: ["💣", "💥", "🔥", "💨"],
      count: 8,
      duration: 3,
    },
    {
      id: "treasure-sparkle",
      label: "Tesoro brillando",
      emoji: "💎",
      animation: "treasure-sparkle",
      particles: ["💎", "🪙", "💰", "👑", "✨"],
      count: 14,
      duration: 4,
    },
  ],
  superVelocidad: [
    {
      id: "speed-lines",
      label: "Líneas de velocidad",
      emoji: "💨",
      animation: "speed-lines",
      particles: ["➖", "〰️", "⚡"],
      count: 12,
      duration: 2,
    },
    {
      id: "drift-smoke",
      label: "Humo de derrape",
      emoji: "🌫️",
      animation: "drift-smoke",
      particles: ["💨", "☁️", "🌫️"],
      count: 10,
      duration: 3,
    },
    {
      id: "finish-flag",
      label: "Bandera de meta",
      emoji: "🏁",
      animation: "finish-flag",
      particles: ["🏁", "🏎️", "🏆"],
      count: 1,
      duration: 4,
    },
  ],
  artePintura: [
    {
      id: "paint-drip-down",
      label: "Goteo de pintura",
      emoji: "🖌️",
      animation: "paint-drip-down",
      particles: ["🔴", "🟡", "🔵", "🟢", "🟣", "🟠"],
      count: 18,
      duration: 5,
    },
    {
      id: "brush-sweep",
      label: "Pincelada",
      emoji: "🖌️",
      animation: "brush-sweep",
      particles: ["🖌️"],
      count: 1,
      duration: 4,
    },
    {
      id: "color-splat",
      label: "Salpicadura",
      emoji: "🎨",
      animation: "color-splat",
      particles: ["🎨", "💜", "💙", "💚", "❤️", "💛"],
      count: 12,
      duration: 3,
    },
  ],
};

/** Generate a key for the overlay engine */
export function effectKey(def: EffectDef): string {
  return `effect:${def.id}`;
}

/** Parse an effect key back to a definition */
export function parseEffectKey(key: string): EffectDef | null {
  if (!key.startsWith("effect:")) return null;
  const id = key.replace("effect:", "");
  for (const defs of Object.values(PACK_EFFECTS)) {
    const found = defs.find((d) => d.id === id);
    if (found) return found;
  }
  return null;
}
