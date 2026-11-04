export interface HoldButtonOptions {
  onPress: () => void;
  onRelease?: () => void;
  /** Keys that hold the button while it has focus; pass [] when the game reads keys itself. */
  keys?: readonly string[];
}

export interface HoldButtonHandle {
  isHeld(): boolean;
  destroy(): void;
}

const HOLD_KEYS = [' ', 'Enter'] as const;

/**
 * Turns a button into a press-and-hold control for mini-games (pour, charge, heat). The pointer
 * is captured, so a thumb that slides off mid-hold keeps holding until it lifts; the long-press
 * menu and the click that would follow are cancelled; and data-pressed keeps the button sunk
 * while held. Add the gx-btn-hold class for the touch styles; this helper adds it too.
 */
export function holdButton(button: HTMLElement, options: HoldButtonOptions): HoldButtonHandle {
  const keys: readonly string[] = options.keys ?? HOLD_KEYS;
  let isDown = false;
  const press = (): void => {
    if (isDown) return;
    isDown = true;
    button.dataset.pressed = '';
    options.onPress();
  };
  const release = (): void => {
    if (!isDown) return;
    isDown = false;
    delete button.dataset.pressed;
    options.onRelease?.();
  };
  const onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    press();
  };
  const onKeyDown = (e: KeyboardEvent): void => {
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    if (!e.repeat) press();
  };
  const onKeyUp = (e: KeyboardEvent): void => {
    if (keys.includes(e.key)) release();
  };
  const cancel = (e: Event): void => e.preventDefault();

  button.classList.add('gx-btn-hold');
  button.addEventListener('pointerdown', onPointerDown);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
  button.addEventListener('keydown', onKeyDown);
  button.addEventListener('keyup', onKeyUp);
  button.addEventListener('blur', release);
  button.addEventListener('click', cancel);
  button.addEventListener('contextmenu', cancel);

  return {
    isHeld: () => isDown,
    destroy: () => {
      release();
      button.removeEventListener('pointerdown', onPointerDown);
      button.removeEventListener('pointerup', release);
      button.removeEventListener('pointercancel', release);
      button.removeEventListener('lostpointercapture', release);
      button.removeEventListener('keydown', onKeyDown);
      button.removeEventListener('keyup', onKeyUp);
      button.removeEventListener('blur', release);
      button.removeEventListener('click', cancel);
      button.removeEventListener('contextmenu', cancel);
    },
  };
}
