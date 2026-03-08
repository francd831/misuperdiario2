/**
 * Ambient Sound Engine – procedural audio via Web Audio API.
 * Each pack gets a unique, clearly identifiable soundscape.
 */

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
      data[i] = (last + 0.02 * white) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
  }
  return buf;
}

function loopNoise(ctx: AudioContext, buffer: AudioBuffer, dest: AudioNode): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.connect(dest);
  src.start();
  return src;
}

// ─── BASE: Naturaleza – pájaros, agua, brisa ─────────────

function buildBase(ctx: AudioContext, master: GainNode): AmbientNodes {
  const nodes: AudioNode[] = [];
  const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

  // Gentle stream (brown noise, moderate)
  const streamGain = ctx.createGain();
  streamGain.gain.value = 0.30;
  const streamLP = ctx.createBiquadFilter();
  streamLP.type = "lowpass";
  streamLP.frequency.value = 600;
  streamGain.connect(streamLP).connect(master);
  sources.push(loopNoise(ctx, createNoiseBuffer(ctx, 3, "brown"), streamGain));
  nodes.push(streamGain, streamLP);

  // Bird chirps (two alternating high tones)
  for (const [freq, rate] of [[2400, 4.2], [3100, 2.8]] as [number, number][]) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = 0;
    osc.connect(g).connect(master);
    osc.start();
    sources.push(osc);
    nodes.push(g);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = rate;
    const lg = ctx.createGain();
    lg.gain.value = 0.025;
    lfo.connect(lg).connect(g.gain);
    lfo.start();
    sources.push(lfo);
    nodes.push(lg);
  }

  // Soft harmonic drone (nature hum)
  for (const freq of [130, 196]) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = 0.06;
    osc.connect(g).connect(master);
    osc.start();
    sources.push(osc);
    nodes.push(g);
  }

  return { ctx, master, nodes, sources };
}

// ─── FÚTBOL: Estadio lleno – cánticos, oleadas, bombos ──

function buildFutbol(ctx: AudioContext, master: GainNode): AmbientNodes {
  const nodes: AudioNode[] = [];
  const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

  // Main crowd roar (loud pink noise, wide band)
  const crowdGain = ctx.createGain();
  crowdGain.gain.value = 0.40;
  const crowdBP = ctx.createBiquadFilter();
  crowdBP.type = "bandpass";
  crowdBP.frequency.value = 800;
  crowdBP.Q.value = 0.3;
  crowdGain.connect(crowdBP).connect(master);
  sources.push(loopNoise(ctx, createNoiseBuffer(ctx, 4, "pink"), crowdGain));
  nodes.push(crowdGain, crowdBP);

  // Chanting layer (higher, rhythmic)
  const chantGain = ctx.createGain();
  chantGain.gain.value = 0.20;
  const chantBP = ctx.createBiquadFilter();
  chantBP.type = "bandpass";
  chantBP.frequency.value = 1400;
  chantBP.Q.value = 2.0;
  chantGain.connect(chantBP).connect(master);
  sources.push(loopNoise(ctx, createNoiseBuffer(ctx, 3, "white"), chantGain));
  nodes.push(chantGain, chantBP);

  // Rhythmic clapping LFO on chant
  const clapLfo = ctx.createOscillator();
  clapLfo.frequency.value = 2.5;
  const clapG = ctx.createGain();
  clapG.gain.value = 0.10;
  clapLfo.connect(clapG).connect(chantGain.gain);
  clapLfo.start();
  sources.push(clapLfo);
  nodes.push(clapG);

  // Slow crowd swell (oleadas)
  const swellLfo = ctx.createOscillator();
  swellLfo.frequency.value = 0.06;
  const swellG = ctx.createGain();
  swellG.gain.value = 0.15;
  swellLfo.connect(swellG).connect(crowdGain.gain);
  swellLfo.start();
  sources.push(swellLfo);
  nodes.push(swellG);

  // Bombo / drum beat (low sine pulse)
  const drum = ctx.createOscillator();
  drum.type = "sine";
  drum.frequency.value = 60;
  const drumGain = ctx.createGain();
  drumGain.gain.value = 0;
  drum.connect(drumGain).connect(master);
  drum.start();
  sources.push(drum);
  nodes.push(drumGain);

  const drumLfo = ctx.createOscillator();
  drumLfo.frequency.value = 1.5; // 90 BPM feel
  const drumLfoG = ctx.createGain();
  drumLfoG.gain.value = 0.12;
  drumLfo.connect(drumLfoG).connect(drumGain.gain);
  drumLfo.start();
  sources.push(drumLfo);
  nodes.push(drumLfoG);

  // Stadium bass rumble
  const rumble = ctx.createOscillator();
  rumble.type = "sine";
  rumble.frequency.value = 40;
  const rg = ctx.createGain();
  rg.gain.value = 0.12;
  rumble.connect(rg).connect(master);
  rumble.start();
  sources.push(rumble);
  nodes.push(rg);

  return { ctx, master, nodes, sources };
}

// ─── BALONCESTO: Pabellón – rebotes, zapatillas, bocina ──

function buildBaloncesto(ctx: AudioContext, master: GainNode): AmbientNodes {
  const nodes: AudioNode[] = [];
  const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

  // Ball bouncing (punchy low-mid sine, fast rhythm)
  const bounce = ctx.createOscillator();
  bounce.type = "sine";
  bounce.frequency.value = 150;
  const bounceG = ctx.createGain();
  bounceG.gain.value = 0;
  bounce.connect(bounceG).connect(master);
  bounce.start();
  sources.push(bounce);
  nodes.push(bounceG);

  const bounceLfo = ctx.createOscillator();
  bounceLfo.frequency.value = 1.6;
  const bounceLfoG = ctx.createGain();
  bounceLfoG.gain.value = 0.14;
  bounceLfo.connect(bounceLfoG).connect(bounceG.gain);
  bounceLfo.start();
  sources.push(bounceLfo);
  nodes.push(bounceLfoG);

  // Second bounce (higher, offset rhythm for realism)
  const bounce2 = ctx.createOscillator();
  bounce2.type = "triangle";
  bounce2.frequency.value = 200;
  const bounce2G = ctx.createGain();
  bounce2G.gain.value = 0;
  bounce2.connect(bounce2G).connect(master);
  bounce2.start();
  sources.push(bounce2);
  nodes.push(bounce2G);

  const bounce2Lfo = ctx.createOscillator();
  bounce2Lfo.frequency.value = 0.9;
  const bounce2LfoG = ctx.createGain();
  bounce2LfoG.gain.value = 0.08;
  bounce2Lfo.connect(bounce2LfoG).connect(bounce2G.gain);
  bounce2Lfo.start();
  sources.push(bounce2Lfo);
  nodes.push(bounce2LfoG);

  // Sneaker squeaks (high-passed noise, sharp bursts)
  const squeakG = ctx.createGain();
  squeakG.gain.value = 0;
  const squeakHP = ctx.createBiquadFilter();
  squeakHP.type = "highpass";
  squeakHP.frequency.value = 4000;
  squeakHP.Q.value = 8;
  squeakG.connect(squeakHP).connect(master);
  sources.push(loopNoise(ctx, createNoiseBuffer(ctx, 1, "white"), squeakG));
  nodes.push(squeakG, squeakHP);

  const squeakLfo = ctx.createOscillator();
  squeakLfo.frequency.value = 2.2;
  const squeakLfoG = ctx.createGain();
  squeakLfoG.gain.value = 0.06;
  squeakLfo.connect(squeakLfoG).connect(squeakG.gain);
  squeakLfo.start();
  sources.push(squeakLfo);
  nodes.push(squeakLfoG);

  // Indoor hall reverb feel (resonant mid noise)
  const hallG = ctx.createGain();
  hallG.gain.value = 0.15;
  const hallBP = ctx.createBiquadFilter();
  hallBP.type = "bandpass";
  hallBP.frequency.value = 400;
  hallBP.Q.value = 3;
  hallG.connect(hallBP).connect(master);
  sources.push(loopNoise(ctx, createNoiseBuffer(ctx, 2, "pink"), hallG));
  nodes.push(hallG, hallBP);

  // Small indoor crowd chatter
  const crowdG = ctx.createGain();
  crowdG.gain.value = 0.22;
  const crowdBP = ctx.createBiquadFilter();
  crowdBP.type = "bandpass";
  crowdBP.frequency.value = 1000;
  crowdBP.Q.value = 0.8;
  crowdG.connect(crowdBP).connect(master);
  sources.push(loopNoise(ctx, createNoiseBuffer(ctx, 3, "pink"), crowdG));
  nodes.push(crowdG, crowdBP);

  // Occasional buzzer tone (very subtle square wave)
  const buzzer = ctx.createOscillator();
  buzzer.type = "square";
  buzzer.frequency.value = 500;
  const buzzerG = ctx.createGain();
  buzzerG.gain.value = 0;
  buzzer.connect(buzzerG).connect(master);
  buzzer.start();
  sources.push(buzzer);
  nodes.push(buzzerG);

  const buzzerLfo = ctx.createOscillator();
  buzzerLfo.frequency.value = 0.1;
  const buzzerLfoG = ctx.createGain();
  buzzerLfoG.gain.value = 0.012;
  buzzerLfo.connect(buzzerLfoG).connect(buzzerG.gain);
  buzzerLfo.start();
  sources.push(buzzerLfo);
  nodes.push(buzzerLfoG);

  return { ctx, master, nodes, sources };
}

// ─── REINO MÁGICO: Bosque encantado – campanas, arpa, destellos ──

function buildReinoMagico(ctx: AudioContext, master: GainNode): AmbientNodes {
  const nodes: AudioNode[] = [];
  const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];

  // Ethereal pad chord (C major, triangle waves, louder)
  for (const freq of [261.6, 329.6, 392]) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    osc.detune.value = (Math.random() - 0.5) * 15;
    const g = ctx.createGain();
    g.gain.value = 0.06;
    osc.connect(g).connect(master);
    osc.start();
    sources.push(osc);
    nodes.push(g);
  }

  // Harp-like arpeggios (sine tones with LFO modulation)
  const harpFreqs = [523, 659, 784, 1047]; // C5, E5, G5, C6
  for (let i = 0; i < harpFreqs.length; i++) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = harpFreqs[i];
    const g = ctx.createGain();
    g.gain.value = 0;
    osc.connect(g).connect(master);
    osc.start();
    sources.push(osc);
    nodes.push(g);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.4 + i * 0.15; // staggered rates
    const lg = ctx.createGain();
    lg.gain.value = 0.025;
    lfo.connect(lg).connect(g.gain);
    lfo.start();
    sources.push(lfo);
    nodes.push(lg);
  }

  // Crystal sparkle (very high, pulsing)
  const sparkle = ctx.createOscillator();
  sparkle.type = "sine";
  sparkle.frequency.value = 2637; // E7
  const sg = ctx.createGain();
  sg.gain.value = 0;
  sparkle.connect(sg).connect(master);
  sparkle.start();
  sources.push(sparkle);
  nodes.push(sg);

  const sparkLfo = ctx.createOscillator();
  sparkLfo.frequency.value = 0.5;
  const sparkLfoG = ctx.createGain();
  sparkLfoG.gain.value = 0.02;
  sparkLfo.connect(sparkLfoG).connect(sg.gain);
  sparkLfo.start();
  sources.push(sparkLfo);
  nodes.push(sparkLfoG);

  // Second sparkle (different pitch)
  const sparkle2 = ctx.createOscillator();
  sparkle2.type = "sine";
  sparkle2.frequency.value = 3520; // A7
  const sg2 = ctx.createGain();
  sg2.gain.value = 0;
  sparkle2.connect(sg2).connect(master);
  sparkle2.start();
  sources.push(sparkle2);
  nodes.push(sg2);

  const spark2Lfo = ctx.createOscillator();
  spark2Lfo.frequency.value = 0.7;
  const spark2LfoG = ctx.createGain();
  spark2LfoG.gain.value = 0.015;
  spark2Lfo.connect(spark2LfoG).connect(sg2.gain);
  spark2Lfo.start();
  sources.push(spark2Lfo);
  nodes.push(spark2LfoG);

  // Enchanted wind (very soft brown noise)
  const windG = ctx.createGain();
  windG.gain.value = 0.12;
  const wf = ctx.createBiquadFilter();
  wf.type = "lowpass";
  wf.frequency.value = 400;
  windG.connect(wf).connect(master);
  sources.push(loopNoise(ctx, createNoiseBuffer(ctx, 3, "brown"), windG));
  nodes.push(windG, wf);

  // Chime bell (high triangle wave, slow pulse)
  const chime = ctx.createOscillator();
  chime.type = "triangle";
  chime.frequency.value = 1568; // G6
  const chimeG = ctx.createGain();
  chimeG.gain.value = 0;
  chime.connect(chimeG).connect(master);
  chime.start();
  sources.push(chime);
  nodes.push(chimeG);

  const chimeLfo = ctx.createOscillator();
  chimeLfo.frequency.value = 0.25;
  const chimeLfoG = ctx.createGain();
  chimeLfoG.gain.value = 0.03;
  chimeLfo.connect(chimeLfoG).connect(chimeG.gain);
  chimeLfo.start();
  sources.push(chimeLfo);
  nodes.push(chimeLfoG);

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
