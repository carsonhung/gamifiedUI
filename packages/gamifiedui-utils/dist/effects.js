import { prefersReducedMotion } from './motion.js';
const FLOAT_CLASS = {
    damage: 'gx-float gx-float-damage',
    heal: 'gx-float gx-float-heal',
    xp: 'gx-float gx-float-xp',
    crit: 'gx-float gx-float-crit',
    plain: 'gx-float',
};
function between(min, max) {
    return min + Math.random() * (max - min);
}
/** Floating combat text inside a .gx-float-layer. Decorative: announce the value separately. */
export function floatText(layer, text, options = {}) {
    const el = document.createElement('span');
    el.className = FLOAT_CLASS[options.kind ?? 'plain'];
    el.setAttribute('aria-hidden', 'true');
    el.textContent = text;
    el.style.setProperty('--gx-float-x', `${options.x ?? Math.round(between(38, 62))}%`);
    if (options.y !== undefined)
        el.style.setProperty('--gx-float-y', `${options.y}%`);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    layer.append(el);
    return el;
}
const PARTICLE_CLASS = {
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
const BURST_LIFETIME_MS = 1100;
/** One-shot particle burst inside a positioned host. Skipped entirely under reduced motion. */
export function burst(host, options = {}) {
    if (prefersReducedMotion(host))
        return;
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
