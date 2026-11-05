import '@fontsource/press-start-2p';
import '@fontsource/fusion-pixel-12px-proportional-tc';
import '@fontsource/fusion-pixel-12px-proportional-sc';

import {
  autoAdvanceMs,
  confirmDialog,
  fitMapPlates,
  gridNav,
  mapZoom,
  tabs,
  TEXT_SPEEDS,
  toast,
  typewriter,
  videoPlayOverlay,
  type TypewriterHandle,
} from 'gamifiedui-utils';

import './style.css';
import { byId, locale, notifyLocaleChange, onLocaleChange, setLocale, t } from './core';
import { isLocale, MESSAGES, type Line, type ToastKind } from './i18n';
import { setupSound } from './sound';
import { setupTime } from './time';
import { setupUpload } from './upload';
import { refreshPageTitle, setupPages } from './pages';
import { setupGameWidgets } from './widgets';
import { setupMinigames } from './minigames';

const HP_MAX = 100;
const HIT_DAMAGE = 23;
const HEAL_AMOUNT = 30;
const CRITICAL_RATIO = 0.25;
const SPRITE_FRAME = 16;
const SPRITE_FRAMES = 8;
const ISO_TILES = 16;
const TOAST_DURATION_MS = 4000;
const TOAST_LIMIT = 4;
const LANDSCAPE_W = 80;
const LANDSCAPE_H = 45;
const HEART_COUNT = 5;
const SKIP_DELAY_MS = 150;
const TEXT_SPEED_KEY = 'gx-demo-text-speed-step';
const AUTO_WAIT_KEY = 'gx-demo-auto-wait';
/** Slider steps per 1x; the speed slider's last step means instant. */
const SLIDER_STEPS_PER_X = 4;
const THEME_KEY = 'gx-demo-theme';


function setupThemeAndMotion(): void {
  const themeButtons = document.querySelectorAll<HTMLButtonElement>('[data-theme-option]');
  const applyTheme = (theme: string): void => {
    if (theme) document.documentElement.dataset.gxTheme = theme;
    else delete document.documentElement.dataset.gxTheme;
    themeButtons.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.themeOption ?? '') === theme)));
  };
  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const theme = button.dataset.themeOption ?? '';
      applyTheme(theme);
      localStorage.setItem(THEME_KEY, theme);
    });
  });
  applyTheme(localStorage.getItem(THEME_KEY) ?? '');

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
  const hearts = byId('hearts');
  let hp = HP_MAX;

  const render = (): void => {
    const ratio = hp / HP_MAX;
    const isCritical = ratio > 0 && ratio <= CRITICAL_RATIO;
    bar.style.setProperty('--gx-value', String(ratio));
    bar.setAttribute('aria-valuenow', String(hp));
    bar.classList.toggle('gx-bar-critical', isCritical);
    label.textContent = `${hp} / ${HP_MAX}`;
    const heartCount = Math.round(ratio * HEART_COUNT * 2) / 2;
    hearts.style.setProperty('--gx-value', String(heartCount));
    hearts.setAttribute('aria-label', t('hearts', { n: heartCount }));
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
  onLocaleChange(render);
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
  videoPlayOverlay(video, byId<HTMLButtonElement>('cutscene-play'));

  const syncCaptions = (): void => {
    const wanted = locale === 'en' ? 'en' : 'zh-Hant';
    Array.from(video.textTracks).forEach((track) => {
      track.mode = track.language === wanted ? 'showing' : 'disabled';
    });
  };
  onLocaleChange(syncCaptions);
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
    document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder ?? '');
    });
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.langOption === locale)));
    notifyLocaleChange();
    refreshPageTitle();
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.langOption;
      if (!isLocale(next) || next === locale) return;
      setLocale(next);
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
  const autoButton = byId<HTMLButtonElement>('auto-play');
  const skipButton = byId<HTMLButtonElement>('skip-read');
  const mode = byId('reader-mode');
  const logList = byId('log-list');
  const settingsToggle = byId<HTMLButtonElement>('reader-settings-toggle');
  const settings = byId('reader-settings');
  const speedInput = byId<HTMLInputElement>('text-speed');
  const speedValue = byId('text-speed-value');
  const waitInput = byId<HTMLInputElement>('auto-wait');
  const waitValue = byId('auto-wait-value');
  let lineIndex = 0;
  let typing: TypewriterHandle | null = null;
  let advanceTimer: number | undefined;
  let isAuto = false;
  let isSkipping = false;

  const line = (): Line => {
    const lines = MESSAGES[locale].lines;
    return lines[lineIndex % lines.length] as Line;
  };

  const speedMultiplier = (): number => {
    const step = Number(speedInput.value);
    return step >= Number(speedInput.max) ? TEXT_SPEEDS.instant : step / SLIDER_STEPS_PER_X;
  };
  const waitMultiplier = (): number => Number(waitInput.value) / SLIDER_STEPS_PER_X;

  const renderSettings = (): void => {
    const speedX = speedMultiplier();
    speedValue.textContent = Number.isFinite(speedX) ? `${speedX}×` : t('speedInstant');
    waitValue.textContent = `${waitMultiplier()}×`;
  };

  const renderMode = (): void => {
    mode.textContent = isSkipping ? t('modeSkip') : isAuto ? t('modeAuto') : '';
  };

  const setSkipping = (on: boolean): void => {
    isSkipping = on;
    skipButton.setAttribute('aria-pressed', String(on));
    renderMode();
  };

  const logLine = (current: Line): void => {
    const item = document.createElement('li');
    const who = document.createElement('span');
    who.className = 'gx-textbox-log-speaker';
    who.textContent = current.speaker;
    item.append(who, current.text);
    logList.append(item);
  };

  const scheduleAdvance = (): void => {
    window.clearTimeout(advanceTimer);
    if (line().choices) {
      setSkipping(false);
      return;
    }
    if (isSkipping) advanceTimer = window.setTimeout(advance, SKIP_DELAY_MS);
    else if (isAuto) advanceTimer = window.setTimeout(advance, autoAdvanceMs(line().text, locale) * waitMultiplier());
  };

  const renderEnd = (): void => {
    const current = line();
    logLine(current);
    scheduleAdvance();
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
    typing?.cancel();
    window.clearTimeout(advanceTimer);
    const current = line();
    speaker.textContent = current.speaker;
    full.textContent = current.text;
    next.hidden = true;
    choices.hidden = true;
    typing = typewriter(shown, current.text, {
      locale,
      speed: isSkipping ? TEXT_SPEEDS.instant : speedMultiplier(),
      onDone: renderEnd,
    });
  };

  function advance(): void {
    if (line().choices) return;
    lineIndex++;
    startLine();
  }

  const interact = (): void => {
    setSkipping(false);
    if (typing && !typing.done) {
      typing.skip();
      return;
    }
    advance();
  };

  const setSettingsOpen = (open: boolean): void => {
    settings.hidden = !open;
    settingsToggle.setAttribute('aria-expanded', String(open));
  };

  byId('reader-quick').addEventListener('click', (e) => e.stopPropagation());
  byId('line-back').addEventListener('click', () => {
    setSkipping(false);
    lineIndex = Math.max(0, lineIndex - 1);
    startLine();
  });
  autoButton.addEventListener('click', () => {
    isAuto = !isAuto;
    autoButton.setAttribute('aria-pressed', String(isAuto));
    renderMode();
    if (typing?.done) scheduleAdvance();
    else window.clearTimeout(advanceTimer);
  });
  skipButton.addEventListener('click', () => {
    setSkipping(!isSkipping);
    if (!isSkipping) window.clearTimeout(advanceTimer);
    else if (typing && !typing.done) typing.skip();
    else scheduleAdvance();
  });
  settingsToggle.addEventListener('click', () => setSettingsOpen(settings.hidden));
  settings.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    setSettingsOpen(false);
    settingsToggle.focus();
  });
  document.addEventListener('click', (e) => {
    if (!settings.hidden && !settings.contains(e.target as Node) && e.target !== settingsToggle) setSettingsOpen(false);
  });
  for (const [input, key] of [
    [speedInput, TEXT_SPEED_KEY],
    [waitInput, AUTO_WAIT_KEY],
  ] as const) {
    const saved = localStorage.getItem(key);
    if (saved) input.value = saved;
    input.addEventListener('input', () => {
      localStorage.setItem(key, input.value);
      renderSettings();
    });
  }
  renderSettings();
  const logDialog = byId<HTMLDialogElement>('log-dialog');
  byId('open-log').addEventListener('click', () => {
    window.clearTimeout(advanceTimer);
    logDialog.showModal();
    logList.scrollTop = logList.scrollHeight;
  });
  logDialog.addEventListener('close', () => {
    if (typing?.done) scheduleAdvance();
  });

  byId('advance').addEventListener('click', interact);
  byId('textbox').addEventListener('click', interact);
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.repeat) return;
    if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) return;
    e.preventDefault();
    interact();
  });
  onLocaleChange(() => {
    lineIndex = 0;
    startLine();
  });
  startLine();
}

function setupToasts(): void {
  const stack = byId('toasts');
  document.querySelectorAll<HTMLButtonElement>('[data-toast]').forEach((button) => {
    button.addEventListener('click', () => {
      const tone = button.dataset.toast as ToastKind;
      toast({
        ...MESSAGES[locale].toasts[tone],
        tone,
        stack,
        duration: TOAST_DURATION_MS,
        limit: TOAST_LIMIT,
        dismissLabel: t('dismiss'),
      });
    });
  });
}

function setupTabs(): void {
  const tablist = document.querySelector<HTMLElement>('[role="tablist"]');
  if (tablist) tabs(tablist);

  const inventory = byId('bag-inventory');
  const slots = Array.from(inventory.querySelectorAll<HTMLButtonElement>('button.gx-slot:not([aria-disabled="true"])'));
  slots.forEach((slot) => {
    slot.addEventListener('click', () => {
      slots.forEach((s) => s.setAttribute('aria-pressed', String(s === slot)));
    });
  });
  gridNav(inventory);
  gridNav(byId('gear-grid'));
}

function setupInfoAndMap(): void {
  const hint = byId('demo-hint');
  const toggle = byId<HTMLButtonElement>('toggle-hint');
  toggle.addEventListener('click', () => {
    const isShown = hint.toggleAttribute('data-hidden') === false;
    toggle.setAttribute('aria-pressed', String(isShown));
  });
  mapZoom(byId('map-viewport'), { min: 1, max: 3, step: 0.25, initial: 1.5 });

  const route = byId('route-viewport');
  fitMapPlates(route);
  onLocaleChange(() => fitMapPlates(route));
  mapZoom(route, { min: 0.5, max: 2.5, step: 0.25, initial: 'fit-width', wheel: 'modifier' });
}

function setupDialog(): void {
  const dialog = byId<HTMLDialogElement>('dialog');
  byId('open-dialog').addEventListener('click', () => dialog.showModal());
  byId('open-confirm').addEventListener('click', () => {
    void confirmDialog({
      message: t('confirmQuitBody'),
      confirmLabel: t('quitTitle'),
      cancelLabel: t('cancel'),
      tone: 'danger',
      scene: quitScene(),
    }).then((isSure) => toast({ title: t(isSure ? 'confirmQuitYes' : 'confirmQuitNo'), tone: isSure ? 'warning' : 'info' }));
  });
}

function quitScene(): DocumentFragment {
  const scene = document.createDocumentFragment();
  const face = document.createElement('span');
  face.className = 'gx-icon gx-icon-xl gx-i-knight';
  face.setAttribute('aria-hidden', 'true');
  const box = document.createElement('div');
  box.className = 'gx-textbox';
  const speaker = document.createElement('p');
  speaker.className = 'gx-textbox-speaker';
  speaker.textContent = t('confirmQuitSpeaker');
  const line = document.createElement('p');
  line.className = 'gx-textbox-text';
  line.textContent = t('confirmQuitLine');
  box.append(speaker, line);
  scene.append(face, box);
  return scene;
}

function setupDesktop(): void {
  const start = byId<HTMLButtonElement>('start-button');
  const menu = byId<HTMLElement>('start-menu');
  const setOpen = (isOpen: boolean): void => {
    menu.hidden = !isOpen;
    start.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) menu.querySelector<HTMLElement>('button')?.focus();
  };

  start.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    setOpen(false);
    start.focus();
  });
  document.addEventListener('click', (e) => {
    const target = e.target as Node;
    if (!menu.hidden && !menu.contains(target) && !start.contains(target)) setOpen(false);
  });

  const wallpapers = Array.from(menu.querySelectorAll<HTMLButtonElement>('.gx-start-menu-grid button'));
  wallpapers.forEach((button) =>
    button.addEventListener('click', () => {
      wallpapers.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    }),
  );
}

setupPages();
setupThemeAndMotion();
setupDesktop();
setupInfoAndMap();
setupHealth();
setupSpriteAndIso();
setupMedia();
setupDialogue();
setupDialog();
setupMinigames();
setupToasts();
setupTabs();
setupGameWidgets(byId<HTMLImageElement>('avatar-slime').src);
setupTime();
setupUpload();
setupSound();
setupLanguage();
