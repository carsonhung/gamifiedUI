export type TimeMode = 'single' | 'range';

/** Times are 24-hour "HH:MM" strings everywhere in the API. */
export interface TimeRange {
  start: string;
  end: string;
  /** Length in minutes; an overnight range counts through midnight. */
  minutes: number;
  /** The end is on the next day (end is earlier than start). */
  isOvernight: boolean;
}

export interface TimeListLabels {
  /** Single mode heading; range mode uses pickStart / pickEnd. */
  title?: string;
  pickStart?: string;
  pickEnd?: string;
  /** Accessible name of the list. */
  list?: string;
  /** Visible tag on an end time that falls on the next day. */
  nextDay?: string;
  /** Spoken and shown with the next-day tag. */
  nextDayLong?: string;
  duration?: (minutes: number) => string;
}

export interface TimeListOptions {
  mode?: TimeMode;
  /** Minutes between options. */
  step?: number;
  min?: string;
  max?: string;
  value?: string | null;
  range?: { start: string; end?: string | null } | null;
  isDisabled?: (time: string) => boolean;
  /** Let a range end earlier than it starts, meaning the next day (night shifts, raids). */
  allowOvernight?: boolean;
  /** Option text; defaults to "HH:MM". */
  format?: (time: string) => string;
  labels?: TimeListLabels;
  onSelect?: (time: string) => void;
  onRangeSelect?: (range: TimeRange) => void;
}

export interface TimeListHandle {
  readonly value: string | null;
  readonly range: { start: string; end: string | null } | null;
  setValue(time: string | null): void;
  setRange(range: { start: string; end?: string | null } | null): void;
  /** Swaps the text, e.g. after a language change. */
  setLabels(labels: TimeListLabels): void;
  /** Moves focus to the selected option, or the one nearest the current time. */
  focus(): void;
  destroy(): void;
}

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;
const DEFAULT_STEP = 30;
const TYPEAHEAD_MS = 800;
const TIME_TEXT = /^(\d{1,2}):?(\d{2})\s*(?:([ap])\.?\s*m\.?)?$/i;
const NOON_HOUR = 12;
const LAST_HOUR = 23;
let uid = 0;

const pad = (n: number): string => String(n).padStart(2, '0');

/** 570 -> "09:30". */
export function formatTime(minutes: number): string {
  const m = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${pad(Math.floor(m / MINUTES_PER_HOUR))}:${pad(m % MINUTES_PER_HOUR)}`;
}

/** "9:30", "0930", "9:30 pm" -> minutes after midnight; null when it is not a time. */
export function parseTime(text: string): number | null {
  const match = TIME_TEXT.exec(text.trim());
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toLowerCase();
  if (period) {
    if (hours < 1 || hours > NOON_HOUR) return null;
    hours = (hours % NOON_HOUR) + (period === 'p' ? NOON_HOUR : 0);
  }
  if (hours > LAST_HOUR || minutes >= MINUTES_PER_HOUR) return null;
  return hours * MINUTES_PER_HOUR + minutes;
}

/** Builds a range, counting through midnight when end is earlier than start. */
export function timeRange(start: string, end: string): TimeRange {
  const from = parseTime(start);
  const to = parseTime(end);
  if (from === null || to === null) throw new Error(`[timeRange] not a time: "${from === null ? start : end}"`);
  const isOvernight = to < from;
  return { start: formatTime(from), end: formatTime(to), minutes: (isOvernight ? to + MINUTES_PER_DAY : to) - from, isOvernight };
}

function defaultDuration(minutes: number): string {
  const h = Math.floor(minutes / MINUTES_PER_HOUR);
  const m = minutes % MINUTES_PER_HOUR;
  return [h ? `${h}h` : '', m || !h ? `${m}m` : ''].filter(Boolean).join(' ');
}

function requireTime(text: string, name: string): number {
  const minutes = parseTime(text);
  if (minutes === null) throw new Error(`[timeList] ${name} is not a time: "${text}"`);
  return minutes;
}

/**
 * Renders a gx-time list of times in steps (a listbox). Keys: Up / Down, PageUp / PageDown (an
 * hour), Home / End, Enter or Space to pick, and typing digits jumps to a time. In range mode the
 * first pick is the start and the second the end; hovering or moving shows a preview.
 */
export function timeList(root: HTMLElement, options: TimeListOptions = {}): TimeListHandle {
  const step = options.step ?? DEFAULT_STEP;
  if (!Number.isInteger(step) || step <= 0 || step > MINUTES_PER_DAY) {
    throw new Error(`[timeList] step must be a whole number of minutes from 1 to ${MINUTES_PER_DAY}, got ${step}`);
  }
  const isRange = options.mode === 'range';
  const allowOvernight = options.allowOvernight ?? true;
  const min = options.min ? requireTime(options.min, 'min') : 0;
  const max = options.max ? requireTime(options.max, 'max') : MINUTES_PER_DAY - 1;
  let labels = options.labels ?? {};
  const format = options.format ?? ((time: string) => time);
  const duration = (minutes: number): string => (labels.duration ?? defaultDuration)(minutes);
  const id = `gx-time-${++uid}`;

  const times: number[] = [];
  for (let m = 0; m < MINUTES_PER_DAY; m += step) times.push(m);

  let value: number | null = options.value ? requireTime(options.value, 'value') : null;
  let start: number | null = options.range?.start ? requireTime(options.range.start, 'range.start') : null;
  let end: number | null = options.range?.end ? requireTime(options.range.end, 'range.end') : null;
  let preview: number | null = null;
  let active = 0;
  let typed = '';
  let typedAt = 0;

  root.classList.add('gx-time');
  const title = document.createElement('p');
  title.className = 'gx-time-title';
  title.id = `${id}-title`;
  const list = document.createElement('ul');
  list.className = 'gx-time-list';
  list.setAttribute('role', 'listbox');
  if (labels.list) list.setAttribute('aria-label', labels.list);
  else list.setAttribute('aria-labelledby', title.id);
  if (isRange) list.setAttribute('aria-multiselectable', 'true');
  const summary = document.createElement('p');
  summary.className = 'gx-time-summary';
  summary.setAttribute('aria-live', 'polite');

  const items = times.map((m) => {
    const option = document.createElement('li');
    option.className = 'gx-time-option';
    option.id = `${id}-${m}`;
    option.setAttribute('role', 'option');
    option.dataset.time = formatTime(m);
    option.tabIndex = -1;
    list.append(option);
    return option;
  });
  root.replaceChildren(title, list, ...(isRange ? [summary] : []));

  const isBlocked = (m: number): boolean => m < min || m > max || (options.isDisabled?.(formatTime(m)) ?? false);
  const isBetween = (m: number, from: number, to: number): boolean => (to > from ? m > from && m < to : m > from || m < to);

  const describe = (from: number, to: number): string => {
    const range = timeRange(formatTime(from), formatTime(to));
    const night = range.isOvernight ? ` (${labels.nextDayLong ?? 'next day'})` : '';
    return `${format(range.start)} – ${format(range.end)}${night} · ${duration(range.minutes)}`;
  };

  const render = (): void => {
    const hover = start !== null && preview !== null && (allowOvernight || preview > start) ? preview : null;
    const target = end ?? hover;
    times.forEach((m, i) => {
      const option = items[i]!;
      const isEnd = isRange && end === m;
      const isSelected = isRange ? start === m || isEnd : value === m;
      option.setAttribute('aria-selected', String(isSelected));
      option.tabIndex = i === active ? 0 : -1;
      if (isBlocked(m)) option.setAttribute('aria-disabled', 'true');
      else option.removeAttribute('aria-disabled');

      let range = '';
      if (isRange && start !== null) {
        if (m === start) range = 'start';
        else if (isEnd) range = 'end';
        else if (target !== null && target !== start && isBetween(m, start, target)) range = end === null ? 'preview' : 'middle';
      }
      if (range) option.dataset.range = range;
      else delete option.dataset.range;

      const isNextDay = isRange && start !== null && m === target && m < start && target !== start;
      const text = format(formatTime(m));
      if (isNextDay) {
        const tag = document.createElement('span');
        tag.className = 'gx-time-tag';
        tag.setAttribute('aria-hidden', 'true');
        tag.textContent = labels.nextDay ?? '+1';
        option.replaceChildren(text, tag);
        option.setAttribute('aria-label', `${text}, ${labels.nextDayLong ?? 'next day'}`);
      } else {
        option.replaceChildren(text);
        option.removeAttribute('aria-label');
      }
    });
    if (isRange) {
      title.textContent = start === null || end !== null ? (labels.pickStart ?? 'Pick a start time') : (labels.pickEnd ?? 'Pick an end time');
      summary.textContent = start !== null && end !== null ? describe(start, end) : start !== null ? `${format(formatTime(start))} – …` : '';
    } else {
      title.textContent = labels.title ?? 'Pick a time';
    }
  };

  const keepVisible = (option: HTMLElement, isCentred = false): void => {
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (isCentred) list.scrollTop = top - (list.clientHeight - option.offsetHeight) / 2;
    else if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  };

  const moveTo = (index: number, isCentred = false): void => {
    active = Math.min(Math.max(index, 0), times.length - 1);
    if (isRange && start !== null && end === null) preview = times[active]!;
    render();
    const option = items[active]!;
    option.focus({ preventScroll: true });
    keepVisible(option, isCentred);
  };

  const pick = (index: number): void => {
    const m = times[index];
    if (m === undefined || isBlocked(m)) return;
    active = index;
    if (!isRange) {
      value = m;
      render();
      options.onSelect?.(formatTime(m));
      return;
    }
    if (start === null || end !== null || (m < start && !allowOvernight)) {
      start = m;
      end = null;
      preview = null;
      render();
      return;
    }
    if (m === start) return;
    end = m;
    preview = null;
    render();
    options.onRangeSelect?.(timeRange(formatTime(start), formatTime(m)));
  };

  const indexOf = (target: EventTarget | null): number =>
    target instanceof Element ? items.indexOf(target.closest<HTMLLIElement>('.gx-time-option')!) : -1;
  const nearestIndex = (m: number): number => Math.min(Math.round(m / step), times.length - 1);
  const stepsPerHour = Math.max(1, Math.round(MINUTES_PER_HOUR / step));

  const onClick = (e: MouseEvent): void => {
    const index = indexOf(e.target);
    if (index >= 0) pick(index);
  };
  const onPointerOver = (e: PointerEvent): void => {
    const index = indexOf(e.target);
    if (index < 0 || !isRange || start === null || end !== null) return;
    preview = times[index]!;
    render();
  };
  const onKey = (e: KeyboardEvent): void => {
    const from = indexOf(e.target);
    if (from < 0) return;
    const last = times.length - 1;
    const next =
      e.key === 'ArrowDown' ? from + 1
      : e.key === 'ArrowUp' ? from - 1
      : e.key === 'PageDown' ? from + stepsPerHour
      : e.key === 'PageUp' ? from - stepsPerHour
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null;
    if (next !== null) {
      e.preventDefault();
      moveTo(next);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(from);
      return;
    }
    if (/^\d$/.test(e.key)) {
      const now = performance.now();
      typed = now - typedAt > TYPEAHEAD_MS ? e.key : typed + e.key;
      typedAt = now;
      // "9" and "930" mean 09 and 0930; an odd digit count is missing the leading zero.
      const digits = typed.length % 2 === 1 ? `0${typed}` : typed;
      const match = times.findIndex((m) => formatTime(m).replace(':', '').startsWith(digits));
      if (match >= 0) moveTo(match, true);
    }
  };

  list.addEventListener('click', onClick);
  list.addEventListener('pointerover', onPointerOver);
  list.addEventListener('keydown', onKey);

  const selectedIndex = (): number => {
    const m = isRange ? start : value;
    if (m !== null) return nearestIndex(m);
    const now = new Date();
    return nearestIndex(now.getHours() * MINUTES_PER_HOUR + now.getMinutes());
  };
  active = selectedIndex();
  render();

  return {
    get value() {
      return value === null ? null : formatTime(value);
    },
    get range() {
      return start === null ? null : { start: formatTime(start), end: end === null ? null : formatTime(end) };
    },
    setValue(time) {
      value = time ? requireTime(time, 'value') : null;
      if (value !== null) active = nearestIndex(value);
      render();
    },
    setRange(range) {
      start = range?.start ? requireTime(range.start, 'range.start') : null;
      end = range?.end ? requireTime(range.end, 'range.end') : null;
      preview = null;
      if (start !== null) active = nearestIndex(start);
      render();
    },
    setLabels(next) {
      labels = next;
      if (labels.list) {
        list.setAttribute('aria-label', labels.list);
        list.removeAttribute('aria-labelledby');
      }
      render();
    },
    focus() {
      moveTo(selectedIndex(), true);
    },
    destroy() {
      list.removeEventListener('click', onClick);
      list.removeEventListener('pointerover', onPointerOver);
      list.removeEventListener('keydown', onKey);
      root.replaceChildren();
      root.classList.remove('gx-time');
    },
  };
}

export interface TimePickerOptions extends Omit<TimeListOptions, 'onSelect' | 'onRangeSelect'> {
  /** Range mode: a second field for the end time. Without it both times share the first field. */
  endInput?: HTMLInputElement;
  /** Joins a range in a single field. */
  separator?: string;
  onChange?: (value: string | TimeRange) => void;
}

export interface TimePickerHandle {
  readonly list: TimeListHandle;
  open(): void;
  close(): void;
  destroy(): void;
}

/**
 * Text field + toggle + [popover] panel holding a gx-time list. Typing a time ("9:30", "21:00",
 * "9:30 pm") updates the list; picking fills the field with "HH:MM", fires "input", closes the
 * panel and returns focus to the toggle.
 */
export function timePicker(
  input: HTMLInputElement,
  toggle: HTMLButtonElement,
  panel: HTMLElement,
  options: TimePickerOptions = {},
): TimePickerHandle {
  const separator = options.separator ?? ' – ';
  const isRange = options.mode === 'range';
  const host = panel.querySelector<HTMLElement>('.gx-time') ?? panel.appendChild(document.createElement('div'));

  if (!panel.id) panel.id = `gx-timepicker-${++uid}`;
  if (!panel.hasAttribute('popover')) panel.popover = 'auto';
  panel.setAttribute('role', 'dialog');
  if (!panel.hasAttribute('aria-label')) panel.setAttribute('aria-label', toggle.getAttribute('aria-label') ?? 'Choose time');
  toggle.setAttribute('aria-haspopup', 'dialog');
  toggle.setAttribute('aria-controls', panel.id);
  toggle.setAttribute('aria-expanded', 'false');

  if (CSS.supports('position-area: block-end')) {
    const anchor = `--${panel.id}`;
    (input.closest<HTMLElement>('.gx-timepicker') ?? input).style.setProperty('anchor-name', anchor);
    panel.style.setProperty('position-anchor', anchor);
    panel.dataset.anchored = '';
  }

  const emit = (field: HTMLInputElement): void => {
    field.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const close = (): void => {
    if (panel.matches(':popover-open')) panel.hidePopover();
  };

  const list = timeList(host, {
    ...options,
    onSelect(time) {
      input.value = time;
      emit(input);
      close();
      options.onChange?.(time);
    },
    onRangeSelect(range) {
      if (options.endInput) {
        input.value = range.start;
        options.endInput.value = range.end;
        emit(options.endInput);
      } else {
        input.value = `${range.start}${separator}${range.end}`;
      }
      emit(input);
      close();
      options.onChange?.(range);
    },
  });

  const toText = (text: string): string | null => {
    const m = parseTime(text);
    return m === null ? null : formatTime(m);
  };
  const readFields = (): void => {
    if (!isRange) {
      list.setValue(toText(input.value));
      return;
    }
    const [startText = '', endText = ''] = options.endInput ? [input.value, options.endInput.value] : input.value.split(separator);
    const start = toText(startText);
    list.setRange(start ? { start, end: toText(endText) } : null);
  };

  const onToggleClick = (): void => {
    panel.togglePopover();
  };
  const onToggle = (): void => {
    const isOpen = panel.matches(':popover-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      readFields();
      requestAnimationFrame(() => list.focus());
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
    list,
    open() {
      if (!panel.matches(':popover-open')) panel.showPopover();
    },
    close,
    destroy() {
      if (!usesNativeInvoker) toggle.removeEventListener('click', onToggleClick);
      panel.removeEventListener('toggle', onToggle);
      input.removeEventListener('change', readFields);
      options.endInput?.removeEventListener('change', readFields);
      list.destroy();
    },
  };
}
