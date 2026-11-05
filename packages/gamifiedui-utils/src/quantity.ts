import { replay } from './motion.js';

export interface QuantityOptions {
  /** Steps per PageUp / PageDown on the field. */
  pageSteps?: number;
  onChange?: (value: number) => void;
}

export interface QuantityHandle {
  readonly value: number;
  /** Clamps to min / max and snaps to step, like a press would. */
  set(value: number): void;
  destroy(): void;
}

/** First repeat waits a little so a tap never counts twice; later repeats speed up. */
const HOLD_DELAY_MS = 400;
const REPEAT_MS = 110;
const FAST_REPEAT_MS = 40;
const FAST_AFTER_REPEATS = 8;
const DEFAULT_PAGE_STEPS = 10;

function readNumber(text: string, fallback: number): number {
  const n = Number(text);
  return text.trim() !== '' && Number.isFinite(n) ? n : fallback;
}

/**
 * Wires a gx-quantity: − / + buttons (any [data-step], e.g. "-1", "1", "10") with press-and-hold
 * repeat, Home / End and PageUp / PageDown on the field, clamping to the input's min, max and
 * step, and a data-bump pop. Buttons at a limit get aria-disabled so focus stays on them.
 */
export function quantity(root: HTMLElement, options: QuantityOptions = {}): QuantityHandle {
  const input = root.querySelector<HTMLInputElement>('.gx-quantity-value');
  if (!input) throw new Error('[quantity] missing .gx-quantity-value inside the root');
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-step]'));
  const pageSteps = options.pageSteps ?? DEFAULT_PAGE_STEPS;

  const min = (): number => readNumber(input.min, -Infinity);
  const max = (): number => readNumber(input.max, Infinity);
  const step = (): number => readNumber(input.step, 1) || 1;
  const base = (): number => (Number.isFinite(min()) ? min() : 0);

  const normalise = (n: number): number => {
    const s = step();
    const snapped = base() + Math.round((n - base()) / s) * s;
    const decimals = (String(s).split('.')[1] ?? '').length;
    return Number(Math.min(max(), Math.max(min(), snapped)).toFixed(decimals));
  };

  let value = normalise(readNumber(input.value, base()));

  const syncButtons = (): void => {
    buttons.forEach((button) => {
      const delta = Number(button.dataset.step);
      const isAtLimit = delta < 0 ? value <= min() : value >= max();
      if (isAtLimit) button.setAttribute('aria-disabled', 'true');
      else button.removeAttribute('aria-disabled');
    });
  };

  const set = (n: number, shouldEmit = true): void => {
    const next = normalise(n);
    const isChanged = next !== value;
    value = next;
    input.value = String(next);
    syncButtons();
    if (!isChanged || !shouldEmit) return;
    replay(root, 'data-bump');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    options.onChange?.(next);
  };

  const nudge = (button: HTMLButtonElement): boolean => {
    if (button.getAttribute('aria-disabled') === 'true') return false;
    set(value + Number(button.dataset.step) * step());
    return button.getAttribute('aria-disabled') !== 'true';
  };

  let holdTimer: number | null = null;
  let held: HTMLButtonElement | null = null;
  const stopHold = (): void => {
    if (holdTimer !== null) window.clearTimeout(holdTimer);
    holdTimer = null;
    held?.removeAttribute('data-pressed');
    held = null;
  };
  const repeat = (count: number): void => {
    if (!held || !nudge(held)) {
      stopHold();
      return;
    }
    holdTimer = window.setTimeout(() => repeat(count + 1), count >= FAST_AFTER_REPEATS ? FAST_REPEAT_MS : REPEAT_MS);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const button = e.currentTarget as HTMLButtonElement;
    if (e.button !== 0) return;
    e.preventDefault();
    button.focus({ preventScroll: true });
    stopHold();
    if (!nudge(button)) return;
    held = button;
    button.setAttribute('data-pressed', '');
    holdTimer = window.setTimeout(() => repeat(0), HOLD_DELAY_MS);
  };
  // Pointer presses already stepped on pointerdown; only keyboard clicks (detail 0) step here.
  const onClick = (e: MouseEvent): void => {
    if (e.detail === 0) nudge(e.currentTarget as HTMLButtonElement);
  };
  const onContextMenu = (e: Event): void => e.preventDefault();

  const onInputChange = (): void => set(readNumber(input.value, value));
  // Native arrow keys and typing fire "input" only; follow them without clamping mid-typing.
  const onInputTyping = (): void => {
    const n = readNumber(input.value, Number.NaN);
    if (Number.isNaN(n) || n < min() || n > max()) return;
    value = n;
    syncButtons();
  };
  const onKey = (e: KeyboardEvent): void => {
    const jump =
      e.key === 'PageUp' ? value + pageSteps * step()
      : e.key === 'PageDown' ? value - pageSteps * step()
      : e.key === 'Home' && Number.isFinite(min()) ? min()
      : e.key === 'End' && Number.isFinite(max()) ? max()
      : null;
    if (jump === null) return;
    e.preventDefault();
    set(jump);
  };

  buttons.forEach((button) => {
    button.addEventListener('pointerdown', onPointerDown);
    button.addEventListener('click', onClick);
    button.addEventListener('contextmenu', onContextMenu);
  });
  window.addEventListener('pointerup', stopHold);
  window.addEventListener('pointercancel', stopHold);
  window.addEventListener('blur', stopHold);
  input.addEventListener('change', onInputChange);
  input.addEventListener('input', onInputTyping);
  input.addEventListener('keydown', onKey);
  set(value, false);

  return {
    get value() {
      return value;
    },
    set: (n) => set(n),
    destroy() {
      stopHold();
      buttons.forEach((button) => {
        button.removeEventListener('pointerdown', onPointerDown);
        button.removeEventListener('click', onClick);
        button.removeEventListener('contextmenu', onContextMenu);
      });
      window.removeEventListener('pointerup', stopHold);
      window.removeEventListener('pointercancel', stopHold);
      window.removeEventListener('blur', stopHold);
      input.removeEventListener('change', onInputChange);
      input.removeEventListener('input', onInputTyping);
      input.removeEventListener('keydown', onKey);
    },
  };
}
