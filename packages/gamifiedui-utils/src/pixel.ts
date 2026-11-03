/**
 * Pixel-sprite kit: paint a grid from shapes or text rows, auto-outline it, render it as an SVG
 * of merged pixel runs. Colours are hex strings, or short keys looked up in a palette you pass.
 */
export type PixelGrid<C extends string = string> = (C | null)[][];

export type Palette = Readonly<Record<string, string>>;

export interface Painter<C extends string = string> {
  grid: PixelGrid<C>;
  width: number;
  height: number;
  px(x: number, y: number, c: C): void;
  rect(x: number, y: number, w: number, h: number, c: C): void;
  disc(cx: number, cy: number, r: number, c: C): void;
  ring(cx: number, cy: number, rx: number, ry: number, c: C): void;
  /** Paints only over pixels already filled, e.g. a headband that follows the head. */
  over(x: number, y: number, w: number, h: number, c: C): void;
  /** Text rows, one character per pixel; `.` and spaces are empty. Characters are colour keys. */
  rows(lines: readonly string[], x?: number, y?: number): void;
  /** Rings every filled shape with a one-pixel outline. */
  outline(c: C): void;
}

export function painter<C extends string = string>(width = 32, height = 32): Painter<C> {
  const grid: PixelGrid<C> = Array.from({ length: height }, () => Array<C | null>(width).fill(null));
  const px = (x: number, y: number, c: C): void => {
    if (x >= 0 && y >= 0 && x < width && y < height) grid[y]![x] = c;
  };
  const p: Painter<C> = {
    grid,
    width,
    height,
    px,
    rect(x, y, w, h, c) {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(i, j, c);
    },
    disc(cx, cy, r, c) {
      for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * 0.6) px(cx + i, cy + j, c);
    },
    ring(cx, cy, rx, ry, c) {
      for (let a = 0; a < 360; a += 4) {
        const rad = (a * Math.PI) / 180;
        px(Math.round(cx + Math.cos(rad) * rx), Math.round(cy + Math.sin(rad) * ry), c);
      }
    },
    over(x, y, w, h, c) {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (grid[j]?.[i]) px(i, j, c);
    },
    rows(lines, x = 0, y = 0) {
      lines.forEach((line, j) => [...line].forEach((ch, i) => ch !== '.' && ch !== ' ' && px(x + i, y + j, ch as C)));
    },
    outline(c) {
      const filled = grid.map((row) => row.map(Boolean));
      const sides = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const;
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) if (!filled[y]![x] && sides.some(([dx, dy]) => filled[y + dy]?.[x + dx])) px(x, y, c);
    },
  };
  return p;
}

/** A grid as an SVG string; one rect per same-colour run keeps the markup small. */
export function gridSvg(grid: PixelGrid, label = '', palette: Palette = {}): string {
  const width = grid[0]?.length ?? 0;
  const rects: string[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < width) {
      const c = row[x];
      let end = x + 1;
      while (end < width && row[end] === c) end++;
      if (c) rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${palette[c] ?? c}"/>`);
      x = end;
    }
  });
  const safe = label.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);
  const a11y = label ? `role="img" aria-label="${safe}"` : 'aria-hidden="true"';
  return `<svg viewBox="0 0 ${width} ${grid.length}" shape-rendering="crispEdges" ${a11y}>${rects.join('')}</svg>`;
}

/** Mirror a grid left to right, for sprites facing the other way. */
export function mirrorGrid<C extends string>(grid: PixelGrid<C>): PixelGrid<C> {
  return grid.map((row) => [...row].reverse());
}
