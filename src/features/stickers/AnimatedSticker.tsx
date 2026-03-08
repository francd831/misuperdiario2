/**
 * Animated Sticker component – renders emoji-based stickers with CSS animations.
 */

export type AnimationType = "bounce" | "spin" | "pulse" | "wobble" | "float" | "shake" | "swing" | "jelly" | "heartbeat" | "flash";

export interface AnimatedStickerDef {
  emoji: string;
  label: string;
  animation: AnimationType;
}

/** Animated stickers per pack – 24 per pack */
export const ANIMATED_STICKERS: Record<string, AnimatedStickerDef[]> = {
  base: [
    { emoji: "⭐", label: "Estrella", animation: "spin" },
    { emoji: "🎨", label: "Paleta", animation: "wobble" },
    { emoji: "✨", label: "Destello", animation: "pulse" },
    { emoji: "🌈", label: "Arcoíris", animation: "float" },
    { emoji: "💡", label: "Idea", animation: "flash" },
    { emoji: "🎈", label: "Globo", animation: "bounce" },
    { emoji: "🎶", label: "Música", animation: "swing" },
    { emoji: "🌻", label: "Girasol", animation: "heartbeat" },
    { emoji: "🦋", label: "Mariposa", animation: "float" },
    { emoji: "🍭", label: "Piruleta", animation: "wobble" },
    { emoji: "🎯", label: "Diana", animation: "jelly" },
    { emoji: "🌙", label: "Luna", animation: "pulse" },
    { emoji: "🎪", label: "Circo", animation: "bounce" },
    { emoji: "🧩", label: "Puzzle", animation: "shake" },
    { emoji: "🎸", label: "Guitarra", animation: "swing" },
    { emoji: "🌺", label: "Hibisco", animation: "heartbeat" },
    { emoji: "🪁", label: "Cometa", animation: "float" },
    { emoji: "🎭", label: "Máscaras", animation: "wobble" },
    { emoji: "🫧", label: "Burbujas", animation: "pulse" },
    { emoji: "🪩", label: "Disco", animation: "spin" },
    { emoji: "🧸", label: "Peluche", animation: "jelly" },
    { emoji: "🎠", label: "Carrusel", animation: "swing" },
    { emoji: "🌊", label: "Ola", animation: "float" },
    { emoji: "🔔", label: "Campana", animation: "shake" },
  ],
  reinoMagico: [
    { emoji: "🦄", label: "Unicornio", animation: "bounce" },
    { emoji: "👑", label: "Corona", animation: "wobble" },
    { emoji: "🔮", label: "Bola mágica", animation: "pulse" },
    { emoji: "🧚", label: "Hada", animation: "float" },
    { emoji: "💎", label: "Diamante", animation: "heartbeat" },
    { emoji: "🪄", label: "Varita", animation: "swing" },
    { emoji: "🏰", label: "Castillo", animation: "jelly" },
    { emoji: "🌟", label: "Estrella mágica", animation: "spin" },
    { emoji: "🐉", label: "Dragón", animation: "shake" },
    { emoji: "🧜", label: "Sirena", animation: "float" },
    { emoji: "🪷", label: "Loto", animation: "pulse" },
    { emoji: "🫧", label: "Burbujas", animation: "bounce" },
    { emoji: "🦚", label: "Pavo real", animation: "wobble" },
    { emoji: "🧞", label: "Genio", animation: "jelly" },
    { emoji: "🪻", label: "Lavanda", animation: "float" },
    { emoji: "🦢", label: "Cisne", animation: "swing" },
    { emoji: "🌸", label: "Cerezo", animation: "heartbeat" },
    { emoji: "🦩", label: "Flamenco", animation: "bounce" },
    { emoji: "🎀", label: "Lazo", animation: "wobble" },
    { emoji: "🍄", label: "Seta mágica", animation: "pulse" },
    { emoji: "🐇", label: "Conejo", animation: "jelly" },
    { emoji: "🕊️", label: "Paloma", animation: "float" },
    { emoji: "🌙", label: "Luna", animation: "spin" },
    { emoji: "💫", label: "Magia", animation: "flash" },
  ],
  futbol: [
    { emoji: "⚽", label: "Balón", animation: "spin" },
    { emoji: "🏆", label: "Trofeo", animation: "bounce" },
    { emoji: "🥅", label: "Portería", animation: "shake" },
    { emoji: "👟", label: "Bota", animation: "swing" },
    { emoji: "🎉", label: "Celebración", animation: "jelly" },
    { emoji: "🏅", label: "Medalla", animation: "wobble" },
    { emoji: "📣", label: "Megáfono", animation: "pulse" },
    { emoji: "🚩", label: "Bandera", animation: "float" },
    { emoji: "⚡", label: "Rayo", animation: "flash" },
    { emoji: "🔥", label: "Fuego", animation: "heartbeat" },
    { emoji: "💪", label: "Fuerza", animation: "jelly" },
    { emoji: "🥇", label: "Oro", animation: "spin" },
    { emoji: "🎯", label: "Puntería", animation: "bounce" },
    { emoji: "🦅", label: "Águila", animation: "float" },
    { emoji: "💨", label: "Velocidad", animation: "shake" },
    { emoji: "🫡", label: "Saludo", animation: "swing" },
    { emoji: "🎺", label: "Trompeta", animation: "wobble" },
    { emoji: "🧤", label: "Guante", animation: "jelly" },
    { emoji: "⏱️", label: "Crono", animation: "pulse" },
    { emoji: "🎪", label: "Arena", animation: "bounce" },
    { emoji: "🌟", label: "Estrella", animation: "spin" },
    { emoji: "👊", label: "Puño", animation: "shake" },
    { emoji: "🦁", label: "León", animation: "heartbeat" },
    { emoji: "🎵", label: "Hinchada", animation: "swing" },
  ],
  baloncesto: [
    { emoji: "🏀", label: "Balón", animation: "bounce" },
    { emoji: "🏆", label: "Trofeo", animation: "spin" },
    { emoji: "👟", label: "Zapatilla", animation: "swing" },
    { emoji: "🔥", label: "Fuego", animation: "pulse" },
    { emoji: "💪", label: "Fuerza", animation: "jelly" },
    { emoji: "⛹️", label: "Jugador", animation: "bounce" },
    { emoji: "🎯", label: "Tiro", animation: "shake" },
    { emoji: "📣", label: "Ánimo", animation: "wobble" },
    { emoji: "⚡", label: "Rayo", animation: "flash" },
    { emoji: "🥇", label: "Campeón", animation: "float" },
    { emoji: "🏅", label: "Medalla", animation: "heartbeat" },
    { emoji: "💥", label: "Explosión", animation: "jelly" },
    { emoji: "🎺", label: "Bocina", animation: "swing" },
    { emoji: "🦾", label: "Robot", animation: "shake" },
    { emoji: "🌟", label: "MVP", animation: "spin" },
    { emoji: "👑", label: "Rey", animation: "wobble" },
    { emoji: "💨", label: "Veloz", animation: "float" },
    { emoji: "🧊", label: "Hielo", animation: "pulse" },
    { emoji: "🎵", label: "Ritmo", animation: "swing" },
    { emoji: "🦅", label: "Águila", animation: "float" },
    { emoji: "🫶", label: "Corazón", animation: "heartbeat" },
    { emoji: "✊", label: "Puño", animation: "shake" },
    { emoji: "🎪", label: "Arena", animation: "bounce" },
    { emoji: "🥁", label: "Tambor", animation: "jelly" },
  ],
  espacio: [
    { emoji: "🚀", label: "Cohete", animation: "bounce" },
    { emoji: "🌍", label: "Tierra", animation: "spin" },
    { emoji: "🌙", label: "Luna", animation: "float" },
    { emoji: "⭐", label: "Estrella", animation: "pulse" },
    { emoji: "🛸", label: "OVNI", animation: "wobble" },
    { emoji: "👽", label: "Alien", animation: "jelly" },
    { emoji: "🪐", label: "Saturno", animation: "swing" },
    { emoji: "☄️", label: "Cometa", animation: "shake" },
    { emoji: "🌌", label: "Galaxia", animation: "heartbeat" },
    { emoji: "🔭", label: "Telescopio", animation: "wobble" },
    { emoji: "👨‍🚀", label: "Astronauta", animation: "float" },
    { emoji: "🛰️", label: "Satélite", animation: "spin" },
    { emoji: "💫", label: "Destello", animation: "flash" },
    { emoji: "🌠", label: "Estrella fugaz", animation: "bounce" },
    { emoji: "🌕", label: "Luna llena", animation: "pulse" },
    { emoji: "🌑", label: "Eclipse", animation: "heartbeat" },
    { emoji: "✨", label: "Brillo", animation: "flash" },
    { emoji: "🌟", label: "Supernova", animation: "jelly" },
    { emoji: "🔥", label: "Reentrada", animation: "shake" },
    { emoji: "🌀", label: "Agujero negro", animation: "spin" },
    { emoji: "⚡", label: "Energía", animation: "flash" },
    { emoji: "🎆", label: "Nebulosa", animation: "pulse" },
    { emoji: "🏳️", label: "Bandera lunar", animation: "swing" },
    { emoji: "🤖", label: "Robot", animation: "wobble" },
  ],
  dinosaurios: [
    { emoji: "🦕", label: "Braquiosaurio", animation: "float" },
    { emoji: "🦖", label: "T-Rex", animation: "shake" },
    { emoji: "🥚", label: "Huevo", animation: "wobble" },
    { emoji: "🌋", label: "Volcán", animation: "jelly" },
    { emoji: "🦴", label: "Hueso", animation: "bounce" },
    { emoji: "🌿", label: "Helecho", animation: "swing" },
    { emoji: "🪨", label: "Roca", animation: "pulse" },
    { emoji: "🐾", label: "Huella", animation: "heartbeat" },
    { emoji: "🔥", label: "Fuego", animation: "flash" },
    { emoji: "🌲", label: "Bosque", animation: "float" },
    { emoji: "💎", label: "Fósil", animation: "spin" },
    { emoji: "🌍", label: "Pangea", animation: "pulse" },
    { emoji: "☄️", label: "Meteorito", animation: "shake" },
    { emoji: "🦎", label: "Lagarto", animation: "wobble" },
    { emoji: "🐊", label: "Cocodrilo", animation: "jelly" },
    { emoji: "🪶", label: "Pluma", animation: "float" },
    { emoji: "🏔️", label: "Montaña", animation: "bounce" },
    { emoji: "🌊", label: "Mar antiguo", animation: "swing" },
    { emoji: "🦷", label: "Diente", animation: "shake" },
    { emoji: "🐢", label: "Tortuga", animation: "heartbeat" },
    { emoji: "🌺", label: "Flora", animation: "pulse" },
    { emoji: "⚡", label: "Trueno", animation: "flash" },
    { emoji: "🪺", label: "Nido", animation: "wobble" },
    { emoji: "🐉", label: "Dragón", animation: "bounce" },
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
    <span className={`inline-block leading-none select-none pointer-events-none ${SIZE_MAP[size]} ${ANIMATION_STYLES[animation]}`}>
      {emoji}
    </span>
  );
}

export function parseAnimatedKey(key: string): { emoji: string; animation: AnimationType } | null {
  if (!key.startsWith("animated:")) return null;
  const parts = key.split(":");
  if (parts.length < 3) return null;
  return { animation: parts[1] as AnimationType, emoji: parts[2] };
}

export function animatedKey(def: AnimatedStickerDef): string {
  return `animated:${def.animation}:${def.emoji}`;
}
