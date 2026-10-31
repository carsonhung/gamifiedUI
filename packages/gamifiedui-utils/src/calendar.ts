export type CalendarMode = 'single' | 'range';

export interface DateRange {
  start: Date;
  end: Date | null;
}

export interface CalendarOptions {
  mode?: CalendarMode;
  value?: Date | null;
  range?: DateRange | null;
  /** Month to show first; defaults to the value, the range start or today. */
  month?: Date;
  min?: Date;
  max?: Date;
  isDisabled?: (date: Date) => boolean;
  /** BCP 47 tag for month and weekday names; defaults to <html lang>. */
  locale?: string;
  /** 0 = Sunday ... 6 = Saturday; defaults to the locale's week start. */
  firstDay?: number;
  /** Runs for every day button after it is drawn: add data-event, data-claimed, gx-rarity-*. */
  decorate?: (day: HTMLButtonElement, date: Date) => void;
  labels?: { previous?: string; next?: string };
  onSelect?: (date: Date) => void;
  onRangeSelect?: (range: { start: Date; end: Date }) => void;
}

export interface CalendarHandle {
  readonly value: Date | null;
  readonly range: DateRange | null;
  setValue(date: Date | null): void;
  setRange(range: DateRange | null): void;
  setMonth(date: Date): void;
  setLocale(locale: string): void;
  /** Redraws, re-running decorate (after your own data changes). */
  refresh(): void;
  /** Moves focus to the active day. */
  focus(): void;
  destroy(): void;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const WEEKS = 6;
let uid = 0;

/** Local calendar date as YYYY-MM-DD (no UTC shift). */
export function toISODate(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses YYYY-MM-DD as a local date; null for anything else or an impossible date. */
export function parseISODate(text: string): Date | null {
  const match = ISO_DATE.exec(text.trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(y, m - 1, d);
  return date.getMonth() === m - 1 ? date : null;
}

const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const compare = (a: Date, b: Date): number => startOfDay(a).getTime() - startOfDay(b).getTime();
const sameDay = (a: Date | null | undefined, b: Date | null | undefined): boolean =>
  Boolean(a && b) && compare(a as Date, b as Date) === 0;
const sameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

function addMonths(d: Date, n: number): Date {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), lastDay));
}

function localeWeekStart(locale: string): number {
  try {
    const info = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const firstDay = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay;
    if (firstDay !== undefined) return firstDay % 7;
  } catch {
    /* unknown tag: fall through */
  }
  return 0;
}

/** Renders an accessible month grid into root (a .gx-calendar) with full keyboard support. */
export function calendar(root: HTMLElement, options: CalendarOptions = {}): CalendarHandle {
  const mode = options.mode ?? 'single';
  const id = `gx-calendar-${++uid}`;
  let locale = options.locale ?? (document.documentElement.lang || 'en');
  let value = options.value ? startOfDay(options.value) : null;
  let range: DateRange | null = options.range
    ? { start: startOfDay(options.range.start), end: options.range.end ? startOfDay(options.range.end) : null }
    : null;
  let hover: Date | null = null;

  const min = options.min ? startOfDay(options.min) : null;
  const max = options.max ? startOfDay(options.max) : null;
  const clamp = (d: Date): Date => (min && compare(d, min) < 0 ? min : max && compare(d, max) > 0 ? max : d);
  const isDisabled = (d: Date): boolean =>
    Boolean((min && compare(d, min) < 0) || (max && compare(d, max) > 0) || options.isDisabled?.(d));

  let active = clamp(startOfDay(options.month ?? value ?? range?.start ?? new Date()));

  const navButton = (label: string, glyph: string): HTMLButtonElement => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gx-calendar-nav';
    button.setAttribute('aria-label', label);
    button.textContent = glyph;
    return button;
  };

  const prev = navButton(options.labels?.previous ?? 'Previous month', '◀');
  const next = navButton(options.labels?.next ?? 'Next month', '▶');
  const title = document.createElement('p');
  title.className = 'gx-calendar-title';
  title.id = `${id}-title`;
  title.setAttribute('aria-live', 'polite');
  const header = document.createElement('div');
  header.className = 'gx-calendar-header';
  header.append(prev, title, next);

  const table = document.createElement('table');
  table.className = 'gx-calendar-grid';
  table.setAttribute('aria-labelledby', title.id);
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  root.classList.add('gx-calendar');
  root.replaceChildren(header, table);

  const days = (): HTMLButtonElement[] => Array.from(tbody.querySelectorAll<HTMLButtonElement>('.gx-day'));
  const dateOf = (button: HTMLButtonElement): Date => parseISODate(button.dataset.date ?? '') as Date;
  const buttonFor = (d: Date): HTMLButtonElement | undefined =>
    tbody.querySelector<HTMLButtonElement>(`[data-date="${toISODate(d)}"]`) ?? undefined;

  const paint = (): void => {
    const end = range?.end ?? (range && hover && compare(hover, range.start) >= 0 ? hover : null);
    for (const button of days()) {
      const d = dateOf(button);
      button.tabIndex = sameDay(d, active) ? 0 : -1;
      if (mode === 'single') {
        button.setAttribute('aria-pressed', String(sameDay(d, value)));
        continue;
      }
      const inRange = Boolean(range && end && compare(d, range.start) >= 0 && compare(d, end) <= 0);
      const isStart = sameDay(d, range?.start);
      button.setAttribute('aria-pressed', String(range?.end ? inRange : isStart));
      if (isStart && (inRange || !end)) button.dataset.range = 'start';
      else if (!inRange) delete button.dataset.range;
      else if (!range?.end) button.dataset.range = 'preview';
      else button.dataset.range = sameDay(d, end) ? 'end' : 'middle';
    }
  };

  const render = (): void => {
    const hadFocus = tbody.contains(document.activeElement);
    const firstDay = options.firstDay ?? localeWeekStart(locale);
    const year = active.getFullYear();
    const month = active.getMonth();
    const today = startOfDay(new Date());

    title.textContent = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(active);
    prev.disabled = Boolean(min && compare(new Date(year, month, 0), min) < 0);
    next.disabled = Boolean(max && compare(new Date(year, month + 1, 1), max) > 0);

    const shortDay = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const longDay = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    const headRow = document.createElement('tr');
    for (let i = 0; i < 7; i++) {
      const sample = new Date(2023, 0, 1 + ((firstDay + i) % 7));
      const th = document.createElement('th');
      th.scope = 'col';
      th.abbr = longDay.format(sample);
      th.textContent = shortDay.format(sample);
      headRow.append(th);
    }
    thead.replaceChildren(headRow);

    const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
    const first = new Date(year, month, 1);
    let cursor = addDays(first, -((first.getDay() - firstDay + 7) % 7));
    const rows: HTMLTableRowElement[] = [];
    for (let w = 0; w < WEEKS; w++) {
      const row = document.createElement('tr');
      for (let i = 0; i < 7; i++) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'gx-day';
        button.textContent = String(cursor.getDate());
        button.dataset.date = toISODate(cursor);
        button.setAttribute('aria-label', fullDate.format(cursor));
        if (cursor.getMonth() !== month) button.dataset.outside = '';
        if (sameDay(cursor, today)) button.setAttribute('aria-current', 'date');
        if (isDisabled(cursor)) button.setAttribute('aria-disabled', 'true');
        options.decorate?.(button, cursor);
        const cell = document.createElement('td');
        cell.append(button);
        row.append(cell);
        cursor = addDays(cursor, 1);
      }
      rows.push(row);
    }
    tbody.replaceChildren(...rows);
    paint();
    if (hadFocus) buttonFor(active)?.focus();
  };

  const moveTo = (d: Date): void => {
    const target = clamp(d);
    const monthChanged = !sameMonth(target, active);
    active = target;
    if (range && !range.end) hover = target;
    if (monthChanged) render();
    else paint();
    buttonFor(active)?.focus();
  };

  const select = (d: Date): void => {
    active = d;
    if (mode === 'single') {
      value = d;
      render();
      options.onSelect?.(d);
      return;
    }
    if (!range || range.end || compare(d, range.start) < 0) range = { start: d, end: null };
    else range = { start: range.start, end: d };
    hover = null;
    render();
    if (range.end) options.onRangeSelect?.({ start: range.start, end: range.end });
  };

  const dayFrom = (e: Event): HTMLButtonElement | null =>
    (e.target as Element).closest<HTMLButtonElement>('.gx-day');

  const onClick = (e: MouseEvent): void => {
    const button = dayFrom(e);
    if (button && button.getAttribute('aria-disabled') !== 'true') select(dateOf(button));
  };

  const onKey = (e: KeyboardEvent): void => {
    if (!dayFrom(e)) return;
    const weekday = (active.getDay() - (options.firstDay ?? localeWeekStart(locale)) + 7) % 7;
    const rtl = getComputedStyle(root).direction === 'rtl' ? -1 : 1;
    const years = e.shiftKey ? 12 : 1;
    const target =
      e.key === 'ArrowLeft' ? addDays(active, -rtl)
      : e.key === 'ArrowRight' ? addDays(active, rtl)
      : e.key === 'ArrowUp' ? addDays(active, -7)
      : e.key === 'ArrowDown' ? addDays(active, 7)
      : e.key === 'Home' ? addDays(active, -weekday)
      : e.key === 'End' ? addDays(active, 6 - weekday)
      : e.key === 'PageUp' ? addMonths(active, -years)
      : e.key === 'PageDown' ? addMonths(active, years)
      : null;
    if (!target) return;
    e.preventDefault();
    moveTo(target);
  };

  const onPointerOver = (e: PointerEvent): void => {
    const button = dayFrom(e);
    if (!button || !range || range.end) return;
    hover = dateOf(button);
    paint();
  };

  const onPointerLeave = (): void => {
    if (!range || range.end) return;
    hover = document.activeElement instanceof HTMLButtonElement && tbody.contains(document.activeElement)
      ? dateOf(document.activeElement)
      : null;
    paint();
  };

  const onPrev = (): void => {
    active = clamp(addMonths(active, -1));
    render();
  };
  const onNext = (): void => {
    active = clamp(addMonths(active, 1));
    render();
  };

  tbody.addEventListener('click', onClick);
  tbody.addEventListener('keydown', onKey);
  tbody.addEventListener('pointerover', onPointerOver);
  tbody.addEventListener('pointerleave', onPointerLeave);
  prev.addEventListener('click', onPrev);
  next.addEventListener('click', onNext);
  render();

  return {
    get value() {
      return value;
    },
    get range() {
      return range;
    },
    setValue(date) {
      value = date ? startOfDay(date) : null;
      if (value) active = clamp(value);
      render();
    },
    setRange(next) {
      range = next ? { start: startOfDay(next.start), end: next.end ? startOfDay(next.end) : null } : null;
      hover = null;
      if (range) active = clamp(range.start);
      render();
    },
    setMonth(date) {
      active = clamp(startOfDay(date));
      render();
    },
    setLocale(next) {
      locale = next;
      render();
    },
    refresh: render,
    focus() {
      buttonFor(active)?.focus();
    },
    destroy() {
      tbody.removeEventListener('click', onClick);
      tbody.removeEventListener('keydown', onKey);
      tbody.removeEventListener('pointerover', onPointerOver);
      tbody.removeEventListener('pointerleave', onPointerLeave);
      prev.removeEventListener('click', onPrev);
      next.removeEventListener('click', onNext);
      root.replaceChildren();
    },
  };
}

export interface DatePickerOptions extends Omit<CalendarOptions, 'onSelect' | 'onRangeSelect'> {
  /** Range mode: a second field for the end date. Without it both dates share the first field. */
  endInput?: HTMLInputElement;
  format?: (date: Date) => string;
  parse?: (text: string) => Date | null;
  /** Joins a range in a single field. */
  separator?: string;
  onChange?: (value: Date | { start: Date; end: Date }) => void;
}

export interface DatePickerHandle {
  readonly calendar: CalendarHandle;
  open(): void;
  close(): void;
  destroy(): void;
}

/**
 * Text field + toggle + [popover] panel. Typing a date updates the calendar; picking one fills
 * the field (YYYY-MM-DD by default), fires "input", closes the panel and returns focus.
 */
export function datePicker(
  input: HTMLInputElement,
  toggle: HTMLButtonElement,
  panel: HTMLElement,
  options: DatePickerOptions = {},
): DatePickerHandle {
  const format = options.format ?? toISODate;
  const parse = options.parse ?? parseISODate;
  const separator = options.separator ?? ' – ';
  const isRange = options.mode === 'range';
  const host = panel.querySelector<HTMLElement>('.gx-calendar') ?? panel.appendChild(document.createElement('div'));

  if (!panel.id) panel.id = `gx-datepicker-${++uid}`;
  if (!panel.hasAttribute('popover')) panel.popover = 'auto';
  panel.setAttribute('role', 'dialog');
  if (!panel.hasAttribute('aria-label')) panel.setAttribute('aria-label', toggle.getAttribute('aria-label') ?? 'Choose date');
  toggle.setAttribute('aria-haspopup', 'dialog');
  toggle.setAttribute('aria-controls', panel.id);
  toggle.setAttribute('aria-expanded', 'false');

  if (CSS.supports('position-area: block-end')) {
    const anchor = `--${panel.id}`;
    (input.closest<HTMLElement>('.gx-datepicker') ?? input).style.setProperty('anchor-name', anchor);
    panel.style.setProperty('position-anchor', anchor);
    panel.dataset.anchored = '';
  }

  const emit = (field: HTMLInputElement): void => {
    field.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const close = (): void => {
    if (panel.matches(':popover-open')) panel.hidePopover();
  };

  const cal = calendar(host, {
    ...options,
    onSelect(date) {
      input.value = format(date);
      emit(input);
      close();
      options.onChange?.(date);
    },
    onRangeSelect(range) {
      if (options.endInput) {
        input.value = format(range.start);
        options.endInput.value = format(range.end);
        emit(options.endInput);
      } else {
        input.value = `${format(range.start)}${separator}${format(range.end)}`;
      }
      emit(input);
      close();
      options.onChange?.(range);
    },
  });

  const readFields = (): void => {
    if (!isRange) {
      cal.setValue(parse(input.value));
      return;
    }
    const [startText = '', endText = ''] = options.endInput
      ? [input.value, options.endInput.value]
      : input.value.split(separator);
    const start = parse(startText);
    const end = parse(endText);
    cal.setRange(start ? { start, end: end && end >= start ? end : null } : null);
  };

  const onToggleClick = (): void => {
    panel.togglePopover();
  };
  const onToggle = (): void => {
    const isOpen = panel.matches(':popover-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      readFields();
      requestAnimationFrame(() => cal.focus());
    } else if (panel.contains(document.activeElement) || document.activeElement === document.body) {
      toggle.focus();
    }
  };

  const usesNativeInvoker = toggle.hasAttribute('popovertarget');
  if (!usesNativeInvoker) toggle.addEventListener('click', onToggleClick);
  panel.addEventListener('toggle', onToggle);
  input.addEventListener('change', readFields);
  options.endInput?.addEventListener('change', readFields);
  readFields();

  return {
    calendar: cal,
    open() {
      if (!panel.matches(':popover-open')) panel.showPopover();
    },
    close,
    destroy() {
      if (!usesNativeInvoker) toggle.removeEventListener('click', onToggleClick);
      panel.removeEventListener('toggle', onToggle);
      input.removeEventListener('change', readFields);
      options.endInput?.removeEventListener('change', readFields);
      cal.destroy();
    },
  };
}
