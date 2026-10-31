import { replay } from './motion.js';
/** Puts a .gx-skill on cooldown: aria-disabled, --gx-cooldown sweep, seconds in .gx-skill-timer. */
export function cooldown(button, seconds, options = {}) {
    const steps = options.steps ?? 16;
    const total = seconds * 1000;
    const start = performance.now();
    const timer = button.querySelector('.gx-skill-timer');
    const render = (remaining) => {
        button.style.setProperty('--gx-cooldown', String(Math.ceil((remaining / total) * steps) / steps));
        if (timer)
            timer.textContent = remaining > 0 ? String(Math.ceil(remaining / 1000)) : '';
    };
    button.setAttribute('aria-disabled', 'true');
    render(total);
    const tick = window.setInterval(() => {
        const remaining = Math.max(0, total - (performance.now() - start));
        render(remaining);
        if (remaining > 0)
            return;
        window.clearInterval(tick);
        button.removeAttribute('aria-disabled');
        replay(button, 'data-ready');
        options.onReady?.();
    }, options.tickMs ?? 100);
    return {
        cancel() {
            window.clearInterval(tick);
            render(0);
            button.removeAttribute('aria-disabled');
        },
    };
}
/** True while a skill is cooling down. */
export function isCoolingDown(button) {
    return button.getAttribute('aria-disabled') === 'true';
}
