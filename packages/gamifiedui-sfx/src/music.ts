/**
 * Chiptune background music from tiny text scores. One token per eighth note: a note name such as
 * `C5`, `F#3` or `Bb2` starts a note, `-` holds it, `.` rests and `|` is a bar line for the reader.
 * A drum score uses `k` (kick), `s` (snare) and `h` (hi-hat) in place of notes.
 */
export interface MusicTheme {
  bpm: number;
  /** The melody. Its length sets the loop. */
  lead: string;
  /** The bass; loops on its own if shorter than the lead. */
  bass?: string;
  /** Wave for the melody; `square` by default. */
  leadWave?: OscillatorType;
  /** Wave for the bass; `triangle` by default. */
  bassWave?: OscillatorType;
  /** A drum score; loops on its own if shorter than the lead. Replaces `hatEvery` and `hasKick`. */
  drums?: string;
  /** A hi-hat every n eighth notes; 0 for none. */
  hatEvery?: number;
  /** A kick on every beat. */
  hasKick?: boolean;
  /** False plays the theme once, as for a fanfare, and then stays quiet. True by default. */
  isLoop?: boolean;
}

export interface MusicOptions {
  /** 0 to 1. */
  volume?: number;
  muted?: boolean;
  /** Seconds a theme takes to fade out when another takes over; 0 cuts. */
  fade?: number;
}

export interface Music {
  define(name: string, theme: MusicTheme): void;
  /** Starts or switches to a theme; null stops. Safe to call on every render: the same name keeps playing. */
  play(name: string | null): void;
  muted: boolean;
  /** 0 to 1. */
  volume: number;
}

/** Each wave at about the same loudness: a triangle sounds much quieter than a square at equal gain. */
const LEAD_GAIN: Record<OscillatorType, number> = { square: 0.06, sawtooth: 0.05, triangle: 0.18, sine: 0.14, custom: 0.06 };
const BASS_GAIN: Record<OscillatorType, number> = { square: 0.035, sawtooth: 0.035, triangle: 0.1, sine: 0.1, custom: 0.035 };
const HAT_GAIN = 0.03;
const SNARE_GAIN = 0.07;
const KICK_GAIN = 0.18;
/** How far ahead notes are queued; timers stutter, the audio clock does not. */
const LOOKAHEAD_S = 0.2;
const TICK_MS = 50;
/** Notes stop a touch early so repeated pitches stay distinct. */
const NOTE_GAP = 0.9;
const DEFAULT_FADE_S = 0.4;
const NOISE_S = 0.2;
const NOTE_INDEX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

type Drum = 'k' | 's' | 'h';

interface Note {
  freq: number;
  steps: number;
}

interface Parsed {
  theme: MusicTheme;
  lead: (Note | null)[];
  bass: (Note | null)[];
  drums: (Drum | null)[];
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export function noteFrequency(name: string): number {
  const match = /^([A-G])([#b]?)(\d)$/.exec(name);
  if (!match) throw new Error(`[gamifiedui-sfx] bad note ${name}`);
  const shift = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  const midi = 12 * (Number(match[3]) + 1) + NOTE_INDEX[match[1]!]! + shift;
  return 440 * 2 ** ((midi - 69) / 12);
}

const tokens = (score: string): string[] => score.split(/\s+/).filter((token) => token && token !== '|');

function parse(score: string): (Note | null)[] {
  const steps = tokens(score);
  const slots: (Note | null)[] = steps.map(() => null);
  let held: Note | null = null;
  steps.forEach((token, i) => {
    if (token === '-') {
      if (held) held.steps++;
      return;
    }
    held = token === '.' ? null : { freq: noteFrequency(token), steps: 1 };
    slots[i] = held;
  });
  return slots;
}

function parseDrums(score: string): (Drum | null)[] {
  return tokens(score).map((token) => {
    if (token === 'k' || token === 's' || token === 'h') return token;
    if (token === '.') return null;
    throw new Error(`[gamifiedui-sfx] bad drum ${token}`);
  });
}

/** Browsers only allow audio after a user gesture, so the audio context is made on the first one. */
export function createMusic(options: MusicOptions = {}): Music {
  const themes = new Map<string, Parsed>();
  const fade = Math.max(0, options.fade ?? DEFAULT_FADE_S);
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let bus: GainNode | null = null;
  let noise: AudioBuffer | null = null;
  let timer = 0;
  let playing: string | null = null;
  let wanted: string | null = null;
  let muted = options.muted ?? false;
  let volume = clamp01(options.volume ?? 0.5);
  let step = 0;
  let nextTime = 0;
  let isFinished = false;

  const tone = (type: OscillatorType, freq: number, at: number, length: number, gain: number): void => {
    const osc = ctx!.createOscillator();
    const env = ctx!.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(gain, at + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(env).connect(bus!);
    osc.start(at);
    osc.stop(at + length + 0.02);
  };

  const hiss = (at: number, length: number, gain: number, type: BiquadFilterType, cutoff: number): void => {
    const source = ctx!.createBufferSource();
    source.buffer = noise;
    const filter = ctx!.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = cutoff;
    const env = ctx!.createGain();
    env.gain.setValueAtTime(gain, at);
    env.gain.exponentialRampToValueAtTime(0.0001, at + length);
    source.connect(filter).connect(env).connect(bus!);
    source.start(at);
    source.stop(at + length + 0.01);
  };

  const kick = (at: number): void => {
    const osc = ctx!.createOscillator();
    const env = ctx!.createGain();
    osc.frequency.setValueAtTime(130, at);
    osc.frequency.exponentialRampToValueAtTime(40, at + 0.12);
    env.gain.setValueAtTime(KICK_GAIN, at);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
    osc.connect(env).connect(bus!);
    osc.start(at);
    osc.stop(at + 0.15);
  };

  const drum = (kind: Drum, at: number): void => {
    if (kind === 'k') kick(at);
    else if (kind === 's') hiss(at, 0.12, SNARE_GAIN, 'bandpass', 1800);
    else hiss(at, 0.04, HAT_GAIN, 'highpass', 7000);
  };

  const tick = (): void => {
    const score = playing ? themes.get(playing) : undefined;
    if (!ctx || !score || score.lead.length === 0 || isFinished) return;
    const { bpm, hatEvery = 0, hasKick = false, leadWave = 'square', bassWave = 'triangle', isLoop = true } = score.theme;
    const stepLength = 60 / bpm / 2;
    while (nextTime < ctx.currentTime + LOOKAHEAD_S) {
      const lead = score.lead[step];
      const bass = score.bass.length ? score.bass[step % score.bass.length] : null;
      if (lead) tone(leadWave, lead.freq, nextTime, lead.steps * stepLength * NOTE_GAP, LEAD_GAIN[leadWave]);
      if (bass) tone(bassWave, bass.freq, nextTime, bass.steps * stepLength * NOTE_GAP, BASS_GAIN[bassWave]);
      if (score.drums.length) {
        const hit = score.drums[step % score.drums.length];
        if (hit) drum(hit, nextTime);
      } else {
        if (hatEvery && step % hatEvery === hatEvery - 1) drum('h', nextTime);
        if (hasKick && step % 4 === 0) kick(nextTime);
      }
      nextTime += stepLength;
      step++;
      if (step < score.lead.length) continue;
      step = 0;
      if (!isLoop) {
        isFinished = true;
        window.clearInterval(timer);
        return;
      }
    }
  };

  /** Fades the current theme out on its own bus, so the next one starts clean underneath. */
  const release = (): void => {
    if (!ctx || !bus) return;
    const old = bus;
    const now = ctx.currentTime;
    old.gain.cancelScheduledValues(now);
    old.gain.setValueAtTime(old.gain.value, now);
    old.gain.linearRampToValueAtTime(0, now + fade);
    window.setTimeout(() => old.disconnect(), fade * 1000 + 100);
    bus = null;
  };

  const sync = (): void => {
    window.clearInterval(timer);
    if (!ctx || !master || muted || !wanted || document.hidden || !themes.has(wanted)) {
      release();
      playing = null;
      return;
    }
    if (playing !== wanted || !bus) {
      release();
      bus = ctx.createGain();
      bus.connect(master);
      playing = wanted;
      step = 0;
      isFinished = false;
      nextTime = ctx.currentTime + 0.05;
    }
    if (isFinished) return;
    timer = window.setInterval(tick, TICK_MS);
    tick();
  };

  const unlock = (): void => {
    if (ctx || typeof AudioContext === 'undefined') return;
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate * NOISE_S, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    sync();
  };

  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  document.addEventListener('visibilitychange', sync);

  return {
    define(name, theme) {
      themes.set(name, { theme, lead: parse(theme.lead), bass: parse(theme.bass ?? ''), drums: parseDrums(theme.drums ?? '') });
    },
    play(name) {
      if (wanted === name) return;
      wanted = name;
      sync();
    },
    get muted() {
      return muted;
    },
    set muted(next) {
      muted = next;
      sync();
    },
    get volume() {
      return volume;
    },
    set volume(next) {
      volume = clamp01(next);
      if (master && ctx) master.gain.setValueAtTime(volume, ctx.currentTime);
    },
  };
}
