import { SOUNDS, type SoundName, type SoundSpec, type Tone } from './sounds.js';

export { SOUNDS };
export type { SoundName, SoundSpec, Tone, Wave } from './sounds.js';

export interface PlayOptions {
  /** 0 to 1, multiplied with the master volume. */
  volume?: number;
  /** Frequency multiplier, e.g. 1.5 for higher. Handy for varying typewriter blips. */
  pitch?: number;
}

export interface SfxOptions {
  volume?: number;
  muted?: boolean;
  /** localStorage key that remembers volume and mute between visits. Off by default. */
  storageKey?: string;
}

export interface Sfx {
  play(sound: SoundName | (string & {}) | SoundSpec, options?: PlayOptions): void;
  define(name: string, spec: SoundSpec): void;
  volume: number;
  muted: boolean;
  /** Plays `data-gx-sfx` on click and `data-gx-sfx-hover` on pointer enter, inside `root`. Returns an unbind function. */
  bind(root?: ParentNode): () => void;
}

const ATTACK = 0.005;
const SILENT = 0.0001;

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export function createSfx(options: SfxOptions = {}): Sfx {
  const sounds = new Map<string, SoundSpec>(Object.entries(SOUNDS));
  const saved = read(options.storageKey);
  let volume = clamp01(saved?.volume ?? options.volume ?? 0.5);
  let muted = saved?.muted ?? options.muted ?? false;
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let noise: AudioBuffer | null = null;

  const save = (): void => {
    if (!options.storageKey) return;
    try {
      localStorage.setItem(options.storageKey, JSON.stringify({ volume, muted }));
    } catch {
      /* storage can be full or blocked */
    }
  };

  const audio = (): { ctx: AudioContext; out: GainNode } | null => {
    if (typeof AudioContext === 'undefined') return null;
    if (!context || !master) {
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = volume;
      master.connect(context.destination);
    }
    if (context.state === 'suspended') void context.resume();
    return { ctx: context, out: master };
  };

  const noiseBuffer = (ctx: AudioContext): AudioBuffer => {
    if (noise) return noise;
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return noise;
  };

  const voice = (ctx: AudioContext, out: AudioNode, tone: Tone, gain: number, pitch: number): void => {
    const start = ctx.currentTime + (tone.at ?? 0);
    const end = start + tone.dur;
    const env = ctx.createGain();
    env.gain.setValueAtTime(SILENT, start);
    env.gain.linearRampToValueAtTime((tone.gain ?? 0.2) * gain, start + ATTACK);
    env.gain.exponentialRampToValueAtTime(SILENT, end);
    env.connect(out);

    const freq = tone.freq * pitch;
    const slide = (param: AudioParam): void => {
      param.setValueAtTime(freq, start);
      if (tone.to) param.exponentialRampToValueAtTime(tone.to * pitch, end);
    };

    let source: AudioScheduledSourceNode;
    if (tone.wave === 'noise') {
      const buffer = ctx.createBufferSource();
      buffer.buffer = noiseBuffer(ctx);
      buffer.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      slide(filter.frequency);
      buffer.connect(filter).connect(env);
      source = buffer;
    } else {
      const osc = ctx.createOscillator();
      osc.type = tone.wave ?? 'square';
      slide(osc.frequency);
      osc.connect(env);
      source = osc;
    }
    source.start(start);
    source.stop(end + 0.02);
    source.onended = () => env.disconnect();
  };

  const sfx: Sfx = {
    play(sound, { volume: gain = 1, pitch = 1 } = {}) {
      if (muted) return;
      const spec = typeof sound === 'string' ? sounds.get(sound) : sound;
      if (!spec) return;
      const graph = audio();
      if (!graph) return;
      spec.forEach((tone) => voice(graph.ctx, graph.out, tone, clamp01(gain), pitch));
    },
    define(name, spec) {
      sounds.set(name, spec);
    },
    get volume() {
      return volume;
    },
    set volume(next) {
      volume = clamp01(next);
      if (master && context) master.gain.setValueAtTime(volume, context.currentTime);
      save();
    },
    get muted() {
      return muted;
    },
    set muted(next) {
      muted = next;
      save();
    },
    bind(root = document) {
      let hovered: Element | null = null;
      const onClick = (event: Event): void => {
        const el = (event.target as Element | null)?.closest?.<HTMLElement>('[data-gx-sfx]');
        if (el && !el.matches(':disabled, [aria-disabled="true"]')) sfx.play(el.dataset.gxSfx ?? '');
      };
      const onOver = (event: Event): void => {
        const el = (event.target as Element | null)?.closest?.<HTMLElement>('[data-gx-sfx-hover]') ?? null;
        if (el && el !== hovered) sfx.play(el.dataset.gxSfxHover ?? '');
        hovered = el;
      };
      root.addEventListener('click', onClick);
      root.addEventListener('pointerover', onOver);
      return () => {
        root.removeEventListener('click', onClick);
        root.removeEventListener('pointerover', onOver);
      };
    },
  };
  return sfx;
}

function read(key: string | undefined): { volume?: number; muted?: boolean } | null {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as { volume?: number; muted?: boolean }) : null;
  } catch {
    return null;
  }
}
