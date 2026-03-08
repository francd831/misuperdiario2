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
            🐾
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

      // ── Candy rain (spiraling down with wobble) ──
      case "candy-rain":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-candy-rain pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              top: `-8%`,
              fontSize: `${p.size * 1.2}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Sweet pop (items popping up from random spots) ──
      case "sweet-pop":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-sweet-pop pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              fontSize: `${p.size * 1.3}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Frosting wave (horizontal wave of particles) ──
      case "frosting-wave":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-frosting-wave pointer-events-none select-none"
            style={{
              left: `-10%`,
              top: `${30 + (p.id % 4) * 12}%`,
              fontSize: `${p.size}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Paw walk (paws appearing one by one in a path) ──
      case "paw-walk":
        return particles.map((p, i) => (
          <span
            key={p.id}
            className="absolute animate-fx-paw-walk pointer-events-none select-none"
            style={{
              left: `${10 + i * 11}%`,
              bottom: `${15 + (i % 2) * 20}%`,
              fontSize: "2.2rem",
              animationDuration: `${def.duration}s`,
              animationDelay: `${i * 0.5}s`,
              transform: `rotate(${i % 2 === 0 ? -15 : 15}deg)`,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Hearts rising from bottom ──
      case "hearts-rise":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-hearts-rise pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              bottom: `-5%`,
              fontSize: `${p.size}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
              ['--fx-sway' as string]: `${p.offsetX}px`,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Bubbles floating up ──
      case "bubbles-float":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-bubbles-float pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              bottom: `-8%`,
              fontSize: `${0.8 + (p.id % 4) * 0.5}rem`,
              animationDuration: `${def.duration + p.delay * 0.5}s`,
              animationDelay: `${p.delay}s`,
              ['--fx-sway' as string]: `${p.offsetX * 1.5}px`,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Spell cast (radial burst from center) ──
      case "spell-cast":
        return (
          <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-5xl animate-fx-pulse select-none">🪄</span>
            </div>
            {particles.map((p) => (
              <span
                key={p.id}
                className="absolute animate-fx-spell-cast pointer-events-none select-none"
                style={{
                  left: `50%`,
                  top: `50%`,
                  fontSize: `${p.size}rem`,
                  animationDuration: `${def.duration}s`,
                  animationDelay: `${p.delay}s`,
                  ['--fx-angle' as string]: `${(p.id / def.count) * 360}deg`,
                  ['--fx-dist' as string]: `${80 + (p.id % 3) * 40}px`,
                }}
              >
                {p.emoji}
              </span>
            ))}
          </>
        );

      // ── Rune glow (symbols fading in and out at random positions) ──
      case "rune-glow":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-rune-glow pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              fontSize: `${p.size * 1.5}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Potion bubbles (rising from bottom with wobble) ──
      case "potion-bubble":
        return (
          <>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-5xl animate-fx-pulse pointer-events-none select-none">🧪</span>
            {particles.map((p) => (
              <span
                key={p.id}
                className="absolute animate-fx-potion-bubble pointer-events-none select-none"
                style={{
                  left: `${35 + (p.id % 6) * 5}%`,
                  bottom: `3%`,
                  fontSize: `${0.8 + (p.id % 3) * 0.4}rem`,
                  animationDuration: `${def.duration}s`,
                  animationDelay: `${p.delay}s`,
                  ['--fx-sway' as string]: `${p.offsetX}px`,
                }}
              >
                {p.emoji}
              </span>
            ))}
          </>
        );

      // ── Wave rock (items swaying at bottom) ──
      case "wave-rock":
        return particles.map((p, i) => (
          <span
            key={p.id}
            className="absolute animate-fx-wave-rock pointer-events-none select-none"
            style={{
              left: `${i * 10}%`,
              bottom: `${2 + (i % 3) * 4}%`,
              fontSize: `${p.size * 1.3}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Cannon blast (items shooting from left side) ──
      case "cannon-blast":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-cannon-blast pointer-events-none select-none"
            style={{
              left: `0%`,
              top: `${40 + (p.id % 3) * 8}%`,
              fontSize: `${p.size * 1.2}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
              ['--fx-target-x' as string]: `${50 + p.offsetX * 2}vw`,
              ['--fx-target-y' as string]: `${-20 - (p.id % 4) * 15}vh`,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Treasure sparkle (random sparkles appearing) ──
      case "treasure-sparkle":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-treasure-sparkle pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              fontSize: `${p.size * 1.2}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Speed lines (horizontal streaks) ──
      case "speed-lines":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-speed-lines pointer-events-none select-none"
            style={{
              left: `110%`,
              top: `${p.top}%`,
              fontSize: `${p.size}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: 0.7,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Drift smoke (smoke rising from bottom corners) ──
      case "drift-smoke":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-drift-smoke pointer-events-none select-none"
            style={{
              left: `${p.id % 2 === 0 ? 5 + (p.id % 5) * 3 : 75 + (p.id % 5) * 3}%`,
              bottom: `0%`,
              fontSize: `${p.size * 1.5}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
              ['--fx-sway' as string]: `${p.offsetX}px`,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Finish flag (waving checkered flag) ──
      case "finish-flag":
        return (
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="flex flex-col items-center gap-2 animate-fx-finish-flag">
              <span className="text-7xl select-none">🏁</span>
              <div className="flex gap-3">
                <span className="text-4xl animate-fx-pulse select-none">🏎️</span>
                <span className="text-4xl animate-fx-pulse select-none" style={{ animationDelay: "0.5s" }}>🏆</span>
              </div>
            </div>
          </div>
        );

      // ── Paint drip (drips falling from top) ──
      case "paint-drip-down":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-paint-drip pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              top: `-5%`,
              fontSize: `${p.size * 1.1}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
        ));

      // ── Brush sweep (brush sweeping across) ──
      case "brush-sweep":
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="animate-fx-brush-sweep absolute top-[40%] flex items-center gap-2">
              <span className="text-6xl select-none">🖌️</span>
              <div className="h-4 w-40 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-400 opacity-50" />
            </div>
          </div>
        );

      // ── Color splat (random color explosions) ──
      case "color-splat":
        return particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-fx-color-splat pointer-events-none select-none"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              fontSize: `${p.size * 1.5}rem`,
              animationDuration: `${def.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </span>
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
