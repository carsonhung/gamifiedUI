import { prefersReducedMotion } from './motion.js';

export type FloatKind = 'damage' | 'heal' | 'xp' | 'crit' | 'plain';

const FLOAT_CLASS: Record<FloatKind, string> = {
  damage: 'gx-float gx-float-damage',
  heal: 'gx-float gx-float-heal',
  xp: 'gx-float gx-float-xp',
  crit: 'gx-float gx-float-crit',
  plain: 'gx-float',
};

export interface FloatOptions {
  kind?: FloatKind;
  /** Horizontal position in percent of the layer; random 38-62 by default. */
  x?: number;
  /** Vertical start in percent of the layer. */
  y?: number;
}

function between(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Floating combat text inside a .gx-float-layer. Decorative: announce the value separately. */
export function floatText(layer: HTMLElement, text: string, options: FloatOptions = {}): HTMLElement {
  const el = document.createElement('span');
  el.className = FLOAT_CLASS[options.kind ?? 'plain'];
  el.setAttribute('aria-hidden', 'true');
  el.textContent = text;
  el.style.setProperty('--gx-float-x', `${options.x ?? Math.round(between(38, 62))}%`);
  if (options.y !== undefined) el.style.setProperty('--gx-float-y', `${options.y}%`);
  el.addEventListener('animationend', () => el.remove(), { once: true });
  layer.append(el);
  return el;
}

export type BurstKind = 'spark' | 'coin' | 'heart' | 'xp' | 'petal' | 'rarity' | 'confetti';

const PARTICLE_CLASS: Record<BurstKind, string> = {
  spark: 'gx-particle',
  coin: 'gx-particle gx-particle-coin',
  heart: 'gx-particle gx-particle-heart',
  xp: 'gx-particle gx-particle-xp',
  petal: 'gx-particle gx-particle-petal',
  rarity: 'gx-particle gx-particle-rarity',
  confetti: 'gx-particle gx-particle-confetti',
};

/** Confetti mixes in a zigzag streamer every this many pieces. */
const RIBBON_EVERY = 3;

export interface BurstOptions {
  kind?: BurstKind;
  /** Extra classes per particle, e.g. "gx-i-coin" for an icon shape. Write the full class name
      in your source so Tailwind generates it. */
  className?: string;
  /** Burst origin in percent of the host box. */
  x?: number;
  y?: number;
  count?: number;
  /** Travel distance range in rem. */
  spread?: [number, number];
  /** Every nth particle is large. 0 disables. */
  largeEvery?: number;
}

const BURST_LIFETIME_MS = 1100;

/** One-shot particle burst inside a positioned host. Skipped entirely under reduced motion. */
export function burst(host: HTMLElement, options: BurstOptions = {}): void {
  if (prefersReducedMotion(host)) return;
  const count = options.count ?? 18;
  const [near, far] = options.spread ?? [2.5, 5];
  const largeEvery = options.largeEvery ?? 3;
  const kind = options.kind ?? 'spark';
  const base = PARTICLE_CLASS[kind];
  const extra = options.className ? ` ${options.className}` : '';

  const layer = document.createElement('div');
  layer.className = 'gx-burst';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.setProperty('--gx-burst-x', `${options.x ?? 50}%`);
  layer.style.setProperty('--gx-burst-y', `${options.y ?? 50}%`);

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('i');
    const isLarge = largeEvery > 0 && i % largeEvery === 0;
    const isRibbon = kind === 'confetti' && i % RIBBON_EVERY === 1;
    particle.className = `${base}${isLarge ? ' gx-particle-lg' : ''}${isRibbon ? ' gx-particle-ribbon' : ''}${extra}`;
    const angle = (i / count) * Math.PI * 2 + between(-0.3, 0.3);
    const distance = between(near, far);
    particle.style.setProperty('--gx-dx', `${(Math.cos(angle) * distance).toFixed(2)}rem`);
    particle.style.setProperty('--gx-dy', `${(Math.sin(angle) * distance - 1.5).toFixed(2)}rem`);
    particle.style.setProperty('--gx-rot', `${Math.round(between(-270, 270))}deg`);
    particle.style.setProperty('--gx-delay', `${Math.round(between(0, 90))}ms`);
    layer.append(particle);
  }
  host.append(layer);
  window.setTimeout(() => layer.remove(), BURST_LIFETIME_MS);
}
