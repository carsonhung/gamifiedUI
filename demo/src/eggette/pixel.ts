/**
 * Pixel-sprite kit for the cast: 32x32 grids painted from shapes, auto-outlined, rendered as an
 * SVG of merged pixel runs. Character art keeps its own palette so it reads the same in every
 * theme.
 */
export type Pose = 'idle' | 'cheer' | 'hurt';

export const SIZE = 32;

export const PALETTE = {
  k: '#2b1a0e',
  y: '#f4b942',
  Y: '#ffe08a',
  o: '#c98a2a',
  r: '#d83a3a',
  R: '#8f1f1f',
  w: '#ffffff',
  W: '#e6e2d8',
  e: '#1d1d1d',
  p: '#f59a9a',
  s: '#d5dbe3',
  S: '#8a94a3',
  i: '#4a4a55',
  I: '#2a2a33',
  b: '#8a5a2b',
  n: '#5e3b1c',
  u: '#7dd3fc',
  v: '#7b5cc4',
  V: '#4b3486',
  c: '#ffd84a',
  m: '#c8946a',
  M: '#9a6a44',
  f: '#e8892c',
  F: '#b85e14',
  q: '#f3e2b0',
  C: '#e07a20',
  B: '#3b6fd8',
  D: '#24448f',
  g: '#3f8f4f',
  G: '#2a6a3a',
  h: '#3a2a1e',
  t: '#f2c9a0',
} as const;

export type Colour = keyof typeof PALETTE;
export type Grid = (Colour | null)[][];
export type Painter = ReturnType<typeof painter>;

export function painter() {
  const grid: Grid = Array.from({ length: SIZE }, () => Array<Colour | null>(SIZE).fill(null));
  const px = (x: number, y: number, c: Colour): void => {
    if (x >= 0 && y >= 0 && x < SIZE && y < SIZE) grid[y]![x] = c;
  };
  const rect = (x: number, y: number, w: number, h: number, c: Colour): void => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(i, j, c);
  };
  const disc = (cx: number, cy: number, r: number, c: Colour): void => {
    for (let j = -r; j <= r; j++)
      for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * 0.6) px(cx + i, cy + j, c);
  };
  const ring = (cx: number, cy: number, rx: number, ry: number, c: Colour): void => {
    for (let a = 0; a < 360; a += 4) {
      const rad = (a * Math.PI) / 180;
      px(Math.round(cx + Math.cos(rad) * rx), Math.round(cy + Math.sin(rad) * ry), c);
    }
  };
  /** Paints only over pixels already filled, e.g. a headband that follows the head. */
  const over = (x: number, y: number, w: number, h: number, c: Colour): void => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (grid[j]?.[i]) px(i, j, c);
  };
  const bubble = (x: number, y: number, light: Colour, mid: Colour, dark: Colour): void => {
    px(x, y, light);
    px(x + 1, y, mid);
    px(x, y + 1, mid);
    px(x + 1, y + 1, dark);
  };
  const outline = (): void => {
    const filled = grid.map((row) => row.map(Boolean));
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        if (filled[y]![x]) continue;
        const touches = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].some(([dx, dy]) => filled[y + dy!]?.[x + dx!]);
        if (touches) px(x, y, 'k');
      }
  };
  return { grid, px, rect, disc, ring, over, bubble, outline };
}

/** A grid as an SVG string; one rect per same-colour run keeps the markup small. */
export function gridSvg(grid: Grid, label: string): string {
  const rects: string[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < SIZE) {
      const c = row[x];
      let end = x + 1;
      while (end < SIZE && row[end] === c) end++;
      if (c) rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${PALETTE[c]}"/>`);
      x = end;
    }
  });
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges" ${a11y}>${rects.join('')}</svg>`;
}

/** Mirror a grid left to right, for characters walking the other way. */
export function mirror(grid: Grid): Grid {
  return grid.map((row) => [...row].reverse());
}