import categories from 'gamifiedui-icons/categories.json';
import icons from 'gamifiedui-icons/icons.json';
import {
  burst,
  cooldown,
  floatText,
  isCoolingDown,
  rollNumber,
  sliderFill,
  type BurstOptions,
} from 'gamifiedui-utils';

import { byId, locale, onLocaleChange, t } from './core';

const PAGE_COUNT = 3;
const BOARD_LOAD_MS = 1200;
const GOLD_REWARD = 250;
const ORE_GOAL = 3;
const CRIT_CHANCE = 0.2;

type AmbientKind = 'snow' | 'rain' | 'embers' | 'petals';

const BURSTS: Record<string, BurstOptions> = {
  spark: { kind: 'spark' },
  coin: { kind: 'coin', className: 'gx-i-coin' },
  heart: { kind: 'heart', className: 'gx-i-heart' },
  petal: { kind: 'petal', className: 'gx-i-bauhinia', largeEvery: 0 },
};

const AMBIENT_CLASSES: Record<AmbientKind, string> = {
  snow: 'gx-ambient gx-ambient-snow',
  rain: 'gx-ambient gx-ambient-rain',
  embers: 'gx-ambient gx-ambient-embers',
  petals: 'gx-ambient gx-ambient-petals',
};

interface Skill {
  cooldownS: number;
  min: number;
  max: number;
  heals?: boolean;
}

const SKILLS: Record<string, Skill> = {
  slash: { cooldownS: 1.5, min: 8, max: 14 },
  fire: { cooldownS: 4, min: 18, max: 30 },
  heal: { cooldownS: 6, min: 25, max: 35, heals: true },
};

const SKILL_KEYS: Record<string, string> = { '1': 'slash', '2': 'fire', '3': 'heal' };

function randomInt(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function setupMenus(): void {
  const drawer = byId<HTMLDialogElement>('drawer');
  byId('open-drawer').addEventListener('click', () => drawer.showModal());

  const dropdown = byId<HTMLDetailsElement>('sort-dropdown');
  const summary = dropdown.querySelector('summary');
  const options = Array.from(dropdown.querySelectorAll<HTMLButtonElement>('[data-sort]'));
  const close = (): void => {
    if (!dropdown.open) return;
    dropdown.open = false;
    summary?.focus();
  };
  options.forEach((option) => {
    option.addEventListener('click', () => {
      options.forEach((o) => {
        if (o === option) o.setAttribute('aria-current', 'true');
        else o.removeAttribute('aria-current');
      });
      close();
    });
  });
  dropdown.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  document.addEventListener('click', (e) => {
    if (dropdown.open && e.target instanceof Node && !dropdown.contains(e.target)) dropdown.open = false;
  });

  const pages = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-page]'));
  let current = 1;
  const render = (): void => {
    pages.forEach((page) => {
      const value = page.dataset.page;
      if (value === 'prev') page.setAttribute('aria-disabled', String(current === 1));
      else if (value === 'next') page.setAttribute('aria-disabled', String(current === PAGE_COUNT));
      else if (Number(value) === current) page.setAttribute('aria-current', 'page');
      else page.removeAttribute('aria-current');
    });
  };
  pages.forEach((page) => {
    page.addEventListener('click', () => {
      if (page.getAttribute('aria-disabled') === 'true') return;
      const value = page.dataset.page;
      if (value === 'prev') current--;
      else if (value === 'next') current++;
      else current = Number(value);
      render();
    });
  });
  render();
}

function setupSettings(): void {
  sliderFill();
  document.querySelectorAll<HTMLButtonElement>('button.gx-chip:not([data-ambient], [data-icons])').forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
    });
  });
}

function setupLeaderboard(): void {
  const board = byId('board');
  const table = byId('board-table');
  const skeleton = byId('board-skeleton');
  const status = byId('board-status');

  byId('board-reload').addEventListener('click', () => {
    if (board.getAttribute('aria-busy') === 'true') return;
    board.setAttribute('aria-busy', 'true');
    table.hidden = true;
    skeleton.hidden = false;
    status.textContent = t('boardLoading');
    window.setTimeout(() => {
      board.removeAttribute('aria-busy');
      table.hidden = false;
      skeleton.hidden = true;
      status.textContent = t('boardLoaded');
    }, BOARD_LOAD_MS);
  });
}

function setupHud(targetSrc: string): void {
  const goldValue = byId('gold');
  let gold = Number(goldValue.textContent);
  byId('earn-gold').addEventListener('click', () => {
    gold += GOLD_REWARD;
    void rollNumber(goldValue, gold);
  });

  const log = byId('combat-log');
  const oreCount = byId('ore-count');
  const oreObjective = byId('ore-objective');
  const mine = byId<HTMLButtonElement>('mine');
  const questMeta = byId('q1-meta');
  let ore = 1;
  mine.addEventListener('click', () => {
    if (ore >= ORE_GOAL) return;
    ore++;
    oreCount.textContent = `${ore}/${ORE_GOAL}`;
    questMeta.textContent = `${ore}/${ORE_GOAL}`;
    if (ore < ORE_GOAL) return;
    oreObjective.setAttribute('data-done', '');
    const done = document.createElement('span');
    done.className = 'sr-only';
    done.textContent = '(done)';
    oreObjective.append(done);
    mine.disabled = true;
    log.textContent = t('questDone');
  });

  const target = byId('target-layer');
  byId<HTMLImageElement>('target-slime').src = targetSrc;

  const use = (button: HTMLButtonElement): void => {
    const skill = SKILLS[button.dataset.skill ?? ''];
    if (!skill || isCoolingDown(button)) return;
    const amount = randomInt(skill.min, skill.max);
    if (skill.heals) {
      floatText(target, `+${amount}`, { kind: 'heal' });
      log.textContent = t('logHeal', { n: amount });
    } else if (Math.random() < CRIT_CHANCE) {
      floatText(target, `${amount * 2}!`, { kind: 'crit' });
      burst(target, { kind: 'spark', y: 70, count: 12 });
      log.textContent = t('logCrit', { n: amount * 2 });
    } else {
      floatText(target, `-${amount}`, { kind: 'damage' });
      log.textContent = t('logDamage', { n: amount });
    }
    cooldown(button, skill.cooldownS);
  };

  const skills = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-skill]'));
  skills.forEach((button) => button.addEventListener('click', () => use(button)));
  window.addEventListener('keydown', (e) => {
    const name = SKILL_KEYS[e.key];
    if (!name || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const button = skills.find((s) => s.dataset.skill === name);
    if (button) use(button);
  });
}

function setupReward(): void {
  const dialog = byId<HTMLDialogElement>('reward');
  const item = dialog.querySelector<HTMLElement>('.gx-reward-item');
  byId('open-reward').addEventListener('click', () => {
    dialog.showModal();
    if (item) window.setTimeout(() => burst(item, { kind: 'coin', className: 'gx-i-coin', count: 16 }), 200);
  });
}

function setupParticles(): void {
  const stage = byId('burst-stage');
  document.querySelectorAll<HTMLButtonElement>('[data-burst]').forEach((button) => {
    button.addEventListener('click', () => burst(stage, BURSTS[button.dataset.burst ?? ''] ?? {}));
  });

  const ambient = byId('ambient');
  const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-ambient]'));
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      ambient.className = AMBIENT_CLASSES[chip.dataset.ambient as AmbientKind];
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    });
  });
}

const TILE_CLASSES: Record<string, string> = {
  common: 'gx-icon-tile',
  emoji: 'gx-icon-tile gx-rarity-rare',
  hk: 'gx-icon-tile gx-rarity-epic',
  animated: 'gx-icon-tile gx-rarity-legendary',
};

type Labelled = { en: string; hant: string; hans: string };
type IconMeta = (typeof icons)[number];

const labelOf = (item: Labelled): string => (locale === 'zh-Hant' ? item.hant : locale === 'zh-Hans' ? item.hans : item.en);
const GRID_CLASS = 'grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2';

function iconTile(icon: IconMeta, moving: boolean, tileClass: string): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'flex flex-col items-center gap-1 text-center';
  const tile = document.createElement('span');
  tile.className = tileClass;
  const glyph = document.createElement('span');
  glyph.className = `gx-icon ${moving ? 'gx-ia-' : 'gx-i-'}${icon.name}`;
  glyph.setAttribute('aria-hidden', 'true');
  tile.append(glyph);
  const label = document.createElement('span');
  label.className = 'text-xs leading-tight';
  label.textContent = labelOf(icon);
  const code = document.createElement('code');
  code.className = 'text-[0.625rem] opacity-60';
  code.textContent = moving ? `ia-${icon.name}` : icon.name;
  item.append(tile, label, code);
  return item;
}

function setupIconGallery(): void {
  const animateChip = byId<HTMLButtonElement>('icons-animate');
  const pauseChip = byId<HTMLButtonElement>('icons-pause');
  const allList = byId('icon-gallery');
  const framedList = byId('icon-gallery-animated');
  const nav = byId('icon-categories');
  const galleries = [{ list: allList }, { list: framedList }];
  const render = (): void => {
    const animateAll = animateChip.getAttribute('aria-pressed') === 'true';
    const shown = icons.filter((icon) => animateAll || icon.set !== 'animated');
    const groups = categories
      .map((category) => ({ category, members: shown.filter((icon) => icon.category === category.id) }))
      .filter(({ members }) => members.length > 0);

    nav.replaceChildren(
      ...groups.map(({ category, members }) => {
        const link = document.createElement('a');
        link.className = 'gx-chip';
        link.href = `#icons-cat-${category.id}`;
        link.textContent = `${labelOf(category)} ${members.length}`;
        return link;
      }),
    );
    allList.replaceChildren(
      ...groups.map(({ category, members }) => {
        const section = document.createElement('section');
        section.className = 'mb-4';
        section.setAttribute('aria-labelledby', `icons-cat-${category.id}`);
        const heading = document.createElement('h4');
        heading.id = `icons-cat-${category.id}`;
        heading.className = 'mb-2 scroll-mt-4 font-gx text-xs uppercase';
        heading.textContent = labelOf(category);
        const list = document.createElement('ul');
        list.className = GRID_CLASS;
        list.append(...members.map((icon) => iconTile(icon, animateAll, TILE_CLASSES[icon.set] ?? 'gx-icon-tile')));
        section.append(heading, list);
        return section;
      }),
    );
    framedList.replaceChildren(
      ...icons.filter((icon) => icon.motion === 'frames').map((icon) => iconTile(icon, true, TILE_CLASSES.animated ?? 'gx-icon-tile')),
    );
  };
  const toggle = (chip: HTMLButtonElement): boolean => {
    const on = chip.getAttribute('aria-pressed') !== 'true';
    chip.setAttribute('aria-pressed', String(on));
    return on;
  };
  animateChip.addEventListener('click', () => {
    toggle(animateChip);
    render();
  });
  pauseChip.addEventListener('click', () => {
    const paused = toggle(pauseChip);
    galleries.forEach(({ list }) => list.classList.toggle('gx-icons-paused', paused));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-reaction]').forEach((button, _, all) => {
    button.addEventListener('click', () => {
      all.forEach((other) => {
        const wasOn = other.getAttribute('aria-pressed') === 'true';
        const on = other === button ? !wasOn : false;
        if (on === wasOn) return;
        other.setAttribute('aria-pressed', String(on));
        const count = other.querySelector<HTMLElement>('[data-count]');
        if (count) count.textContent = String(Number(count.textContent) + (on ? 1 : -1));
        if (on && other.dataset.reaction === 'up') burst(other, { kind: 'spark', count: 8 });
      });
    });
  });

  onLocaleChange(render);
  render();
}

export function setupGameWidgets(targetSrc: string): void {
  setupMenus();
  setupSettings();
  setupLeaderboard();
  setupHud(targetSrc);
  setupReward();
  setupParticles();
  setupIconGallery();
}
