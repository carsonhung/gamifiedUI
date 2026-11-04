import { holdButton } from 'gamifiedui-utils';

import { byId, t } from './core';

const SWEEP_MS = 1400;
const FILL_MS = 2200;
const NOTE_COUNT = 4;
const NOTE_GAP_MS = 700;
const NOTE_TRAVEL_MS = 1600;
const HIT_WINDOW = 0.08;
const SHOW_STEPS = 3;
const SHOW_MS = 450;

type Result = 'perfect' | 'good' | 'miss';

/** Where `at` falls in a gauge's zone, using the same 30-70% sweet spot the CSS draws by default. */
function grade(el: HTMLElement, at: number): Result {
  const start = Number(el.style.getPropertyValue('--gx-zone-start'));
  const size = Number(el.style.getPropertyValue('--gx-zone-size'));
  const inZone = (at - start) / size;
  if (inZone >= 0.3 && inZone <= 0.7) return 'perfect';
  return inZone >= 0 && inZone <= 1 ? 'good' : 'miss';
}

function say(result: Result): void {
  byId('mg-status').textContent = t(`mgResult:${result}`);
}

function setupTiming(): void {
  const gauge = byId('mg-timing');
  let frame = 0;
  let started = 0;
  byId('mg-timing-go').addEventListener('click', () => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      say(grade(gauge, Number(gauge.style.getPropertyValue('--gx-value'))));
      return;
    }
    started = performance.now();
    const loop = (now: number): void => {
      const phase = ((now - started) / SWEEP_MS) % 2;
      gauge.style.setProperty('--gx-value', String(phase <= 1 ? phase : 2 - phase));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
  });
}

function setupHold(): void {
  const gauge = byId('mg-fill');
  let frame = 0;
  let level = 0;
  const show = (): void => {
    gauge.style.setProperty('--gx-value', String(level));
    gauge.setAttribute('aria-valuenow', String(Math.round(level * 100)));
  };
  holdButton(byId('mg-hold'), {
    onPress: () => {
      level = 0;
      let last = performance.now();
      const loop = (now: number): void => {
        level = Math.min(1, level + (now - last) / FILL_MS);
        last = now;
        show();
        frame = level < 1 ? requestAnimationFrame(loop) : 0;
      };
      frame = requestAnimationFrame(loop);
    },
    onRelease: () => {
      cancelAnimationFrame(frame);
      show();
      say(grade(gauge, level));
    },
  });
}

function setupRhythm(): void {
  const lane = byId('mg-lane');
  let notes: { at: number; el: HTMLElement; isDone: boolean }[] = [];
  let started = 0;
  let frame = 0;
  const loop = (now: number): void => {
    const elapsed = now - started;
    for (const note of notes) note.el.style.setProperty('--gx-at', String((note.at - elapsed) / NOTE_TRAVEL_MS));
    if (notes.every((note) => note.isDone || note.at - elapsed < -HIT_WINDOW * NOTE_TRAVEL_MS * 2)) {
      for (const note of notes) note.el.remove();
      notes = [];
      frame = 0;
      return;
    }
    frame = requestAnimationFrame(loop);
  };
  byId('mg-hit').addEventListener('click', () => {
    if (!frame) {
      started = performance.now();
      notes = Array.from({ length: NOTE_COUNT }, (_, i) => {
        const el = document.createElement('span');
        el.className = 'gx-lane-note gx-icon gx-icon-lg gx-i-star';
        el.setAttribute('aria-hidden', 'true');
        lane.append(el);
        return { at: NOTE_TRAVEL_MS + i * NOTE_GAP_MS, el, isDone: false };
      });
      frame = requestAnimationFrame(loop);
      return;
    }
    const elapsed = performance.now() - started;
    const next = notes.find((note) => !note.isDone);
    if (!next) return;
    const off = Math.abs(next.at - elapsed) / NOTE_TRAVEL_MS;
    if (off > HIT_WINDOW * 2) return say('miss');
    next.isDone = true;
    next.el.dataset.done = '';
    say(off <= HIT_WINDOW ? 'perfect' : 'good');
  });
}

function setupPad(): void {
  const keys = [...byId('mg-pad').querySelectorAll<HTMLButtonElement>('button')];
  let order: number[] = [];
  let copied = 0;
  const light = (index: number | null): void => {
    keys.forEach((key, i) => {
      if (i === index) key.dataset.lit = '';
      else delete key.dataset.lit;
    });
  };
  byId('mg-show').addEventListener('click', () => {
    order = Array.from({ length: SHOW_STEPS }, () => Math.floor(Math.random() * keys.length));
    copied = 0;
    keys.forEach((key) => (key.disabled = true));
    byId('mg-status').textContent = t('mgWatch');
    order.forEach((index, step) => {
      window.setTimeout(() => light(index), step * SHOW_MS * 2);
      window.setTimeout(() => light(null), step * SHOW_MS * 2 + SHOW_MS);
    });
    window.setTimeout(() => {
      keys.forEach((key) => (key.disabled = false));
      keys[order[0] ?? 0]?.focus();
      byId('mg-status').textContent = t('mgYourTurn');
    }, SHOW_STEPS * SHOW_MS * 2);
  });
  keys.forEach((key, i) =>
    key.addEventListener('click', () => {
      if (i !== order[copied]) {
        keys.forEach((k) => (k.disabled = true));
        return say('miss');
      }
      copied += 1;
      if (copied < order.length) return;
      keys.forEach((k) => (k.disabled = true));
      say('perfect');
    }),
  );
}

export function setupMinigames(): void {
  setupTiming();
  setupHold();
  setupRhythm();
  setupPad();
}
