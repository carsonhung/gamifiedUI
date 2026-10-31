/** 90 -> "01:30", 3725 -> "1:02:05". */
export function formatDuration(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const pad = (n) => String(n).padStart(2, '0');
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}
function isoDuration(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    return `PT${Math.floor(s / 3600)}H${Math.floor((s % 3600) / 60)}M${s % 60}S`;
}
/**
 * Drives a .gx-timer: the .gx-timer-value text (and datetime on <time>), --gx-value and
 * data-state. Uses elapsed wall time, so a throttled background tab does not drift.
 */
export function timer(root, seconds, options = {}) {
    const mode = options.mode ?? 'down';
    const format = options.format ?? formatDuration;
    const value = root.querySelector('.gx-timer-value') ?? root;
    let total = seconds;
    let elapsedMs = 0;
    let startedAt = 0;
    let interval = null;
    let state = null;
    let lastShown = -1;
    const elapsed = () => elapsedMs + (interval === null ? 0 : performance.now() - startedAt);
    const current = () => {
        const e = elapsed() / 1000;
        return mode === 'down' ? Math.max(0, total - e) : total > 0 ? Math.min(total, e) : e;
    };
    const isFinished = () => total > 0 && (mode === 'down' ? current() <= 0 : current() >= total);
    const setState = (next) => {
        if (next === state)
            return;
        state = next;
        if (next === 'idle' || next === 'running')
            root.removeAttribute('data-state');
        else
            root.dataset.state = next;
        options.onStateChange?.(next);
    };
    const render = () => {
        const now = current();
        const shown = mode === 'down' ? Math.ceil(now) : Math.floor(now);
        const fraction = total > 0 ? (mode === 'down' ? now / total : 1 - now / total) : 1;
        root.style.setProperty('--gx-value', fraction.toFixed(3));
        if (shown !== lastShown) {
            lastShown = shown;
            value.textContent = format(shown);
            if (value instanceof HTMLTimeElement)
                value.dateTime = isoDuration(shown);
            options.onTick?.(shown);
        }
        const started = interval !== null || elapsedMs > 0;
        if (isFinished())
            setState('done');
        else if (!started)
            setState('idle');
        else if (mode === 'down' && options.criticalAt !== undefined && shown <= options.criticalAt)
            setState('critical');
        else if (mode === 'down' && options.warnAt !== undefined && shown <= options.warnAt)
            setState('warning');
        else
            setState('running');
    };
    const stopInterval = () => {
        if (interval === null)
            return;
        elapsedMs += performance.now() - startedAt;
        window.clearInterval(interval);
        interval = null;
    };
    const tick = () => {
        render();
        if (!isFinished())
            return;
        stopInterval();
        options.onDone?.();
    };
    const handle = {
        start() {
            if (interval !== null || isFinished())
                return;
            startedAt = performance.now();
            interval = window.setInterval(tick, options.tickMs ?? 200);
            render();
        },
        pause() {
            stopInterval();
            render();
        },
        reset(next = total) {
            stopInterval();
            total = next;
            elapsedMs = 0;
            lastShown = -1;
            render();
        },
        get seconds() {
            return current();
        },
        get running() {
            return interval !== null;
        },
        destroy() {
            stopInterval();
        },
    };
    render();
    if (options.autoStart)
        handle.start();
    return handle;
}
