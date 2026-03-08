import { useMemo } from "react";
import type { EffectDef } from "./effectDefinitions";

/**
 * Renders a single full-screen animated effect overlay.
 * Each effect type has its own animation logic using CSS keyframes + inline styles.
 */
export function EffectRenderer({ def }: { def: EffectDef }) {
  const particles = useMemo(() => {
    return Array.from({ length: def.count }, (_, i) => ({
      id: i,
      emoji: def.particles[i % def.particles.length],
      // Randomize positions and delays deterministically from index
      left: ((i * 37 + 11) % 100),
      top: ((i * 53 + 7) % 100),
      delay: ((i * 0.3) % def.duration),
      size: 1 + (i % 3) * 0.4,
      offsetX: ((i * 17) % 40) - 20,
    }));
  }, [def]);

  const renderEffect = () => {
    switch (def.animation) {
      // ── Particle rain effects ──
      case "stardust":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-fall pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              top: `-8%`,
              fontSize: `${p.size}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ));

      case "rainbow-shine":
        return (
          <div className="absolute inset-0 pointer-events-none animate-fx-rainbow-sweep overflow-hidden">
            <div
              className="absolute h-[200%] w-[30%] -rotate-12"
              style={{
                background: "linear-gradient(180deg, rgba(255,0,0,0.15), rgba(255,165,0,0.15), rgba(255,255,0,0.15), rgba(0,128,0,0.15), rgba(0,0,255,0.15), rgba(75,0,130,0.15), rgba(238,130,238,0.15))",
                animationDuration: `${def.duration}s`,
              }}
            />
            <span className="absolute text-6xl top-[10%] left-[15%] animate-fx-pulse pointer-events-none select-none">🌈</span>
          </div>
        );

      case "magic-portal":
        return (
          <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="animate-fx-spin-slow text-7xl select-none">🌀</div>
            </div>
            {particles.map((p) => (
              <span
                key={p.id}
                className="absolute animate-fx-spiral pointer-events-none select-none"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  fontSize: `${p.size}rem`,
                  animationDuration: `${def.duration}s`,
                  animationDelay: `${p.delay}s`,
                }}
              >
                {p.emoji}
              </span>
            ))}
          </>
        );

      case "dino-steps":
        return particles.map((p, i) => (
          <span
            key={p.id}
            className="absolute animate-fx-stomp pointer-events-none select-none"
            style={{
              left: `${15 + i * 14}%`,
              bottom: `${10 + (i % 2) * 15}%`,
              fontSize: "2.5rem",
              animationDuration: `${def.duration}s`,
              animationDelay: `${i * 0.6}s`,
              transform: `rotate(${i % 2 === 0 ? -20 : 20}deg)`,
            }}
          >
            🦶
          </span>
        ));

      case "leaves-wind":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-drift pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              top: `-5%`,
              fontSize: `${p.size}rem`,
              animationDuration: `${def.duration + p.delay}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ));

      case "volcano-eruption":
        return (
          <>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-6xl animate-fx-pulse pointer-events-none select-none">🌋</span>
            {particles.map((p) => (
              <span
                key={p.id}
                className="absolute animate-fx-erupt pointer-events-none select-none"
                style={{
                  left: `${40 + (p.id % 5) * 5}%`,
                  bottom: `5%`,
                  fontSize: `${p.size}rem`,
                  animationDuration: `${def.duration}s`,
                  animationDelay: `${p.delay}s`,
                  ['--fx-offset-x' as string]: `${p.offsetX}px`,
                }}
              >
                {p.emoji}
              </span>
            ))}
          </>
        );

      case "confetti-burst":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-confetti pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              top: `50%`,
              fontSize: `${p.size}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
              ['--fx-offset-x' as string]: `${p.offsetX * 3}px`,
            }}
          >
            {p.emoji}
          </span>
        ));

      case "scoreboard-flash":
        return (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none animate-fx-flash">
            <div className="bg-black/70 rounded-lg px-6 py-2 flex items-center gap-3 shadow-lg">
              <span className="text-2xl">⚽</span>
              <div className="text-white font-bold text-xl font-mono tracking-wider animate-fx-pulse">
                1 — 0
              </div>
              <span className="text-2xl">⚽</span>
            </div>
          </div>
        );

      case "ball-spin":
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-7xl animate-fx-spin-fast select-none">⚽</span>
          </div>
        );

      case "net-swish":
        return (
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="relative">
              <span className="text-6xl animate-fx-swish-down select-none block">🏀</span>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-8 border-2 border-orange-400/60 rounded-b-full animate-fx-net-wobble" />
            </div>
          </div>
        );

      case "ball-bounce":
        return (
          <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 pointer-events-none">
            <span className="text-6xl animate-fx-bounce-ball select-none inline-block">🏀</span>
          </div>
        );

      case "nba-scoreboard":
        return (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none animate-fx-flash">
            <div className="bg-gradient-to-r from-red-900/90 via-black/90 to-blue-900/90 rounded-lg px-5 py-2 shadow-xl border border-yellow-500/40">
              <div className="flex items-center gap-4">
                <span className="text-xl">🏀</span>
                <div className="text-center">
                  <div className="text-yellow-400 text-[10px] font-bold tracking-widest uppercase">Score</div>
                  <div className="text-white font-bold text-2xl font-mono tracking-wider animate-fx-pulse">
                    102 — 98
                  </div>
                </div>
                <span className="text-xl">🏆</span>
              </div>
            </div>
          </div>
        );

      case "meteors":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-meteor pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              top: `-10%`,
              fontSize: `${p.size}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ));

      case "shooting-stars":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-shooting-star pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              top: `${p.top * 0.5}%`,
              fontSize: `${p.size * 0.8}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ));

      case "planet-orbit":
        return particles.map((p, i) => (
          <div
            key={p.id}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span
              className="absolute animate-fx-orbit select-none"
              style={{
                fontSize: `${2 + i * 0.5}rem`,
                animationDuration: `${def.duration + i * 2}s`,
                animationDelay: `${i * 1.5}s`,
                ['--fx-orbit-radius' as string]: `${60 + i * 30}px`,
              }}
            >
              {p.emoji}
            </span>
          </div>
        ));

      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[6]">
      {renderEffect()}
    </div>
  );
}
