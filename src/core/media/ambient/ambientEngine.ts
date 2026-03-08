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

// ─── Soft background pad (very low volume, optional) ─────

function softPad(ctx: AudioContext, dest: AudioNode, freqs: number[], vol = 0.025) {
  const oscs: OscillatorNode[] = [];
  for (const f of freqs) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = f;
    osc.detune.value = (Math.random() - 0.5) * 10;
    const g = ctx.createGain();
    g.gain.value = vol;
    osc.connect(g).connect(dest);
    osc.start();
    oscs.push(osc);
  }
  return oscs;
}

// ─── BASE: Naturaleza – brisa suave, gotas, pájaros esporádicos ──

function buildBase(state: AmbientState) {
  const { ctx, master } = state;

  // Very soft wind pad
  softPad(ctx, master, [130, 196], 0.02);

  // Sporadic bird chirps (two alternating pitches)
  scheduleRandom(state, () => {
    const freq = Math.random() > 0.5 ? 2400 : 3100;
    ping(ctx, master, freq, "sine", 0.06, 0.15);
    // Sometimes a quick double-chirp
    if (Math.random() > 0.6) {
      setTimeout(() => ping(ctx, master, freq * 1.1, "sine", 0.04, 0.12), 120);
    }
  }, 2000, 6000);

  // Occasional water drop
  scheduleRandom(state, () => {
    const freq = 800 + Math.random() * 600;
    ping(ctx, master, freq, "sine", 0.05, 0.25);
  }, 3000, 8000);

  // Gentle rustling (very short noise)
  scheduleRandom(state, () => {
    noiseBurst(ctx, master, 2000, 0.03, 0.15);
  }, 4000, 10000);
}

// ─── REINO MÁGICO: Campanitas, arpas, destellos cristalinos ──

function buildReinoMagico(state: AmbientState) {
  const { ctx, master } = state;

  // Very subtle ethereal pad
  softPad(ctx, master, [261.6, 329.6, 392], 0.018);

  // Bell / chime – pentatonic notes
  const chimeNotes = [1047, 1175, 1319, 1568, 1760, 2093]; // C6-C7 pentatonic-ish
  scheduleRandom(state, () => {
    const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
    ping(ctx, master, note, "triangle", 0.10, 0.9);
  }, 1500, 4500);

  // Harp pluck arpeggios (2-4 quick descending notes)
  const harpNotes = [784, 659, 523, 440, 392]; // G5 → G4
  scheduleRandom(state, () => {
    const count = 2 + Math.floor(Math.random() * 3);
    const start = Math.floor(Math.random() * (harpNotes.length - count));
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        ping(ctx, master, harpNotes[start + i], "triangle", 0.07, 0.5);
      }, i * 140);
    }
  }, 3000, 8000);

  // Crystal sparkle (very high, quick)
  scheduleRandom(state, () => {
    const freq = 2600 + Math.random() * 1500;
    ping(ctx, master, freq, "sine", 0.05, 0.3);
    if (Math.random() > 0.5) {
      setTimeout(() => ping(ctx, master, freq * 1.2, "sine", 0.03, 0.2), 100);
    }
  }, 2500, 7000);

  // Magic wand whoosh (short filtered noise)
  scheduleRandom(state, () => {
    noiseBurst(ctx, master, 3000, 0.04, 0.2);
  }, 5000, 12000);
}

// ─── FÚTBOL: Estadio – oleadas de gente, silbatos, palmadas ──

function buildFutbol(state: AmbientState) {
  const { ctx, master } = state;

  // Low crowd murmur pad (subtle, not overpowering)
  const murmurLen = ctx.sampleRate * 3;
  const murmurBuf = ctx.createBuffer(1, murmurLen, ctx.sampleRate);
  const md = murmurBuf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < murmurLen; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    md[i] = last * 3.5;
  }
  const murmurSrc = ctx.createBufferSource();
  murmurSrc.buffer = murmurBuf;
  murmurSrc.loop = true;
  const murmurG = ctx.createGain();
  murmurG.gain.value = 0.10;
  const murmurBP = ctx.createBiquadFilter();
  murmurBP.type = "bandpass";
  murmurBP.frequency.value = 600;
  murmurBP.Q.value = 0.5;
  murmurSrc.connect(murmurG).connect(murmurBP).connect(master);
  murmurSrc.start();

  // Sporadic crowd roar swell
  scheduleRandom(state, () => {
    const now = ctx.currentTime;
    murmurG.gain.setValueAtTime(murmurG.gain.value, now);
    murmurG.gain.linearRampToValueAtTime(0.35, now + 0.8);
    murmurG.gain.linearRampToValueAtTime(0.10, now + 2.5);
  }, 5000, 15000);

  // Clapping bursts (quick noise)
  scheduleRandom(state, () => {
    const count = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      setTimeout(() => noiseBurst(ctx, master, 2500, 0.06, 0.04), i * 110);
    }
  }, 3000, 9000);

  // Whistle
  scheduleRandom(state, () => {
    ping(ctx, master, 3200, "sine", 0.08, 0.7);
  }, 8000, 20000);

  // Drum / bombo hit
  scheduleRandom(state, () => {
    ping(ctx, master, 60, "sine", 0.15, 0.3);
  }, 2000, 5000);
}

// ─── BALONCESTO: Pabellón – rebotes, zapatillas, bocina ──

function buildBaloncesto(state: AmbientState) {
  const { ctx, master } = state;

  // Light hall ambience pad
  const hallLen = ctx.sampleRate * 2;
  const hallBuf = ctx.createBuffer(1, hallLen, ctx.sampleRate);
  const hd = hallBuf.getChannelData(0);
  let hlast = 0;
  for (let i = 0; i < hallLen; i++) {
    hlast = (hlast + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    hd[i] = hlast * 3.5;
  }
  const hallSrc = ctx.createBufferSource();
  hallSrc.buffer = hallBuf;
  hallSrc.loop = true;
  const hallG = ctx.createGain();
  hallG.gain.value = 0.06;
  const hallBP = ctx.createBiquadFilter();
  hallBP.type = "bandpass";
  hallBP.frequency.value = 400;
  hallBP.Q.value = 2;
  hallSrc.connect(hallG).connect(hallBP).connect(master);
  hallSrc.start();

  // Ball bounce (low thud)
  scheduleRandom(state, () => {
    const bounces = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < bounces; i++) {
      setTimeout(() => {
        ping(ctx, master, 120 + Math.random() * 60, "sine", 0.12, 0.15);
      }, i * 200);
    }
  }, 2000, 6000);

  // Sneaker squeak
  scheduleRandom(state, () => {
    noiseBurst(ctx, master, 4000, 0.07, 0.06);
  }, 3000, 8000);

  // Crowd reaction burst
  scheduleRandom(state, () => {
    const now = ctx.currentTime;
    hallG.gain.setValueAtTime(hallG.gain.value, now);
    hallG.gain.linearRampToValueAtTime(0.25, now + 0.4);
    hallG.gain.linearRampToValueAtTime(0.06, now + 1.8);
  }, 6000, 14000);

  // Occasional buzzer
  scheduleRandom(state, () => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = 440;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.06, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc.connect(g).connect(master);
    osc.start(now);
    osc.stop(now + 1.3);
  }, 15000, 35000);
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
