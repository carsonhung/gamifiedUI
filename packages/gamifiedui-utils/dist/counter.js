import { prefersReducedMotion, replay } from './motion.js';
/** Rolls the number in el up or down to `to`, then pops the surrounding .gx-counter. */
export function rollNumber(el, to, options = {}) {
    const from = options.from ?? Number(el.textContent?.replace(/[^\d.-]/g, '') || 0);
    const steps = options.steps ?? 12;
    const duration = options.duration ?? 600;
    const format = options.format ?? String;
    const counter = el.closest('.gx-counter');
    return new Promise((resolve) => {
        const finish = () => {
            el.textContent = format(to);
            if (counter)
                replay(counter, 'data-bump');
            resolve();
        };
        if (prefersReducedMotion(el) || from === to) {
            finish();
            return;
        }
        let step = 0;
        const timer = window.setInterval(() => {
            step++;
            el.textContent = format(Math.round(from + ((to - from) * step) / steps));
            if (step < steps)
                return;
            window.clearInterval(timer);
            finish();
        }, duration / steps);
    });
}
