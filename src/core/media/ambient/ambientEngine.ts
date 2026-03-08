/**
 * Ambient Sound Engine v2 – sporadic, thematic sounds via Web Audio API.
 * Instead of constant drones, each pack triggers short recognisable sounds
 * (chimes, plucks, bounces …) at random intervals with silence in between.
 */

interface AmbientState {
  ctx: AudioContext;
  master: GainNode;
  timers: ReturnType<typeof setTimeout>[];
  alive: boolean;
}

let current: AmbientState | null = null;
let currentPack: string | null = null;
let _enabled = false;

// ─── Helpers ─────────────────────────────────────────────

/** Play a short sine/triangle "ping" with an exponential decay envelope */
function ping(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  type: OscillatorType = "sine",
  volume = 0.12,
  decay = 0.6,
) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(volume, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
  osc.connect(g).connect(dest);
  osc.start(now);
  osc.stop(now + decay + 0.05);
}

/** Play a quick noise burst (sneaker squeak, crowd clap, etc.) */
function noiseBurst(
  ctx: AudioContext,
  dest: AudioNode,
  hpFreq: number,
  volume = 0.08,
  duration = 0.08,
) {
  const now = ctx.currentTime;
  const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = hpFreq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(volume, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  src.connect(hp).connect(g).connect(dest);
  src.start(now);
  src.stop(now + duration + 0.02);
}

/** Schedule a callback at random intervals (ms range) while alive */
function scheduleRandom(
  state: AmbientState,
  fn: () => void,
  minMs: number,
  maxMs: number,
) {
  function tick() {
    if (!state.alive) return;
    fn();
    const next = minMs + Math.random() * (maxMs - minMs);
    state.timers.push(setTimeout(tick, next));
  }
  // First trigger after a random delay
  const first = minMs + Math.random() * (maxMs - minMs);
  state.timers.push(setTimeout(tick, first));
}

// ─── BASE: Naturaleza – pájaros, gotas, crujidos ──

function buildBase(state: AmbientState) {
  const { ctx, master } = state;

  // Bird chirps
  scheduleRandom(state, () => {
    const freq = Math.random() > 0.5 ? 2400 : 3100;
    ping(ctx, master, freq, "sine", 0.08, 0.15);
    if (Math.random() > 0.5) {
      setTimeout(() => ping(ctx, master, freq * 1.1, "sine", 0.05, 0.12), 120);
    }
  }, 2500, 7000);

  // Water drops
  scheduleRandom(state, () => {
    const freq = 800 + Math.random() * 600;
    ping(ctx, master, freq, "sine", 0.06, 0.3);
  }, 3000, 9000);

  // Leaf rustle
  scheduleRandom(state, () => {
    noiseBurst(ctx, master, 2000, 0.04, 0.12);
  }, 5000, 12000);

  // Cricket chirp (high double-ping)
  scheduleRandom(state, () => {
    ping(ctx, master, 4200, "sine", 0.04, 0.06);
    setTimeout(() => ping(ctx, master, 4200, "sine", 0.04, 0.06), 80);
  }, 4000, 10000);
}

// ─── REINO MÁGICO: Campanitas, arpas, destellos ──

function buildReinoMagico(state: AmbientState) {
  const { ctx, master } = state;

  // Bell chimes – pentatonic
  const chimeNotes = [1047, 1175, 1319, 1568, 1760, 2093];
  scheduleRandom(state, () => {
    const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
    ping(ctx, master, note, "triangle", 0.12, 1.2);
  }, 2000, 5000);

  // Harp arpeggios (descending plucks)
  const harpNotes = [784, 659, 523, 440, 392];
  scheduleRandom(state, () => {
    const count = 2 + Math.floor(Math.random() * 3);
    const start = Math.floor(Math.random() * (harpNotes.length - count));
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        ping(ctx, master, harpNotes[start + i], "triangle", 0.08, 0.6);
      }, i * 150);
    }
  }, 4000, 10000);

  // Crystal sparkle
  scheduleRandom(state, () => {
    const freq = 2600 + Math.random() * 1500;
    ping(ctx, master, freq, "sine", 0.06, 0.25);
    if (Math.random() > 0.4) {
      setTimeout(() => ping(ctx, master, freq * 1.25, "sine", 0.04, 0.18), 90);
    }
  }, 3000, 7000);

  // Gentle wind chime (cluster of high pings)
  scheduleRandom(state, () => {
    const base = 1800 + Math.random() * 400;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        ping(ctx, master, base + i * 200, "sine", 0.05, 0.4);
      }, i * 100);
    }
  }, 6000, 14000);

  // Fairy dust whoosh
  scheduleRandom(state, () => {
    noiseBurst(ctx, master, 3500, 0.04, 0.18);
  }, 7000, 15000);
}

// ─── FÚTBOL: Chuts, gol, aplausos, silbato ──

function buildFutbol(state: AmbientState) {
  const { ctx, master } = state;

  // Kick / chut (low thump + mid slap)
  scheduleRandom(state, () => {
    ping(ctx, master, 80, "sine", 0.18, 0.12);
    ping(ctx, master, 350, "triangle", 0.08, 0.08);
  }, 2500, 6000);

  // Crowd applause burst (rapid noise claps)
  scheduleRandom(state, () => {
    const count = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      setTimeout(() => noiseBurst(ctx, master, 2500, 0.07, 0.04), i * 90);
    }
  }, 4000, 10000);

  // "GOOOL" crowd roar (rising noise swell)
  scheduleRandom(state, () => {
    const now = ctx.currentTime;
    const len = ctx.sampleRate;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 800;
    bp.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.01, now);
    g.gain.linearRampToValueAtTime(0.20, now + 0.4);
    g.gain.linearRampToValueAtTime(0.0001, now + 1.5);
    src.connect(bp).connect(g).connect(master);
    src.start(now);
    src.stop(now + 1.6);
  }, 10000, 25000);

  // Whistle
  scheduleRandom(state, () => {
    ping(ctx, master, 3200, "sine", 0.10, 0.6);
  }, 8000, 20000);

  // Bombo drum hit
  scheduleRandom(state, () => {
    ping(ctx, master, 55, "sine", 0.16, 0.25);
  }, 3000, 7000);
}

// ─── BALONCESTO: Rebotes, zapatillas, bocina ──

function buildBaloncesto(state: AmbientState) {
  const { ctx, master } = state;

  // Ball bounce (low thud)
  scheduleRandom(state, () => {
    const bounces = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < bounces; i++) {
      setTimeout(() => {
        ping(ctx, master, 120 + Math.random() * 60, "sine", 0.14, 0.12);
      }, i * 180);
    }
  }, 2500, 6000);

  // Sneaker squeak
  scheduleRandom(state, () => {
    noiseBurst(ctx, master, 4000, 0.08, 0.05);
  }, 3000, 8000);

  // Rim hit (metallic ping)
  scheduleRandom(state, () => {
    ping(ctx, master, 800, "triangle", 0.10, 0.4);
    ping(ctx, master, 1600, "sine", 0.05, 0.2);
  }, 5000, 12000);

  // Short crowd cheer
  scheduleRandom(state, () => {
    const count = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      setTimeout(() => noiseBurst(ctx, master, 2000, 0.06, 0.05), i * 100);
    }
  }, 6000, 14000);

  // Buzzer (occasional)
  scheduleRandom(state, () => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = 440;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.07, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
    osc.connect(g).connect(master);
    osc.start(now);
    osc.stop(now + 1.1);
  }, 18000, 40000);
}

// ─── Public API ──────────────────────────────────────────

function getBuilder(packId: string) {
  switch (packId) {
    case "futbol": return buildFutbol;
    case "baloncesto": return buildBaloncesto;
    case "reinoMagico": return buildReinoMagico;
    default: return buildBase;
  }
}

function stopCurrent() {
  if (!current) return;
  const { ctx, master, timers } = current;
  current.alive = false;
  timers.forEach(clearTimeout);
  const now = ctx.currentTime;
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 0.5);
  setTimeout(() => {
    try { ctx.close(); } catch {}
  }, 600);
  current = null;
  currentPack = null;
}

function startPack(packId: string) {
  stopCurrent();

  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const state: AmbientState = { ctx, master, timers: [], alive: true };
  current = state;
  currentPack = packId;

  const builder = getBuilder(packId);
  builder(state);

  // Fade in
  const now = ctx.currentTime;
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.8, now + 1.5);
}

export const ambientEngine = {
  start(packId: string) {
    _enabled = true;
    if (currentPack === packId && current) return;
    startPack(packId);
  },

  stop() {
    _enabled = false;
    stopCurrent();
  },

  switchPack(packId: string) {
    if (!_enabled) return;
    if (currentPack === packId) return;
    startPack(packId);
  },

  isEnabled() {
    return _enabled;
  },

  setVolume(vol: number) {
    if (current?.master) {
      const now = current.ctx.currentTime;
      current.master.gain.setValueAtTime(current.master.gain.value, now);
      current.master.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, vol)), now + 0.3);
    }
  },
};
