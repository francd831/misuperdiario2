/**
 * Ambient Sound Engine – procedural audio via Web Audio API.
 * Each pack gets a unique, subtle soundscape.
 */

type PackSoundscape = "base" | "futbol" | "baloncesto" | "reinoMagico";

interface AmbientNodes {
  ctx: AudioContext;
  master: GainNode;
  nodes: AudioNode[];
  sources: (AudioBufferSourceNode | OscillatorNode)[];
}

let current: AmbientNodes | null = null;
let currentPack: string | null = null;
let _enabled = false;

// ─── Noise buffer generator ──────────────────────────────

function createNoiseBuffer(ctx: AudioContext, seconds = 2, type: "white" | "pink" | "brown" = "white"): AudioBuffer {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  let last = 0;

  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (type === "white") {
      data[i] = white;
    } else if (type === "pink") {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    } else {
      // Brown noise
      data[i] = (last + 0.02 * white) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
  }
  return buf;
}

function loopNoise(ctx: AudioContext, buffer: AudioBuffer, gain: GainNode): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.connect(gain);
  src.start();
  return src;
}

// ─── Soundscape factories ────────────────────────────────

function buildBase(ctx: AudioContext, master: GainNode): AmbientNodes {
  const nodes: AudioNode[] = [];
  const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

  // Gentle wind (brown noise, low-passed)
  const windGain = ctx.createGain();
  windGain.gain.value = 0.15;
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = "lowpass";
  windFilter.frequency.value = 400;
  windGain.connect(windFilter).connect(master);
  const windBuf = createNoiseBuffer(ctx, 3, "brown");
  sources.push(loopNoise(ctx, windBuf, windGain));
  nodes.push(windGain, windFilter);

  // Soft drone (two detuned sine waves)
  for (const freq of [110, 165]) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = 0.03;
    osc.connect(g).connect(master);
    osc.start();
    sources.push(osc);
    nodes.push(g);
  }

  return { ctx, master, nodes, sources };
}

function buildFutbol(ctx: AudioContext, master: GainNode): AmbientNodes {
  const nodes: AudioNode[] = [];
  const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

  // Distant crowd murmur (pink noise, band-passed)
  const crowdGain = ctx.createGain();
  crowdGain.gain.value = 0.12;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 600;
  bp.Q.value = 0.8;
  crowdGain.connect(bp).connect(master);
  const noiseBuf = createNoiseBuffer(ctx, 3, "pink");
  sources.push(loopNoise(ctx, noiseBuf, crowdGain));
  nodes.push(crowdGain, bp);

  // Subtle low rumble
  const rumble = ctx.createOscillator();
  rumble.type = "sine";
  rumble.frequency.value = 55;
  const rg = ctx.createGain();
  rg.gain.value = 0.04;
  rumble.connect(rg).connect(master);
  rumble.start();
  sources.push(rumble);
  nodes.push(rg);

  // LFO to modulate crowd volume (swell effect)
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.15;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain).connect(crowdGain.gain);
  lfo.start();
  sources.push(lfo);
  nodes.push(lfoGain);

  return { ctx, master, nodes, sources };
}

function buildBaloncesto(ctx: AudioContext, master: GainNode): AmbientNodes {
  const nodes: AudioNode[] = [];
  const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

  // Indoor gym ambiance (filtered white noise = ventilation)
  const ventGain = ctx.createGain();
  ventGain.gain.value = 0.08;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 300;
  ventGain.connect(lp).connect(master);
  const noiseBuf = createNoiseBuffer(ctx, 2, "white");
  sources.push(loopNoise(ctx, noiseBuf, ventGain));
  nodes.push(ventGain, lp);

  // Subtle reverb-like resonance
  for (const freq of [220, 330]) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = 0.015;
    osc.connect(g).connect(master);
    osc.start();
    sources.push(osc);
    nodes.push(g);
  }

  // Slight echo of crowd (pink noise, very low)
  const crowdGain = ctx.createGain();
  crowdGain.gain.value = 0.05;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 800;
  bp.Q.value = 0.5;
  crowdGain.connect(bp).connect(master);
  const pinkBuf = createNoiseBuffer(ctx, 2, "pink");
  sources.push(loopNoise(ctx, pinkBuf, crowdGain));
  nodes.push(crowdGain, bp);

  return { ctx, master, nodes, sources };
}

function buildReinoMagico(ctx: AudioContext, master: GainNode): AmbientNodes {
  const nodes: AudioNode[] = [];
  const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

  // Ethereal pad (detuned triangle waves)
  const padFreqs = [261.6, 329.6, 392]; // C4, E4, G4 major chord
  for (const freq of padFreqs) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    // Slight detuning for shimmer
    osc.detune.value = (Math.random() - 0.5) * 10;
    const g = ctx.createGain();
    g.gain.value = 0.02;
    osc.connect(g).connect(master);
    osc.start();
    sources.push(osc);
    nodes.push(g);
  }

  // Sparkle effect (very high, quiet sine with LFO)
  const sparkle = ctx.createOscillator();
  sparkle.type = "sine";
  sparkle.frequency.value = 2093; // C7
  const sg = ctx.createGain();
  sg.gain.value = 0.008;
  sparkle.connect(sg).connect(master);
  sparkle.start();
  sources.push(sparkle);
  nodes.push(sg);

  // Slow LFO for the sparkle
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.3;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 0.008;
  lfo.connect(lfoG).connect(sg.gain);
  lfo.start();
  sources.push(lfo);
  nodes.push(lfoG);

  // Gentle breath of wind
  const windGain = ctx.createGain();
  windGain.gain.value = 0.06;
  const wf = ctx.createBiquadFilter();
  wf.type = "lowpass";
  wf.frequency.value = 500;
  windGain.connect(wf).connect(master);
  const brownBuf = createNoiseBuffer(ctx, 3, "brown");
  sources.push(loopNoise(ctx, brownBuf, windGain));
  nodes.push(windGain, wf);

  return { ctx, master, nodes, sources };
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
  // Fade out
  const { ctx, master, sources } = current;
  const now = ctx.currentTime;
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 0.5);
  setTimeout(() => {
    sources.forEach((s) => { try { s.stop(); } catch {} });
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

  const builder = getBuilder(packId);
  current = builder(ctx, master);
  currentPack = packId;

  // Fade in
  const now = ctx.currentTime;
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.6, now + 1.5);
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
