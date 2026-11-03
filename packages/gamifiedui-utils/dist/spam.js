export function spamGuard(form, { honeypot = 'website', minFillMs = 3000 } = {}) {
    const trap = document.createElement('input');
    trap.type = 'text';
    trap.name = honeypot;
    trap.tabIndex = -1;
    trap.autocomplete = 'off';
    const wrap = document.createElement('label');
    wrap.className = 'gx-honeypot';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.append(honeypot, trap);
    form.append(wrap);
    let openedAt = performance.now();
    return {
        isSuspicious: () => trap.value !== '' || performance.now() - openedAt < minFillMs,
        reset() {
            openedAt = performance.now();
            trap.value = '';
        },
        destroy: () => wrap.remove(),
    };
}
