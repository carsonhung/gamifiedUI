/**
 * A captcha-free spam guard for forms: a hidden honeypot field people never fill, plus a minimum
 * fill time, since bots post at once. Pair it with a question only a real player can answer.
 */
export interface SpamGuardOptions {
  /** Name of the honeypot input; something bots love to fill, like `website`. */
  honeypot?: string;
  /** People take at least this long to read and fill the form. */
  minFillMs?: number;
}

export interface SpamGuardHandle {
  /** True when the honeypot is filled or the form came back too fast. */
  isSuspicious(): boolean;
  /** Restarts the fill timer, e.g. when the form is shown again. */
  reset(): void;
  destroy(): void;
}

export function spamGuard(form: HTMLFormElement, { honeypot = 'website', minFillMs = 3000 }: SpamGuardOptions = {}): SpamGuardHandle {
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
