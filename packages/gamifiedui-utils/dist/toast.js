import { prefersReducedMotion } from './motion.js';
const TONE_CLASS = {
    info: 'gx-toast gx-toast-info',
    success: 'gx-toast gx-toast-success',
    warning: 'gx-toast gx-toast-warning',
    danger: 'gx-toast gx-toast-danger',
    achievement: 'gx-toast gx-toast-achievement',
};
const DEFAULT_ICON = {
    info: 'i',
    success: '+',
    warning: '!',
    danger: 'x',
    achievement: '★',
};
function defaultStack() {
    const existing = document.querySelector('.gx-toast-stack');
    if (existing)
        return existing;
    const stack = document.createElement('div');
    stack.className = 'gx-toast-stack';
    stack.setAttribute('role', 'region');
    stack.setAttribute('aria-label', 'Notifications');
    document.body.append(stack);
    return stack;
}
function textPart(className, text) {
    const p = document.createElement('p');
    p.className = className;
    p.textContent = text;
    return p;
}
/** Shows a gx-toast. Errors use role="alert", everything else role="status". */
export function toast(options) {
    const tone = options.tone ?? 'info';
    const stack = options.stack ?? defaultStack();
    const duration = options.duration ?? 4000;
    const element = document.createElement('div');
    element.className = TONE_CLASS[tone];
    element.setAttribute('role', tone === 'danger' ? 'alert' : 'status');
    const icon = document.createElement('span');
    icon.className = 'gx-toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = options.icon ?? DEFAULT_ICON[tone];
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'gx-toast-close';
    close.setAttribute('aria-label', options.dismissLabel ?? 'Dismiss');
    close.textContent = 'x';
    element.append(icon, textPart('gx-toast-title', options.title));
    if (options.body)
        element.append(textPart('gx-toast-body', options.body));
    element.append(close);
    let timer;
    const dismiss = () => {
        window.clearTimeout(timer);
        if (element.dataset.leaving !== undefined)
            return;
        if (prefersReducedMotion(element)) {
            element.remove();
            return;
        }
        element.dataset.leaving = '';
        element.addEventListener('animationend', (e) => {
            if (e.animationName === 'gx-toast-out')
                element.remove();
        });
    };
    const schedule = () => {
        if (duration > 0)
            timer = window.setTimeout(dismiss, duration);
    };
    const pause = () => window.clearTimeout(timer);
    close.addEventListener('click', dismiss);
    element.addEventListener('pointerenter', pause);
    element.addEventListener('pointerleave', schedule);
    element.addEventListener('focusin', pause);
    element.addEventListener('focusout', schedule);
    stack.append(element);
    const limit = options.limit ?? 4;
    while (stack.children.length > limit)
        stack.firstElementChild?.remove();
    schedule();
    return { element, dismiss };
}
