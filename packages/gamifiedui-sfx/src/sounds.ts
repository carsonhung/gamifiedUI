export type Wave = OscillatorType | 'noise';

/** One voice. `freq` slides to `to` over `dur` seconds; `at` delays the start. For noise, `freq` is the low-pass cutoff. */
export interface Tone {
  wave?: Wave;
  freq: number;
  to?: number;
  at?: number;
  dur: number;
  gain?: number;
}

export type SoundSpec = readonly Tone[];

const arp = (wave: Wave, notes: readonly number[], step: number, gain: number, last = step): Tone[] =>
  notes.map((freq, i) => ({ wave, freq, at: i * step, dur: i === notes.length - 1 ? last : step, gain }));

export const SOUNDS = {
  click: [{ wave: 'square', freq: 900, to: 600, dur: 0.04, gain: 0.18 }],
  hover: [{ wave: 'triangle', freq: 1400, dur: 0.03, gain: 0.1 }],
  select: arp('square', [660, 990], 0.05, 0.16, 0.07),
  confirm: arp('square', [523.25, 783.99], 0.07, 0.18, 0.12),
  cancel: arp('square', [440, 329.63], 0.06, 0.16, 0.1),
  error: [
    { wave: 'sawtooth', freq: 160, dur: 0.12, gain: 0.16 },
    { wave: 'sawtooth', freq: 140, at: 0.15, dur: 0.18, gain: 0.16 },
  ],
  blip: [{ wave: 'square', freq: 440, dur: 0.025, gain: 0.08 }],
  notify: arp('triangle', [880, 1174.66], 0.1, 0.25, 0.18),
  coin: arp('square', [987.77, 1318.51], 0.06, 0.16, 0.25),
  pickup: [{ wave: 'square', freq: 600, to: 1200, dur: 0.1, gain: 0.16 }],
  open: arp('square', [392, 523.25, 659.25, 783.99], 0.08, 0.15, 0.28),
  jump: [{ wave: 'square', freq: 300, to: 700, dur: 0.15, gain: 0.16 }],
  step: [{ wave: 'noise', freq: 900, dur: 0.04, gain: 0.25 }],
  hit: [
    { wave: 'noise', freq: 2400, to: 300, dur: 0.12, gain: 0.5 },
    { wave: 'square', freq: 150, to: 60, dur: 0.1, gain: 0.18 },
  ],
  hurt: [{ wave: 'square', freq: 420, to: 110, dur: 0.22, gain: 0.18 }],
  laser: [{ wave: 'sawtooth', freq: 1600, to: 200, dur: 0.18, gain: 0.12 }],
  explosion: [
    { wave: 'noise', freq: 1600, to: 80, dur: 0.55, gain: 0.7 },
    { wave: 'sine', freq: 90, to: 40, dur: 0.4, gain: 0.35 },
  ],
  heal: [
    { wave: 'triangle', freq: 523.25, to: 1046.5, dur: 0.3, gain: 0.25 },
    { wave: 'sine', freq: 1567.98, at: 0.12, dur: 0.28, gain: 0.12 },
  ],
  powerUp: [
    ...arp('square', [523.25, 659.25, 783.99, 1046.5, 1318.51], 0.05, 0.12),
    { wave: 'triangle', freq: 1046.5, to: 2093, at: 0.25, dur: 0.2, gain: 0.15 },
  ],
  levelUp: [
    ...arp('square', [523.25, 659.25, 783.99, 1046.5], 0.08, 0.14, 0.08),
    { wave: 'square', freq: 1046.5, at: 0.36, dur: 0.3, gain: 0.12 },
    { wave: 'triangle', freq: 1318.51, at: 0.36, dur: 0.3, gain: 0.2 },
  ],
  achievement: [
    ...arp('square', [783.99, 987.77, 1174.66], 0.07, 0.13),
    { wave: 'square', freq: 1567.98, at: 0.21, dur: 0.35, gain: 0.12 },
    { wave: 'triangle', freq: 1174.66, at: 0.21, dur: 0.35, gain: 0.2 },
    { wave: 'triangle', freq: 783.99, at: 0.21, dur: 0.35, gain: 0.2 },
  ],
  gameOver: arp('triangle', [392, 369.99, 349.23, 329.63], 0.2, 0.3, 0.6),
} satisfies Record<string, SoundSpec>;

export type SoundName = keyof typeof SOUNDS;
