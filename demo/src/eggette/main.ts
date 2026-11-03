import '@fontsource/press-start-2p';
import '@fontsource/fusion-pixel-12px-proportional-tc';
import '@fontsource/fusion-pixel-12px-proportional-sc';
import { createSfx, type SoundName } from 'gamifiedui-sfx';
import { burst, floatText, rollNumber, toast, typewriter, type ToastTone, type TypewriterHandle } from 'gamifiedui-utils';
import './game.css';
import {
  CHANGE_COINS,
  CLOSE_HOUR,
  COOK_SIDE_MS,
  DAY_MS,
  FLAVOUR_POWDER,
  FLAVOURS,
  FLIP_WINDOW_MS,
  INGREDIENTS,
  LOCALE_KEY,
  OPEN_HOUR,
  POSE_RESET_MS,
  READY_WINDOW_MS,
  SAVE_KEY,
  SHOP_LEVELS,
  STOCK_PACKS,
  TICK_MS,
  type Flavour,
  type Ingredient,
  type UpgradeId,
} from './config';
import {
  buyStock,
  buyUpgrade,
  canServe,
  changeDue,
  clearShift,
  changeGiven,
  collect,
  flip,
  giveCoin,
  hasWon,
  isUnlocked,
  levelOf,
  missingForMix,
  mixMs,
  newGame,
  nextDay,
  pour,
  priceOf,
  serve,
  settle,
  startDay,
  startMix,
  tick,
  undoCoin,
  upgradePrice,
  type Fail,
  type GameEvent,
  type GameState,
  type Pan,
} from './model';
import { GAME_LOCALES, GAME_TEXT, type GameLocale } from './text';
import { gridSvg, type Pose } from './pixel';
import { warriorGrid } from './warrior';

const INTRO_LINES = ['intro:1', 'intro:2', 'intro:3', 'intro:4', 'intro:5'];
const INGREDIENT_EMOJI: Record<Ingredient, string> = { flour: '🌾', egg: '🥚', sugar: '🍬', milk: '🥛', cocoa: '🍫', matcha: '🍵' };
const UPGRADES: UpgradeId[] = ['pan', 'mixer', 'chocolate', 'matcha', 'fan', 'octopus', 'expand'];
const MOOD_CALM = 0.55;
const MOOD_UPSET = 0.25;
const SFX_KEY = 'gx-eggette-sfx';
const TOAST_MS = 3000;

const random = Math.random;
const sfx = createSfx({ storageKey: SFX_KEY, volume: 0.4 });

let locale: GameLocale = loadLocale();
let state: GameState = loadGame();
let isPaused = false;
let introIndex = 0;
let pose: Pose = 'idle';
let poseTimer = 0;
let writer: TypewriterHandle | undefined;
const signatures = new Map<string, string>();

function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`[eggette] missing #${id}`);
  return el as T;
}

function t(key: string, vars: Record<string, string | number> = {}): string {
  let text = GAME_TEXT[locale][key] ?? GAME_TEXT.en[key] ?? key;
  for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
  return text;
}

const flavourName = (f: Flavour): string => t(`flavour:${f}`);
const flavourTitle = (f: Flavour): string => t(`name:${f}`);

function loadLocale(): GameLocale {
  const saved = localStorage.getItem(LOCALE_KEY);
  if (GAME_LOCALES.includes(saved as GameLocale)) return saved as GameLocale;
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith('zh')) return /cn|sg|hans/.test(browser) ? 'zh-Hans' : 'zh-Hant';
  return 'en';
}

function loadGame(): GameState {
  const fresh = newGame();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return fresh;
    const saved = JSON.parse(raw) as Partial<GameState>;
    const loaded: GameState = { ...fresh, ...saved, owned: { ...fresh.owned, ...saved.owned }, stock: { ...fresh.stock, ...saved.stock }, phase: 'intro' };
    clearShift(loaded);
    return loaded;
  } catch (error) {
    console.error('[eggette] could not read the save, starting fresh', error);
    return fresh;
  }
}

function saveGame(): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[eggette] could not save', error);
  }
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function button(label: string, key: string, onClick: () => void, className = 'gx-btn gx-btn-sm'): HTMLButtonElement {
  const b = el('button', className, label);
  b.type = 'button';
  b.dataset.key = key;
  b.addEventListener('click', onClick);
  return b;
}

function icon(name: string, size = 'gx-icon-sm'): HTMLSpanElement {
  const span = el('span', `gx-icon ${size} gx-i-${name}`);
  span.setAttribute('aria-hidden', 'true');
  return span;
}

function bar(kind: string, label: string): HTMLDivElement {
  const b = el('div', `gx-bar ${kind}`);
  b.setAttribute('role', 'progressbar');
  b.setAttribute('aria-label', label);
  b.setAttribute('aria-valuemin', '0');
  b.setAttribute('aria-valuemax', '100');
  return b;
}

function setBar(b: Element | null, value: number): void {
  if (!(b instanceof HTMLElement)) return;
  const v = Math.max(0, Math.min(1, value));
  b.style.setProperty('--gx-value', v.toFixed(3));
  b.setAttribute('aria-valuenow', String(Math.round(v * 100)));
}

/** Rebuilds a panel only when its discrete state changed, then puts focus back by data-key. */
function patch(id: string, signature: string, build: (root: HTMLElement) => void): void {
  if (signatures.get(id) === signature) return;
  signatures.set(id, signature);
  const root = byId(id);
  const focusKey = root.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.key : undefined;
  root.replaceChildren();
  build(root);
  if (focusKey) root.querySelector<HTMLElement>(`[data-key="${focusKey}"]`)?.focus();
}

function play(sound: SoundName): void {
  sfx.play(sound);
}

function setPose(next: Pose): void {
  pose = next;
  window.clearTimeout(poseTimer);
  renderWarrior();
  if (next !== 'idle') poseTimer = window.setTimeout(() => setPose('idle'), POSE_RESET_MS);
}

function renderWarrior(): void {
  const host = byId('warrior');
  host.innerHTML = gridSvg(warriorGrid(pose), t(`pose:${pose}`));
  host.dataset.pose = pose;
}

function say(text: string, nextPose?: Pose): void {
  writer?.cancel();
  byId('line-full').textContent = text;
  writer = typewriter(byId('line'), text, { locale, speed: 2 });
  if (nextPose) setPose(nextPose);
}

function notify(title: string, tone: ToastTone, glyph: string): void {
  toast({ title, tone, icon: glyph, stack: byId('toasts'), duration: TOAST_MS });
}

function explain(reason: Fail, flavour: Flavour = state.flavour): void {
  play('error');
  say(t(`fail:${reason}`, { flavour: flavourName(flavour) }));
}

function clockText(): string {
  const share = Math.min(1, state.clock / DAY_MS);
  const minutes = Math.floor(share * (CLOSE_HOUR - OPEN_HOUR) * 60);
  const h = OPEN_HOUR + Math.floor(minutes / 60);
  return `${h}:${String(minutes % 60).padStart(2, '0')}`;
}

function renderHud(): void {
  byId('day').textContent = t('day', { n: state.day });
  byId('level').textContent = t(`level:${levelOf(state).id}`);
  const coins = byId('coins');
  if (!coins.dataset.rolling) coins.textContent = String(state.coins);
  const rep = byId('reputation');
  const stars = Math.round(state.reputation * 2) / 2;
  rep.style.setProperty('--gx-value', String(Math.round(state.reputation)));
  rep.setAttribute('aria-label', `${t('reputation')} ${stars} / 5`);
  byId('clock-text').textContent = clockText();
  setBar(byId('clock-bar'), state.clock / DAY_MS);
  const pauseBtn = byId('pause');
  pauseBtn.textContent = t(isPaused ? 'resume' : 'pause');
  pauseBtn.setAttribute('aria-pressed', String(isPaused));
  pauseBtn.hidden = state.phase !== 'open';
  byId('intro-actions').hidden = state.phase !== 'intro';
  document.body.dataset.phase = state.phase;
}

function moodIcon(share: number): string {
  if (share > MOOD_CALM) return 'smile';
  if (share > MOOD_UPSET) return 'neutral';
  return 'angry';
}

function renderQueue(): void {
  const seats = levelOf(state).seats;
  byId('queue-seats').textContent = t('queueSeats', { n: state.queue.length, max: seats });
  const servable = canServe(state);
  const sig = [locale, servable, state.payment?.customerId, ...state.queue.map((c) => `${c.id}:${c.order.join('+')}`)].join('|');
  patch('queue', sig, (root) => {
    if (state.queue.length === 0) {
      root.append(el('li', 'ew-empty', t('queueEmpty')));
      return;
    }
    state.queue.forEach((customer, i) => {
      const li = el('li', 'ew-customer');
      li.dataset.id = String(customer.id);
      const face = el('span', 'ew-face');
      face.append(icon(customer.icon, 'gx-icon-lg'));
      const mood = el('span', 'ew-mood');
      mood.append(icon('smile'));
      face.append(mood);
      const body = el('div', 'ew-customer-body');
      const order = el('div', 'ew-order');
      order.append(el('span', 'sr-only', t('order')));
      order.append(...customer.order.map((f) => orderChip(f)));
      const patience = bar('gx-bar-hp ew-patience', t('patience'));
      body.append(order, patience);
      li.append(face, body);
      if (i === 0) {
        li.classList.add('ew-customer-front');
        const isPaying = state.payment?.customerId === customer.id;
        const serveBtn = button(t('serve'), 'serve', onServe, 'gx-btn gx-btn-success gx-btn-sm');
        serveBtn.disabled = !servable || isPaying;
        li.append(serveBtn);
      }
      root.append(li);
    });
  });
  for (const customer of state.queue) {
    const li = byId('queue').querySelector<HTMLElement>(`[data-id="${customer.id}"]`);
    if (!li) continue;
    const isPaying = state.payment?.customerId === customer.id;
    const share = isPaying ? 1 : 1 - (state.clock - customer.arrivedAt) / customer.patienceMs;
    setBar(li.querySelector('.ew-patience'), share);
    const mood = li.querySelector('.ew-mood > .gx-icon');
    if (mood) mood.className = `gx-icon gx-icon-sm gx-i-${moodIcon(share)}`;
  }
}

function orderChip(flavour: Flavour, count = 1, isGolden = false): HTMLSpanElement {
  const chip = el('span', 'gx-chip ew-flavour');
  chip.dataset.flavour = flavour;
  chip.append(icon('egg-waffle'), el('span', '', count > 1 ? `${flavourTitle(flavour)} ×${count}` : flavourTitle(flavour)));
  if (isGolden) chip.append(icon('sparkle'));
  return chip;
}

function panAction(pan: Pan, index: number): HTMLButtonElement {
  const key = `pan-${index}`;
  switch (pan.phase) {
    case 'empty': {
      const b = button(t('pour', { flavour: flavourName(state.flavour) }), key, () => onPour(index));
      b.disabled = state.phase !== 'open';
      return b;
    }
    case 'flip':
      return button(t('flip'), key, () => onFlip(index), 'gx-btn gx-btn-warning gx-btn-sm');
    case 'ready':
      return button(t('take'), key, () => onCollect(index), 'gx-btn gx-btn-success gx-btn-sm');
    case 'burnt':
      return button(t('scrape'), key, () => onCollect(index), 'gx-btn gx-btn-danger gx-btn-sm');
    default: {
      const b = button(t('wait'), key, () => undefined, 'gx-btn gx-btn-ghost gx-btn-sm');
      b.disabled = true;
      return b;
    }
  }
}

function panProgress(pan: Pan): number {
  const age = state.clock - pan.phaseAt;
  if (pan.phase === 'sideA' || pan.phase === 'sideB') return age / COOK_SIDE_MS;
  if (pan.phase === 'flip') return 1 - age / FLIP_WINDOW_MS;
  if (pan.phase === 'ready') return 1 - age / READY_WINDOW_MS;
  return 0;
}

function renderPans(): void {
  const sig = [locale, state.phase, state.flavour, ...state.pans.map((p) => `${p.phase}:${p.flavour}`)].join('|');
  patch('pans', sig, (root) => {
    state.pans.forEach((pan, i) => {
      const card = el('div', 'ew-pan');
      card.dataset.phase = pan.phase;
      card.dataset.flavour = pan.flavour;
      const art = el('div', 'ew-pan-art');
      art.setAttribute('aria-hidden', 'true');
      for (let b = 0; b < 9; b++) art.append(el('span', 'ew-bubble'));
      const label = el('p', 'ew-pan-label');
      label.append(el('span', 'ew-pan-name', t('pan', { n: i + 1 })), el('span', 'ew-pan-state', t(`pan:${pan.phase}`)));
      const progress = bar(pan.phase === 'flip' || pan.phase === 'ready' ? 'gx-bar-hp' : 'gx-bar-xp', t(`pan:${pan.phase}`));
      progress.classList.add('ew-pan-bar');
      progress.hidden = pan.phase === 'empty' || pan.phase === 'burnt';
      card.append(art, label, progress, panAction(pan, i));
      root.append(card);
    });
  });
  byId('pans')
    .querySelectorAll('.ew-pan')
    .forEach((card, i) => {
      const pan = state.pans[i];
      if (pan) setBar(card.querySelector('.ew-pan-bar'), panProgress(pan));
    });
}

function renderMixer(): void {
  const isMixing = state.mixStartedAt !== null;
  const missing = missingForMix(state, state.flavour);
  const sig = [locale, state.phase, state.flavour, isMixing, missing.join(), ...FLAVOURS.map((f) => `${f}${state.batter[f]}${isUnlocked(state, f)}`)].join('|');
  patch('mixer', sig, (root) => {
    const picker = el('div', 'ew-flavours');
    picker.setAttribute('role', 'group');
    picker.setAttribute('aria-label', t('flavourPick'));
    for (const f of FLAVOURS) {
      const unlocked = isUnlocked(state, f);
      const chip = button(`${flavourTitle(f)} · ${state.batter[f]}`, `flavour-${f}`, () => onPickFlavour(f), 'gx-chip ew-flavour');
      chip.dataset.flavour = f;
      chip.setAttribute('aria-pressed', String(state.flavour === f));
      chip.prepend(icon(unlocked ? 'egg-waffle' : 'lock'));
      chip.disabled = !unlocked;
      if (!unlocked) chip.title = t('locked');
      picker.append(chip);
    }
    const powder = FLAVOUR_POWDER[state.flavour];
    const recipe = el('p', 'ew-recipe', t('recipe') + (powder ? ` ${t('recipePowder', { powder: t(powder) })}` : ''));
    const row = el('div', 'ew-mix-row');
    const mixBtn = button(isMixing ? t('mixing') : t('mix', { flavour: flavourName(state.flavour) }), 'mix', onMix);
    mixBtn.disabled = isMixing || state.phase !== 'open';
    const progress = bar('gx-bar-mp ew-mix-bar', t('mixing'));
    progress.hidden = !isMixing;
    row.append(mixBtn, progress);
    root.append(picker, row, recipe);
    if (missing.length > 0 && !isMixing) {
      root.append(el('p', 'ew-warn', t('need', { items: missing.map((m) => t(m)).join(locale === 'en' ? ', ' : '、') })));
    }
  });
  if (state.mixStartedAt !== null) setBar(byId('mixer').querySelector('.ew-mix-bar'), (state.clock - state.mixStartedAt) / mixMs(state));
}

function renderTray(): void {
  const groups = new Map<string, { flavour: Flavour; count: number; isGolden: boolean }>();
  for (const w of state.tray) {
    const key = `${w.flavour}-${w.isGolden}`;
    const g = groups.get(key) ?? { flavour: w.flavour, count: 0, isGolden: w.isGolden };
    g.count++;
    groups.set(key, g);
  }
  const sig = [locale, ...groups.keys(), ...[...groups.values()].map((g) => g.count)].join('|');
  patch('tray', sig, (root) => {
    if (groups.size === 0) {
      root.append(el('p', 'ew-empty', t('trayEmpty')));
      return;
    }
    const list = el('div', 'ew-tray');
    for (const g of groups.values()) {
      const chip = orderChip(g.flavour, g.count, g.isGolden);
      if (g.isGolden) chip.title = t('golden');
      list.append(chip);
    }
    root.append(list);
  });
}

function renderCashier(): void {
  const p = state.payment;
  const sig = [locale, p ? JSON.stringify(p) : 'none'].join('|');
  patch('cashier', sig, (root) => {
    if (!p) {
      root.append(el('p', 'ew-empty', t('noOneToServe')));
      return;
    }
    const dl = el('dl', 'ew-bill');
    const row = (term: string, value: string): void => {
      dl.append(el('dt', '', term), el('dd', 'tabular-nums', value));
    };
    row(t('total'), `$${p.total}`);
    if (p.paid === null) {
      root.append(dl, el('p', 'ew-pay-note', t('paidOctopus')));
      const tap = button(t('tapOctopus'), 'octopus', onSettle, 'gx-btn gx-btn-warning');
      tap.prepend(icon('credit-card'));
      root.append(tap);
      return;
    }
    row(t('paidCash', { n: p.paid }), `$${p.paid}`);
    row(t('changeDue'), `$${changeDue(p)}`);
    row(t('changeGiven'), `$${changeGiven(p)}`);
    dl.lastElementChild?.classList.toggle('ew-ok', changeGiven(p) === changeDue(p));
    const coins = el('div', 'ew-coins-row');
    coins.setAttribute('role', 'group');
    coins.setAttribute('aria-label', t('changeGiven'));
    for (const value of CHANGE_COINS) {
      const b = button(`$${value}`, `coin-${value}`, () => onGiveCoin(value), 'gx-btn gx-btn-ghost gx-btn-sm');
      b.setAttribute('aria-label', t('giveCoin', { n: value }));
      coins.append(b);
    }
    const actions = el('div', 'ew-pay-actions');
    const undo = button(t('undo'), 'undo', onUndoCoin, 'gx-btn gx-btn-ghost gx-btn-sm');
    undo.disabled = p.given.length === 0;
    actions.append(undo, button(t('handOver'), 'settle', onSettle, 'gx-btn gx-btn-success gx-btn-sm'));
    root.append(dl, coins, actions);
  });
}

function renderStock(): void {
  const sig = [locale, state.coins, ...INGREDIENTS.map((i) => `${i}${state.stock[i]}`), state.owned.chocolate, state.owned.matcha].join('|');
  patch('stock', sig, (root) => {
    for (const item of INGREDIENTS) {
      const isLocked = (item === 'cocoa' && !state.owned.chocolate) || (item === 'matcha' && !state.owned.matcha);
      const li = el('li', 'ew-stock-row');
      const slot = el('span', 'gx-slot ew-slot', INGREDIENT_EMOJI[item]);
      slot.setAttribute('role', 'img');
      slot.setAttribute('aria-label', `${t(item)} ${state.stock[item]}`);
      const count = el('span', 'gx-slot-count', String(state.stock[item]));
      count.setAttribute('aria-hidden', 'true');
      slot.append(count);
      const pack = STOCK_PACKS[item];
      const buy = button(isLocked ? t('locked') : t('buyPack', { units: pack.units, price: pack.price }), `buy-${item}`, () => onBuy(item), 'gx-btn gx-btn-ghost gx-btn-sm');
      buy.disabled = isLocked || state.coins < pack.price;
      li.append(slot, el('span', 'ew-stock-name', t(item)), buy);
      root.append(li);
    }
  });
}

function renderSummary(): void {
  const s = state.stats;
  byId('summary-title').textContent = t('summaryTitle', { n: state.day });
  const stats = byId('summary-stats');
  stats.replaceChildren();
  for (const [key, value] of [
    ['served', s.served],
    ['lost', s.lost],
    ['revenue', `$${s.revenue}`],
    ['spent', `$${s.spent}`],
    ['goldenCount', s.golden],
    ['burnt', s.burnt],
  ] as const) {
    const cell = el('div', 'ew-stat');
    cell.append(el('dt', '', t(key)), el('dd', 'tabular-nums', String(value)));
    stats.append(cell);
  }
  const won = byId('won');
  won.hidden = !hasWon(state);
  won.textContent = t('won');
  const sig = [locale, state.coins, state.pans.length, state.shopLevel, JSON.stringify(state.owned)].join('|');
  patch('upgrades', sig, (root) => {
    for (const id of UPGRADES) {
      const price = upgradePrice(state, id);
      const card = el('div', 'gx-card ew-upgrade');
      const title = id === 'expand' && SHOP_LEVELS[state.shopLevel + 1] ? `${t('up:expand')}: ${t(`level:${SHOP_LEVELS[state.shopLevel + 1]!.id}`)}` : t(`up:${id}`);
      card.append(el('span', 'gx-card-title', title), el('span', 'gx-card-meta', t(`up:${id}:desc`)));
      const label = price === null ? (id === 'pan' || id === 'expand' ? t('maxed') : t('owned')) : t('buy', { price });
      const b = button(label, `up-${id}`, () => onUpgrade(id), 'gx-btn gx-btn-warning gx-btn-sm');
      b.disabled = price === null || state.coins < price;
      card.append(b);
      root.append(card);
    }
  });
  byId('next-day').textContent = t('nextDay', { n: state.day + 1 });
}

function render(): void {
  renderHud();
  renderQueue();
  renderPans();
  renderMixer();
  renderTray();
  renderCashier();
  renderStock();
}

function addCoins(before: number): void {
  const coins = byId('coins');
  coins.dataset.rolling = 'true';
  void rollNumber(coins, state.coins, { from: before }).then(() => delete coins.dataset.rolling);
}

function onPickFlavour(flavour: Flavour): void {
  state.flavour = flavour;
  play('select');
  render();
}

function onMix(): void {
  const result = startMix(state);
  if (!result.ok) return explain(result.reason);
  play('confirm');
  render();
}

function onPour(index: number): void {
  const result = pour(state, index);
  if (!result.ok) return explain(result.reason);
  play('select');
  render();
}

function onFlip(index: number): void {
  const result = flip(state, index);
  if (!result.ok) return;
  play('jump');
  if (result.value) {
    say(t('goldenFlip'), 'cheer');
    const card = byId('pans').querySelectorAll<HTMLElement>('.ew-pan')[index];
    if (card) burst(card, { kind: 'spark', count: 10 });
  }
  render();
}

function onCollect(index: number): void {
  const result = collect(state, index);
  if (!result.ok) return;
  if (result.value) {
    play(result.value.isGolden ? 'achievement' : 'pickup');
    if (result.value.isGolden) say(t('golden'), 'cheer');
  } else {
    play('cancel');
  }
  render();
}

function onServe(): void {
  const result = serve(state, random);
  if (!result.ok) return explain(result.reason);
  play('open');
  render();
  byId('cashier').querySelector<HTMLElement>('button')?.focus();
}

function onGiveCoin(value: number): void {
  giveCoin(state, value);
  play('coin');
  render();
}

function onUndoCoin(): void {
  undoCoin(state);
  play('cancel');
  render();
}

function onSettle(): void {
  const before = state.coins;
  const result = settle(state);
  if (!result.ok) return;
  const { isCorrect, earned, tip } = result.value;
  const host = byId('cashier').closest<HTMLElement>('.ew-cashier')!;
  if (isCorrect) {
    play('coin');
    burst(host, { kind: 'coin', count: 12 });
    floatText(host, t('thanks', { n: earned }), { kind: 'xp' });
    say(tip > 0 ? `${t('thanks', { n: earned })} ${t('tip', { n: tip })}` : t('thanks', { n: earned }), 'cheer');
  } else {
    play('error');
    floatText(host, t('wrongChange'), { kind: 'damage' });
    say(t('wrongChange'), 'hurt');
  }
  addCoins(before);
  render();
  byId('queue').querySelector<HTMLElement>('[data-key="serve"]')?.focus();
}

function onBuy(item: Ingredient): void {
  const before = state.coins;
  const result = buyStock(state, item);
  if (!result.ok) return explain(result.reason);
  play('pickup');
  addCoins(before);
  if (state.phase !== 'open') saveGame();
  render();
}

function onUpgrade(id: UpgradeId): void {
  const before = state.coins;
  const result = buyUpgrade(state, id);
  if (!result.ok) return explain(result.reason);
  play('levelUp');
  burst(byId('upgrades'), { kind: 'xp', count: 14 });
  addCoins(before);
  saveGame();
  renderSummary();
  render();
}

function handle(event: GameEvent): void {
  switch (event.kind) {
    case 'arrive':
      play('blip');
      break;
    case 'passBy':
      say(t('event:passBy'));
      break;
    case 'angry':
      play('hurt');
      notify(t('event:angry'), 'warning', '!');
      say(t('event:angry'), 'hurt');
      break;
    case 'mixed':
      play('confirm');
      say(t('event:mixed', { flavour: flavourName(event.flavour), name: flavourTitle(event.flavour) }));
      break;
    case 'needFlip':
      play('notify');
      say(t('event:needFlip', { n: event.pan + 1 }));
      break;
    case 'ready':
      play('notify');
      say(t('event:ready', { n: event.pan + 1 }));
      break;
    case 'burnt':
      play('hurt');
      notify(t('event:burnt', { n: event.pan + 1 }), 'danger', '!');
      say(t('event:burnt', { n: event.pan + 1 }), 'hurt');
      break;
    case 'closing':
      notify(t('event:closing'), 'info', 'i');
      say(t('event:closing'));
      break;
    case 'dayOver':
      play('achievement');
      setPose('cheer');
      renderSummary();
      byId<HTMLDialogElement>('summary').showModal();
      break;
  }
}

function loop(): void {
  if (state.phase !== 'open' || isPaused) return;
  tick(state, TICK_MS, random).forEach(handle);
  render();
}

function showIntroLine(): void {
  const lines = state.day === 1 ? INTRO_LINES : ['introDay:1'];
  const key = lines[Math.min(introIndex, lines.length - 1)]!;
  say(t(key, { n: state.day }));
  byId('intro-next').hidden = introIndex >= lines.length - 1;
}

function beginIntro(): void {
  introIndex = 0;
  state.phase = 'intro';
  showIntroLine();
  render();
}

function openShop(): void {
  startDay(state, random);
  isPaused = false;
  play('powerUp');
  say(t('introDay:1', { n: state.day }), 'cheer');
  render();
  byId('pans').querySelector<HTMLElement>('button')?.focus();
}

function applyLocale(): void {
  document.documentElement.lang = locale;
  document.title = `${t('title')} · gamifiedUI`;
  document.querySelectorAll<HTMLElement>('[data-t]').forEach((node) => (node.textContent = t(node.dataset.t ?? '')));
  document.querySelectorAll<HTMLElement>('[data-t-label]').forEach((node) => node.setAttribute('aria-label', t(node.dataset.tLabel ?? '')));
  document.querySelectorAll<HTMLButtonElement>('[data-locale]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.locale === locale)));
  signatures.clear();
  renderWarrior();
  if (state.phase === 'intro') showIntroLine();
  if (state.phase === 'closed') renderSummary();
  render();
}

function setupChrome(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-locale]').forEach((b) =>
    b.addEventListener('click', () => {
      locale = (b.dataset.locale as GameLocale) ?? 'en';
      localStorage.setItem(LOCALE_KEY, locale);
      applyLocale();
    }),
  );

  const sound = byId<HTMLButtonElement>('sound');
  const syncSound = (): void => {
    sound.setAttribute('aria-pressed', String(!sfx.muted));
    sound.querySelector('.gx-icon')!.className = `gx-icon gx-icon-sm ${sfx.muted ? 'gx-i-mute' : 'gx-i-sound'}`;
  };
  sound.addEventListener('click', () => {
    sfx.muted = !sfx.muted;
    syncSound();
  });
  syncSound();

  byId('pause').addEventListener('click', () => {
    isPaused = !isPaused;
    say(t(isPaused ? 'paused' : 'resume'));
    renderHud();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.phase === 'open' && !isPaused) {
      isPaused = true;
      renderHud();
    }
  });

  byId('new-game').addEventListener('click', () => {
    if (!window.confirm(t('confirmNew'))) return;
    state = newGame();
    saveGame();
    beginIntro();
  });

  byId('intro-next').addEventListener('click', () => {
    if (writer && !writer.done) return writer.skip();
    introIndex++;
    play('blip');
    showIntroLine();
  });
  byId('open-shop').addEventListener('click', openShop);

  const summary = byId<HTMLDialogElement>('summary');
  summary.addEventListener('cancel', (e) => e.preventDefault());
  byId('next-day').addEventListener('click', () => {
    nextDay(state);
    saveGame();
    summary.close();
    beginIntro();
  });
}

setupChrome();
applyLocale();
beginIntro();
window.setInterval(loop, TICK_MS);
