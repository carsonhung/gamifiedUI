export interface GridNavOptions {
  /** Cells to move between, relative to the root. Defaults to slots and cards, direct or in `<li>`. */
  selector?: string;
  /** Called after the cursor moves, e.g. to play a hover sound. */
  onMove?: (cell: HTMLElement, index: number) => void;
}

export interface GridNavHandle {
  /** Moves the cursor (and its single tab stop) to a cell. */
  focus(index: number): void;
  /** Re-reads the cells after adding or removing some. */
  refresh(): void;
  destroy(): void;
}

const DEFAULT_SELECTOR =
  ':scope > .gx-slot, :scope > .gx-card, :scope > li > .gx-slot, :scope > li > .gx-card, :scope > li > .gx-flip';

/** Counts the columns the browser laid out, so auto-fill card grids reflow without config. */
function countColumns(root: HTMLElement): number {
  const tracks = getComputedStyle(root).gridTemplateColumns.trim();
  if (!tracks || tracks === 'none') return 1;
  return Math.max(1, tracks.split(/\s+/).length);
}

/**
 * Arrow-key cursor over a gx-inventory or gx-card-grid: one tab stop, arrows move by cell or
 * row, Home/End go to the row's ends, Ctrl+Home/End to the first and last cell.
 */
export function gridNav(root: HTMLElement, { selector = DEFAULT_SELECTOR, onMove }: GridNavOptions = {}): GridNavHandle {
  let cells: HTMLElement[] = [];
  let current = 0;

  const focus = (index: number): void => {
    if (!cells.length) return;
    current = Math.min(Math.max(index, 0), cells.length - 1);
    cells.forEach((cell, i) => {
      cell.tabIndex = i === current ? 0 : -1;
    });
    cells[current]!.focus();
  };

  const refresh = (): void => {
    cells = Array.from(root.querySelectorAll<HTMLElement>(selector));
    current = Math.min(current, Math.max(cells.length - 1, 0));
    cells.forEach((cell, i) => {
      cell.tabIndex = i === current ? 0 : -1;
    });
  };

  const onKey = (e: KeyboardEvent): void => {
    const from = cells.indexOf(e.target as HTMLElement);
    if (from < 0) return;
    const cols = countColumns(root);
    const rowStart = from - (from % cols);
    const last = cells.length - 1;
    const isCtrl = e.ctrlKey || e.metaKey;
    const next =
      e.key === 'ArrowRight' ? Math.min(from + 1, last)
      : e.key === 'ArrowLeft' ? Math.max(from - 1, 0)
      : e.key === 'ArrowDown' ? (from + cols <= last ? from + cols : from)
      : e.key === 'ArrowUp' ? (from - cols >= 0 ? from - cols : from)
      : e.key === 'Home' ? (isCtrl ? 0 : rowStart)
      : e.key === 'End' ? (isCtrl ? last : Math.min(rowStart + cols - 1, last))
      : -1;
    if (next < 0) return;
    e.preventDefault();
    if (next === from) return;
    focus(next);
    onMove?.(cells[next]!, next);
  };

  const onFocusIn = (e: FocusEvent): void => {
    const index = cells.indexOf(e.target as HTMLElement);
    if (index < 0 || index === current) return;
    current = index;
    cells.forEach((cell, i) => {
      cell.tabIndex = i === current ? 0 : -1;
    });
  };

  refresh();
  root.addEventListener('keydown', onKey);
  root.addEventListener('focusin', onFocusIn);

  return {
    focus,
    refresh,
    destroy() {
      root.removeEventListener('keydown', onKey);
      root.removeEventListener('focusin', onFocusIn);
    },
  };
}
