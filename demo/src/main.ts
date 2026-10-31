import '@fontsource/press-start-2p';
import '@fontsource/fusion-pixel-12px-proportional-tc';
import '@fontsource/fusion-pixel-12px-proportional-sc';

import './style.css';
import { isLocale, MESSAGES, type Line, type Locale, type ToastKind } from './i18n';

const HP_MAX = 100;
const HIT_DAMAGE = 23;
const HEAL_AMOUNT = 30;
const CRITICAL_RATIO = 0.25;
const CHARS_PER_SECOND = 40;
/** CJK glyphs carry a word each, so they type slower to stay readable. */
const CJK_CHARS_PER_SECOND = 16;
const SPRITE_FRAME = 16;
const SPRITE_FRAMES = 8;
const ISO_TILES = 16;
const TOAST_DURATION_MS = 4000;
const TOAST_LIMIT = 4;
const LANDSCAPE_W = 80;
const LANDSCAPE_H = 45;

const TOAST_STYLES: Record<ToastKind, { className: string; icon: string }> = {
  info: { className: 'gx-toast gx-toast-info', icon: 'i' },
  success: { className: 'gx-toast gx-toast-success', icon: '+' },
  danger: { className: 'gx-toast gx-toast-danger', icon: 'x' },
  achievement: { className: 'gx-toast gx-toast-achievement', icon: '★' },
};

let locale: Locale = 'en';
const localeListeners: Array<() => void> = [];

function t(key: string): string {
  return MESSAGES[locale].ui[key] ?? MESSAGES.en.ui[key] ?? key;
}

function isCjk(): boolean {
  return locale !== 'en';
}

/** Splits into user-perceived characters so emoji and CJK never break mid-glyph. */
function graphemes(text: string): string[] {
  if ('Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`[demo] missing #${id}`);
  return el as T;
}

function isReducedMotion(): boolean {
  return (
    document.documentElement.dataset.gxMotion === 'reduce' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function setupThemeAndMotion(): void {
  const themeButtons = document.querySelectorAll<HTMLButtonElement>('[data-theme-option]');
  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const theme = button.dataset.themeOption ?? '';
      if (theme) document.documentElement.dataset.gxTheme = theme;
      else delete document.documentElement.dataset.gxTheme;
      themeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    });
  });

  const motionToggle = byId<HTMLButtonElement>('motion-toggle');
  motionToggle.addEventListener('click', () => {
    const isReduced = document.documentElement.dataset.gxMotion === 'reduce';
    if (isReduced) delete document.documentElement.dataset.gxMotion;
    else document.documentElement.dataset.gxMotion = 'reduce';
    motionToggle.setAttribute('aria-pressed', String(!isReduced));
  });
}

function setupHealth(): void {
  const bar = byId('hp-bar');
  const label = byId('hp-label');
  const badge = byId('status-badge');
  let hp = HP_MAX;

  const render = (): void => {
    const ratio = hp / HP_MAX;
    const isCritical = ratio > 0 && ratio <= CRITICAL_RATIO;
    bar.style.setProperty('--gx-value', String(ratio));
    bar.setAttribute('aria-valuenow', String(hp));
    bar.classList.toggle('gx-bar-critical', isCritical);
    label.textContent = `${hp} / ${HP_MAX}`;
    badge.textContent = hp === 0 ? 'KO' : isCritical ? t('statusDanger') : t('statusOk');
    badge.className = `gx-badge ${hp === 0 || isCritical ? 'gx-badge-danger' : 'gx-badge-success'}`;
  };

  byId('hit').addEventListener('click', () => {
    hp = Math.max(0, hp - HIT_DAMAGE);
    render();
  });
  byId('heal').addEventListener('click', () => {
    hp = Math.min(HP_MAX, hp + HEAL_AMOUNT);
    render();
  });
  localeListeners.push(render);
  render();
}

/** Draws an 8-frame slime strip in code, so the demo ships no third-party art. */
function createSlimeStrip(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_FRAME * SPRITE_FRAMES;
  canvas.height = SPRITE_FRAME;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('[demo] 2D canvas unavailable');

  for (let frame = 0; frame < SPRITE_FRAMES; frame++) {
    const squash = Math.round(Math.sin((frame / SPRITE_FRAMES) * Math.PI * 2) * 2);
    const halfWidth = 5 + squash;
    const height = 8 - squash;
    const originX = frame * SPRITE_FRAME + SPRITE_FRAME / 2;
    const bottom = SPRITE_FRAME - 1;

    for (let row = 0; row < height; row++) {
      const t = (row + 0.5) / height;
      const rowHalf = Math.max(1, Math.round(halfWidth * Math.sqrt(1 - (1 - t) ** 2)));
      const y = bottom - height + row + 1;
      ctx.fillStyle = '#0d0d1a';
      ctx.fillRect(originX - rowHalf - 1, y, rowHalf * 2 + 2, 1);
      ctx.fillStyle = row < 2 ? '#7ee787' : '#3fb950';
      ctx.fillRect(originX - rowHalf, y, rowHalf * 2, 1);
    }
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(originX - 2, bottom - height + 4, 1, 2);
    ctx.fillRect(originX + 1, bottom - height + 4, 1, 2);
  }
  return canvas;
}

function firstFrame(strip: HTMLCanvasElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_FRAME;
  canvas.height = SPRITE_FRAME;
  canvas.getContext('2d')?.drawImage(strip, 0, 0);
  return canvas.toDataURL();
}

/** An 80x45 sunset castle, drawn in code and upscaled by the frame with nearest-neighbour. */
function createLandscape(): string {
  const canvas = document.createElement('canvas');
  canvas.width = LANDSCAPE_W;
  canvas.height = LANDSCAPE_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('[demo] 2D canvas unavailable');
  const rect = (color: string, x: number, y: number, w: number, h: number): void => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  ['#24244a', '#4a2f6b', '#8a3a6b', '#d9564a', '#f59e0b'].forEach((color, i) => rect(color, 0, i * 6, LANDSCAPE_W, 6));
  rect('#f5c542', 56, 20, 10, 10);
  rect('#ffe08a', 58, 22, 6, 6);
  rect('#2a1f3d', 0, 30, LANDSCAPE_W, 15);
  for (let x = 0; x < LANDSCAPE_W; x++) {
    const hill = Math.round(6 * Math.sin((x / LANDSCAPE_W) * Math.PI));
    rect('#1b5e20', x, 34 - hill, 1, 11 + hill);
    rect('#2e7d32', x, 34 - hill, 1, 1);
  }
  rect('#3a3a5c', 30, 20, 20, 15);
  rect('#3a3a5c', 27, 15, 6, 20);
  rect('#3a3a5c', 47, 15, 6, 20);
  for (let x = 27; x < 53; x += 2) rect('#3a3a5c', x, x < 33 || x > 46 ? 13 : 18, 1, 2);
  rect('#0d0d1a', 38, 28, 4, 7);
  rect('#f5c542', 29, 19, 2, 2);
  rect('#f5c542', 49, 19, 2, 2);
  rect('#f5c542', 35, 23, 2, 2);
  rect('#f5c542', 43, 23, 2, 2);
  return canvas.toDataURL();
}

function setupMedia(): void {
  byId<HTMLImageElement>('landscape').src = createLandscape();

  const video = byId<HTMLVideoElement>('cutscene');
  const play = byId<HTMLButtonElement>('cutscene-play');
  video.controls = false;
  play.addEventListener('click', () => {
    video.controls = true;
    void video.play();
  });
  video.addEventListener('play', () => {
    play.hidden = true;
  });
  video.addEventListener('ended', () => {
    play.hidden = false;
    video.controls = false;
    video.currentTime = 0;
  });

  const syncCaptions = (): void => {
    const wanted = locale === 'en' ? 'en' : 'zh-Hant';
    Array.from(video.textTracks).forEach((track) => {
      track.mode = track.language === wanted ? 'showing' : 'disabled';
    });
  };
  localeListeners.push(syncCaptions);
  syncCaptions();
}

function setupLanguage(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-lang-option]');

  const apply = (): void => {
    document.documentElement.lang = locale;
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n ?? '');
    });
    document.querySelectorAll<HTMLImageElement>('[data-i18n-alt]').forEach((el) => {
      el.alt = t(el.dataset.i18nAlt ?? '');
    });
    document.querySelectorAll<HTMLElement>('[data-i18n-label]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nLabel ?? ''));
    });
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.langOption === locale)));
    localeListeners.forEach((listener) => listener());
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.langOption;
      if (!isLocale(next) || next === locale) return;
      locale = next;
      apply();
    });
  });
}

function setupSpriteAndIso(): void {
  const strip = createSlimeStrip();
  byId('slime').style.backgroundImage = `url(${strip.toDataURL()})`;
  byId<HTMLImageElement>('avatar-slime').src = firstFrame(strip);

  const grid = byId('iso-grid');
  for (let i = 0; i < ISO_TILES; i++) {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.setAttribute('aria-label', `Tile ${i + 1}`);
    tile.className =
      'size-8 cursor-pointer bg-gx-success shadow-[inset_-4px_-4px_0_0_rgb(0_0_0/0.3)] transition-[translate] duration-(--gx-motion-fast) ease-[steps(2,end)] hover:translate-z-4 active:translate-z-4 focus-visible:translate-z-4 focus-visible:outline-4 focus-visible:outline-gx-focus sm:size-10';
    grid.append(tile);
  }
}

function setupDialogue(): void {
  const speaker = byId('speaker');
  const full = byId('line-full');
  const shown = byId('line-shown');
  const choices = byId('choices');
  const next = byId('next');
  let lineIndex = 0;
  let glyphs: string[] = [];
  let shownCount = 0;
  let timer: number | null = null;

  const line = (): Line => {
    const lines = MESSAGES[locale].lines;
    return lines[lineIndex % lines.length] as Line;
  };
  const isDoneTyping = (): boolean => shownCount >= glyphs.length;

  const stopTyping = (): void => {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  };

  const renderEnd = (): void => {
    const current = line();
    next.hidden = Boolean(current.choices);
    choices.hidden = !current.choices;
    choices.replaceChildren(
      ...(current.choices ?? []).map((label) => {
        const button = document.createElement('button');
        button.className = 'gx-btn gx-btn-ghost gx-btn-sm';
        button.textContent = label;
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          lineIndex = 0;
          startLine();
        });
        return button;
      }),
    );
    choices.querySelector('button')?.focus();
  };

  const startLine = (): void => {
    stopTyping();
    const current = line();
    speaker.textContent = current.speaker;
    full.textContent = current.text;
    next.hidden = true;
    choices.hidden = true;
    glyphs = graphemes(current.text);
    shownCount = isReducedMotion() ? glyphs.length : 0;
    shown.textContent = glyphs.slice(0, shownCount).join('');
    if (isDoneTyping()) {
      renderEnd();
      return;
    }
    timer = window.setInterval(
      () => {
        shownCount++;
        shown.textContent = glyphs.slice(0, shownCount).join('');
        if (isDoneTyping()) {
          stopTyping();
          renderEnd();
        }
      },
      1000 / (isCjk() ? CJK_CHARS_PER_SECOND : CHARS_PER_SECOND),
    );
  };

  const interact = (): void => {
    if (!isDoneTyping()) {
      stopTyping();
      shownCount = glyphs.length;
      shown.textContent = line().text;
      renderEnd();
      return;
    }
    if (line().choices) return;
    lineIndex++;
    startLine();
  };

  byId('advance').addEventListener('click', interact);
  byId('textbox').addEventListener('click', interact);
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.repeat) return;
    if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) return;
    e.preventDefault();
    interact();
  });
  localeListeners.push(() => {
    lineIndex = 0;
    startLine();
  });
  startLine();
}

function setupToasts(): void {
  const stack = byId('toasts');

  const dismiss = (toast: HTMLElement): void => {
    if (toast.dataset.leaving !== undefined) return;
    if (isReducedMotion()) {
      toast.remove();
      return;
    }
    toast.dataset.leaving = '';
    toast.addEventListener('animationend', (e) => {
      if (e.animationName === 'gx-toast-out') toast.remove();
    });
  };

  const show = (kind: ToastKind): void => {
    const config = { ...TOAST_STYLES[kind], ...MESSAGES[locale].toasts[kind] };
    const toast = document.createElement('div');
    toast.className = config.className;
    toast.setAttribute('role', kind === 'danger' ? 'alert' : 'status');

    const icon = document.createElement('span');
    icon.className = 'gx-toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = config.icon;
    const title = document.createElement('p');
    title.className = 'gx-toast-title';
    title.textContent = config.title;
    const body = document.createElement('p');
    body.className = 'gx-toast-body';
    body.textContent = config.body;
    const close = document.createElement('button');
    close.className = 'gx-toast-close';
    close.setAttribute('aria-label', t('dismiss'));
    close.textContent = 'x';
    close.addEventListener('click', () => dismiss(toast));

    toast.append(icon, title, body, close);
    stack.append(toast);
    while (stack.children.length > TOAST_LIMIT) stack.firstElementChild?.remove();

    let timer = window.setTimeout(() => dismiss(toast), TOAST_DURATION_MS);
    const pause = (): void => window.clearTimeout(timer);
    const resume = (): void => {
      timer = window.setTimeout(() => dismiss(toast), TOAST_DURATION_MS);
    };
    toast.addEventListener('pointerenter', pause);
    toast.addEventListener('pointerleave', resume);
    toast.addEventListener('focusin', pause);
    toast.addEventListener('focusout', resume);
  };

  document.querySelectorAll<HTMLButtonElement>('[data-toast]').forEach((button) => {
    button.addEventListener('click', () => show(button.dataset.toast as ToastKind));
  });
}

function setupTabs(): void {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"]'));

  const select = (tab: HTMLButtonElement): void => {
    tabs.forEach((t) => {
      const isSelected = t === tab;
      t.setAttribute('aria-selected', String(isSelected));
      t.tabIndex = isSelected ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls') ?? '');
      if (panel) panel.hidden = !isSelected;
    });
    tab.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!delta) return;
      e.preventDefault();
      select(tabs[(i + delta + tabs.length) % tabs.length] as HTMLButtonElement);
    });
  });

  const slots = Array.from(document.querySelectorAll<HTMLButtonElement>('button.gx-slot'));
  slots.forEach((slot) => {
    slot.addEventListener('click', () => {
      slots.forEach((s) => s.setAttribute('aria-pressed', String(s === slot)));
    });
  });
}

function setupDialog(): void {
  const dialog = byId<HTMLDialogElement>('dialog');
  byId('open-dialog').addEventListener('click', () => dialog.showModal());
}

setupThemeAndMotion();
setupHealth();
setupSpriteAndIso();
setupMedia();
setupDialogue();
setupDialog();
setupToasts();
setupTabs();
setupLanguage();
