import { burst, calendar, datePicker, timer, toISODate, type CalendarHandle } from 'gamifiedui-utils';

import { byId, locale, onLocaleChange, t } from './core';
import type { Locale } from './i18n';

const RAID_SECONDS = 15;
const LOGIN_REWARD = 100;

const INTL_LOCALES: Record<Locale, string> = {
  en: 'en-HK',
  'zh-Hant': 'zh-Hant-HK',
  'zh-Hans': 'zh-Hans-CN',
};

const intlLocale = (): string => INTL_LOCALES[locale];

function setupTimers(): void {
  const status = byId('raid-status');
  const raid = timer(byId('raid-timer'), RAID_SECONDS, {
    warnAt: 10,
    criticalAt: 5,
    onStateChange(state) {
      if (state === 'critical') status.textContent = t('raidSoon');
      if (state === 'done') {
        status.textContent = t('raidGo');
        burst(byId('raid-timer'), { kind: 'spark', count: 14 });
      }
    },
  });
  byId('raid-start').addEventListener('click', () => raid.start());
  byId('raid-pause').addEventListener('click', () => raid.pause());
  byId('raid-reset').addEventListener('click', () => {
    raid.reset();
    status.textContent = '';
  });

  const run = timer(byId('run-timer'), 0, { mode: 'up' });
  const toggle = byId('run-toggle');
  toggle.addEventListener('click', () => {
    if (run.running) run.pause();
    else run.start();
    toggle.setAttribute('aria-pressed', String(run.running));
  });
}

function relabel(calendars: CalendarHandle[], roots: HTMLElement[]): void {
  calendars.forEach((c) => c.setLocale(intlLocale()));
  roots.forEach((root) => {
    const [prev, next] = Array.from(root.querySelectorAll('.gx-calendar-nav'));
    prev?.setAttribute('aria-label', t('prevMonth'));
    next?.setAttribute('aria-label', t('nextMonth'));
  });
}

function setupDatePickers(): CalendarHandle[] {
  const labels = { previous: t('prevMonth'), next: t('nextMonth') };
  const today = new Date();
  const single = datePicker(byId('event-date'), byId('event-date-toggle'), byId('event-date-panel'), {
    locale: intlLocale(),
    labels,
    min: today,
  });
  const range = datePicker(byId('trip-range'), byId('trip-range-toggle'), byId('trip-range-panel'), {
    mode: 'range',
    locale: intlLocale(),
    labels,
  });
  return [single.calendar, range.calendar];
}

function setupLoginCalendar(): CalendarHandle {
  const today = new Date();
  const claimed = new Set<string>();
  for (let day = 1; day < today.getDate(); day++) {
    if (day % 5 !== 0) claimed.add(toISODate(new Date(today.getFullYear(), today.getMonth(), day)));
  }
  const status = byId('claim-status');

  const login = calendar(byId('login-calendar'), {
    locale: intlLocale(),
    labels: { previous: t('prevMonth'), next: t('nextMonth') },
    decorate(day, date) {
      const notes: string[] = [];
      if (claimed.has(toISODate(date))) {
        day.dataset.claimed = '';
        notes.push(t('claimedDay'));
      }
      if (date.getDay() === 0 || date.getDay() === 6) {
        day.dataset.event = '';
        day.classList.add('gx-rarity-legendary');
        notes.push(t('bonusDay'));
      }
      if (notes.length) day.setAttribute('aria-label', `${day.getAttribute('aria-label')}, ${notes.join(', ')}`);
    },
  });

  byId('claim-today').addEventListener('click', () => {
    const key = toISODate(new Date());
    if (claimed.has(key)) {
      status.textContent = t('claimAgain');
      return;
    }
    claimed.add(key);
    login.setMonth(new Date());
    const day = document.querySelector<HTMLElement>(`#login-calendar [data-date="${key}"]`);
    if (day) {
      day.dataset.claimedNow = '';
      burst(day, { kind: 'coin', className: 'gx-i-coin', count: 12, spread: [1.5, 3] });
    }
    const isBonus = [0, 6].includes(new Date().getDay());
    status.textContent = t('claimDone', { n: isBonus ? LOGIN_REWARD * 2 : LOGIN_REWARD });
  });
  return login;
}

export function setupTime(): void {
  setupTimers();
  const calendars = [...setupDatePickers(), setupLoginCalendar()];
  const roots = ['event-date-panel', 'trip-range-panel', 'login-calendar'].map((id) => byId(id));
  onLocaleChange(() => relabel(calendars, roots));
}
