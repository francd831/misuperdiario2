/**
 * Animated Frame component – renders CSS-based decorative borders with animations.
 * Each frame uses border/outline/box-shadow effects to create animated picture frames.
 */

export type FrameAnimationType =
  | "glow-pulse"
  | "rainbow-border"
  | "dashed-spin"
  | "sparkle-corners"
  | "neon-flicker"
  | "golden-shimmer"
  | "frost-breathe"
  | "fire-border"
  | "dotted-march"
  | "double-pulse";

export interface AnimatedFrameDef {
  id: string;
  label: string;
  animation: FrameAnimationType;
  /** Preview emoji/icon */
  icon: string;
  /** CSS variables for theming the frame */
  color1: string;
  color2: string;
}

/** Animated frames per pack – 5 each */
export const ANIMATED_FRAMES: Record<string, AnimatedFrameDef[]> = {
  base: [
    { id: "base-glow", label: "Brillo", animation: "glow-pulse", icon: "✨", color1: "#f59e0b", color2: "#8b5cf6" },
    { id: "base-rainbow", label: "Arcoíris", animation: "rainbow-border", icon: "🌈", color1: "#ef4444", color2: "#3b82f6" },
    { id: "base-dashed", label: "Rayas", animation: "dashed-spin", icon: "💫", color1: "#10b981", color2: "#06b6d4" },
    { id: "base-neon", label: "Neón", animation: "neon-flicker", icon: "💡", color1: "#a855f7", color2: "#ec4899" },
    { id: "base-dots", label: "Puntos", animation: "dotted-march", icon: "⭕", color1: "#f97316", color2: "#eab308" },
  ],
  reinoMagico: [
    { id: "rm-shimmer", label: "Dorado", animation: "golden-shimmer", icon: "👑", color1: "#fbbf24", color2: "#f59e0b" },
    { id: "rm-frost", label: "Hielo", animation: "frost-breathe", icon: "❄️", color1: "#93c5fd", color2: "#c4b5fd" },
    { id: "rm-sparkle", label: "Hada", animation: "sparkle-corners", icon: "🧚", color1: "#f0abfc", color2: "#c084fc" },
    { id: "rm-rainbow", label: "Mágico", animation: "rainbow-border", icon: "🦄", color1: "#f472b6", color2: "#818cf8" },
    { id: "rm-neon", label: "Cristal", animation: "neon-flicker", icon: "💎", color1: "#67e8f9", color2: "#a78bfa" },
  ],
  futbol: [
    { id: "fut-neon", label: "Estadio", animation: "neon-flicker", icon: "🏟️", color1: "#22c55e", color2: "#16a34a" },
    { id: "fut-fire", label: "Fuego", animation: "fire-border", icon: "🔥", color1: "#ef4444", color2: "#f97316" },
    { id: "fut-gold", label: "Campeón", animation: "golden-shimmer", icon: "🏆", color1: "#eab308", color2: "#f59e0b" },
    { id: "fut-pulse", label: "Victoria", animation: "double-pulse", icon: "⚽", color1: "#3b82f6", color2: "#1d4ed8" },
    { id: "fut-glow", label: "Gol", animation: "glow-pulse", icon: "🥅", color1: "#10b981", color2: "#34d399" },
  ],
  baloncesto: [
    { id: "bb-fire", label: "Fuego", animation: "fire-border", icon: "🔥", color1: "#f97316", color2: "#ef4444" },
    { id: "bb-neon", label: "Cancha", animation: "neon-flicker", icon: "🏀", color1: "#f97316", color2: "#ea580c" },
    { id: "bb-gold", label: "MVP", animation: "golden-shimmer", icon: "🏆", color1: "#fbbf24", color2: "#d97706" },
    { id: "bb-pulse", label: "Slam", animation: "double-pulse", icon: "💥", color1: "#dc2626", color2: "#7c3aed" },
    { id: "bb-glow", label: "Luz", animation: "glow-pulse", icon: "💪", color1: "#06b6d4", color2: "#3b82f6" },
  ],
};

/** Create key for animated frame overlay items */
export function animatedFrameKey(def: AnimatedFrameDef): string {
  return `anim-frame:${def.id}`;
}

/** Parse animated frame key */
export function parseAnimatedFrameKey(key: string): AnimatedFrameDef | null {
  if (!key.startsWith("anim-frame:")) return null;
  const id = key.replace("anim-frame:", "");
  for (const defs of Object.values(ANIMATED_FRAMES)) {
    const found = defs.find((d) => d.id === id);
    if (found) return found;
  }
  return null;
}

/** The rendered animated frame overlay */
export function AnimatedFrame({
  def,
  className = "",
}: {
  def: AnimatedFrameDef;
  className?: string;
}) {
  const { animation, color1, color2 } = def;

  const baseStyle: React.CSSProperties = {
    "--frame-c1": color1,
    "--frame-c2": color2,
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    borderRadius: "0.5rem",
  } as React.CSSProperties;

  switch (animation) {
    case "glow-pulse":
      return (
        <div
          className={`animate-[frm-glow-pulse_2s_ease-in-out_infinite] ${className}`}
          style={{
            ...baseStyle,
            border: `3px solid ${color1}`,
            boxShadow: `0 0 15px ${color1}80, inset 0 0 15px ${color1}40`,
          }}
        />
      );

    case "rainbow-border":
      return (
        <div
          className={`animate-[frm-rainbow_3s_linear_infinite] ${className}`}
          style={{
            ...baseStyle,
            border: "3px solid transparent",
            backgroundImage: `linear-gradient(var(--background, #000), var(--background, #000)), linear-gradient(var(--frm-angle, 0deg), ${color1}, ${color2}, #10b981, #eab308, ${color1})`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        />
      );

    case "dashed-spin":
      return (
        <div className={className} style={baseStyle}>
          <svg className="absolute inset-0 w-full h-full animate-[frm-dash-march_2s_linear_infinite]" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
            <rect x="1" y="1" width="98" height="98" rx="4" stroke={color1} strokeWidth="2" strokeDasharray="8 4" vectorEffect="non-scaling-stroke" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-[frm-dash-march_3s_linear_infinite_reverse]" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
            <rect x="3" y="3" width="94" height="94" rx="3" stroke={color2} strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.6" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      );

    case "sparkle-corners":
      return (
        <div className={className} style={baseStyle}>
          <div style={{ ...baseStyle, border: `2px solid ${color1}60` }} />
          {/* Corner sparkles */}
          {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
            <span
              key={pos}
              className={`absolute ${pos} animate-[frm-corner-sparkle_1.5s_ease-in-out_infinite]`}
              style={{
                fontSize: "16px",
                animationDelay: `${i * 0.3}s`,
                transform: "translate(-30%, -30%)",
                filter: `drop-shadow(0 0 4px ${color1})`,
              }}
            >
              ✦
            </span>
          ))}
        </div>
      );

    case "neon-flicker":
      return (
        <div
          className={`animate-[frm-neon-flicker_2s_ease-in-out_infinite] ${className}`}
          style={{
            ...baseStyle,
            border: `2px solid ${color1}`,
            boxShadow: `0 0 8px ${color1}, 0 0 20px ${color1}60, inset 0 0 8px ${color1}30`,
          }}
        />
      );

    case "golden-shimmer":
      return (
        <div
          className={`animate-[frm-shimmer_2.5s_ease-in-out_infinite] ${className}`}
          style={{
            ...baseStyle,
            border: `3px solid ${color1}`,
            boxShadow: `0 0 10px ${color1}60, 0 0 30px ${color2}30`,
          }}
        />
      );

    case "frost-breathe":
      return (
        <div
          className={`animate-[frm-frost_3s_ease-in-out_infinite] ${className}`}
          style={{
            ...baseStyle,
            border: `2px solid ${color1}90`,
            boxShadow: `inset 0 0 20px ${color1}30, 0 0 15px ${color2}40`,
          }}
        />
      );

    case "fire-border":
      return (
        <div
          className={`animate-[frm-fire_0.8s_ease-in-out_infinite_alternate] ${className}`}
          style={{
            ...baseStyle,
            border: `3px solid ${color1}`,
            boxShadow: `0 0 10px ${color1}80, 0 0 25px ${color2}50, 0 -8px 20px ${color1}40`,
          }}
        />
      );

    case "dotted-march":
      return (
        <div className={className} style={baseStyle}>
          <svg className="absolute inset-0 w-full h-full animate-[frm-dash-march_4s_linear_infinite]" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
            <rect x="2" y="2" width="96" height="96" rx="4" stroke={color1} strokeWidth="3" strokeDasharray="2 4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      );

    case "double-pulse":
      return (
        <div className={className} style={baseStyle}>
          <div
            className="absolute inset-0 animate-[frm-double-pulse_2s_ease-in-out_infinite] rounded-lg"
            style={{ border: `3px solid ${color1}`, boxShadow: `0 0 10px ${color1}50` }}
          />
          <div
            className="absolute inset-1 animate-[frm-double-pulse_2s_ease-in-out_infinite] rounded-md"
            style={{ border: `2px solid ${color2}`, boxShadow: `0 0 8px ${color2}40`, animationDelay: "0.5s" }}
          />
        </div>
      );

    default:
      return null;
  }
}
