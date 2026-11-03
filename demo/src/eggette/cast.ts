import { gridSvg, mirror, painter, type Colour, type Grid, type Painter, type Pose } from './pixel';
import { warriorGrid } from './warrior';

export type CastId = 'warrior' | 'sage' | 'monk' | 'lancer';
export const CAST: CastId[] = ['warrior', 'sage', 'monk', 'lancer'];

function cheerSparkles(p: Painter, colour: Colour): void {
  for (const [x, y] of [
    [3, 4],
    [5, 9],
    [29, 13],
    [2, 14],
  ] as const)
    p.px(x, y, colour);
}

function sweat(p: Painter, x: number, y: number): void {
  p.px(x, y, 'u');
  p.rect(x, y + 1, 1, 2, 'u');
}

function crossEyes(p: Painter, lx: number, rx: number, y: number): void {
  for (const x of [lx, rx]) {
    p.px(x, y, 'e');
    p.px(x + 2, y, 'e');
    p.px(x + 1, y + 1, 'e');
    p.px(x, y + 2, 'e');
    p.px(x + 2, y + 2, 'e');
  }
}

function happyEyes(p: Painter, lx: number, rx: number, y: number): void {
  for (const x of [lx, rx]) {
    p.px(x, y + 1, 'e');
    p.px(x + 1, y, 'e');
    p.px(x + 2, y + 1, 'e');
  }
}

/** 蛋撻賢者: an egg tart sage with a fluted crust face, a wizard hat, a long beard and a tart-topped staff. */
function sageGrid(pose: Pose): Grid {
  const p = painter();
  for (let y = 16; y <= 29; y++) {
    const half = 4 + Math.floor((y - 16) * 0.45);
    p.rect(16 - half, y, half * 2, 1, 'v');
  }
  p.rect(10, 29, 12, 1, 'V');
  p.rect(15, 17, 2, 12, 'V');
  p.rect(12, 30, 3, 1, 'n');
  p.rect(17, 30, 3, 1, 'n');

  const raised = pose === 'cheer';
  const staffTop = raised ? 1 : 4;
  p.rect(24, staffTop + 2, 1, 29 - staffTop - 2, 'b');
  p.disc(24, staffTop, 2, 'o');
  p.rect(23, staffTop - 1, 3, 2, 'c');
  p.rect(20, raised ? 15 : 18, 4, 3, 'v');
  p.rect(23, raised ? 15 : 18, 2, 2, 'c');
  p.rect(8, 18, 3, 4, 'v');
  p.rect(8, 22, 2, 1, 'c');

  p.disc(16, 12, 5, 'o');
  for (let a = 0; a < 360; a += 30) {
    const rad = (a * Math.PI) / 180;
    p.px(Math.round(16 + Math.cos(rad) * 5), Math.round(12 + Math.sin(rad) * 5), 'y');
  }
  p.disc(16, 12, 4, 'c');
  p.px(18, 10, 'F');
  p.px(13, 14, 'F');

  for (let y = 1; y <= 7; y++) {
    const half = Math.floor(y * 0.9);
    p.rect(16 - half, y, half * 2 + 1, 1, 'V');
  }
  p.px(17, 0, 'V');
  p.px(18, 0, 'V');
  p.rect(9, 7, 15, 1, 'V');
  p.px(16, 4, 'c');
  p.px(15, 5, 'c');
  p.px(17, 5, 'c');

  p.rect(12, 14, 8, 1, 'w');
  for (let y = 15; y <= 22; y++) {
    const half = Math.max(1, 4 - Math.floor((y - 15) * 0.5));
    p.rect(16 - half, y, half * 2, 1, 'w');
  }
  p.rect(12, 10, 2, 1, 'w');
  p.rect(18, 10, 2, 1, 'w');

  if (pose === 'cheer') {
    happyEyes(p, 12, 17, 11);
    cheerSparkles(p, 'c');
    p.px(27, 2, 'c');
    p.px(21, 0, 'c');
  } else if (pose === 'hurt') {
    crossEyes(p, 12, 17, 10);
    sweat(p, 21, 9);
  } else {
    p.rect(13, 12, 2, 1, 'e');
    p.rect(17, 12, 2, 1, 'e');
  }
  p.outline();
  return p.grid;
}

/** 奶茶僧侶: a milk tea monk in a saffron robe with prayer beads, a sock tea filter and a cup of milk tea. */
function monkGrid(pose: Pose): Grid {
  const p = painter();
  p.rect(11, 16, 10, 12, 'f');
  for (let i = 0; i < 9; i++) p.rect(20 - i, 16 + i, 2, 1, 'F');
  p.rect(11, 27, 10, 1, 'F');
  p.rect(12, 28, 3, 2, 'b');
  p.rect(17, 28, 3, 2, 'b');

  p.rect(8, 17, 3, 3, 'f');
  p.rect(7, 15, 2, 2, 'm');
  p.rect(6, 14, 1, 2, 'S');
  p.ring(4, 14, 2, 1, 'S');
  for (let y = 15; y <= 24; y++) {
    const half = y < 20 ? 2 : y < 23 ? 1 : 0;
    p.rect(4 - half, y, half * 2 + 1, 1, y % 3 === 0 ? 'M' : 'n');
  }

  const cupY = pose === 'cheer' ? 11 : 19;
  p.rect(20, pose === 'cheer' ? 14 : 17, 3, 3, 'f');
  p.rect(22, cupY, 4, 5, 'w');
  p.rect(22, cupY, 4, 1, 'm');
  p.px(26, cupY + 1, 'w');
  p.px(26, cupY + 2, 'w');
  if (pose === 'hurt') {
    p.rect(24, cupY + 5, 3, 1, 'm');
    p.px(27, cupY + 6, 'm');
  } else {
    p.px(23, cupY - 2, 'W');
    p.px(24, cupY - 3, 'W');
    p.px(24, cupY - 1, 'W');
  }

  p.disc(16, 10, 6, 'm');
  p.disc(14, 7, 1, 'q');
  for (const [x, y] of [
    [20, 13],
    [21, 11],
    [19, 15],
    [17, 15],
  ] as const)
    p.px(x, y, 'M');
  for (const [x, y] of [
    [14, 5],
    [16, 5],
    [18, 5],
    [15, 6],
    [17, 6],
  ] as const)
    p.px(x, y, 'M');

  for (const [x, y] of [
    [12, 16],
    [13, 17],
    [14, 17],
    [15, 18],
    [17, 18],
    [18, 17],
    [19, 17],
    [20, 16],
  ] as const)
    p.px(x, y, 'n');
  p.px(16, 19, 'R');
  p.px(16, 18, 'R');

  if (pose === 'cheer') {
    happyEyes(p, 12, 17, 9);
    p.rect(15, 13, 2, 1, 'R');
    cheerSparkles(p, 'Y');
  } else if (pose === 'hurt') {
    crossEyes(p, 12, 17, 9);
    sweat(p, 22, 7);
  } else {
    p.rect(13, 10, 2, 1, 'e');
    p.rect(17, 10, 2, 1, 'e');
    p.px(14, 13, 'R');
    p.rect(15, 14, 2, 1, 'R');
    p.px(17, 13, 'R');
  }
  p.px(12, 12, 'p');
  p.px(20, 12, 'p');
  p.outline();
  return p.grid;
}

/** 魚蛋槍士: a curry fishball lancer in blue armour with a bamboo-skewer lance of fishballs. */
function lancerGrid(pose: Pose): Grid {
  const p = painter();
  p.rect(12, 25, 2, 4, 'D');
  p.rect(17, 25, 2, 4, 'D');
  p.rect(11, 29, 4, 2, 'n');
  p.rect(16, 29, 4, 2, 'n');
  p.rect(11, 17, 9, 8, 'B');
  p.rect(13, 18, 5, 4, 'S');
  p.rect(13, 22, 5, 1, 'D');
  p.rect(11, 24, 9, 1, 'n');
  p.disc(10, 18, 2, 'S');
  p.disc(21, 18, 2, 'S');
  p.rect(8, 19, 3, 4, 'B');
  p.rect(8, 23, 2, 1, 'q');

  const lanceShift = pose === 'cheer' ? -2 : 0;
  p.rect(25, 1 + lanceShift, 1, 29, 'o');
  for (const y of [3, 7, 11]) {
    p.disc(25, y + lanceShift, 2, 'q');
    p.px(24, y - 1 + lanceShift, 'C');
    p.px(26, y + 1 + lanceShift, 'C');
  }
  p.rect(22, 17, 3, 3, 'B');
  p.rect(24, 17, 2, 2, 'q');

  p.disc(15, 11, 6, 'q');
  for (const [x, y] of [
    [11, 12],
    [12, 13],
    [19, 13],
    [18, 14],
    [20, 10],
    [14, 16],
  ] as const)
    p.px(x, y, 'C');
  p.over(8, 5, 15, 3, 'S');
  p.over(8, 8, 15, 1, 'D');
  p.px(13, 6, 's');
  p.px(14, 6, 's');
  p.px(15, 3, 'r');
  p.px(16, 2, 'r');
  p.px(17, 2, 'r');
  p.px(18, 3, 'r');
  p.px(16, 3, 'R');

  if (pose === 'cheer') {
    happyEyes(p, 11, 16, 10);
    p.rect(14, 14, 3, 2, 'R');
    cheerSparkles(p, 'Y');
  } else if (pose === 'hurt') {
    crossEyes(p, 11, 16, 10);
    sweat(p, 21, 9);
  } else {
    p.rect(12, 11, 2, 2, 'e');
    p.rect(17, 11, 2, 2, 'e');
    p.px(12, 11, 'w');
    p.px(17, 11, 'w');
    p.rect(11, 10, 3, 1, 'D');
    p.rect(17, 10, 3, 1, 'D');
    p.rect(14, 14, 3, 1, 'e');
  }
  p.outline();
  return p.grid;
}

const CAST_GRID: Record<CastId, (pose: Pose) => Grid> = {
  warrior: warriorGrid,
  sage: sageGrid,
  monk: monkGrid,
  lancer: lancerGrid,
};

export function castSvg(id: CastId, pose: Pose, label: string): string {
  return gridSvg(CAST_GRID[id](pose), label);
}

interface Outfit {
  skin: Colour;
  hair: Colour;
  shirt: Colour;
  pants: Colour;
  isLongHair: boolean;
}

const OUTFITS: Outfit[] = [
  { skin: 't', hair: 'h', shirt: 'B', pants: 'D', isLongHair: false },
  { skin: 't', hair: 'e', shirt: 'w', pants: 'D', isLongHair: true },
  { skin: 'm', hair: 'e', shirt: 'g', pants: 'i', isLongHair: false },
  { skin: 't', hair: 'n', shirt: 'r', pants: 'i', isLongHair: true },
  { skin: 'm', hair: 'h', shirt: 'v', pants: 'n', isLongHair: false },
  { skin: 't', hair: 'S', shirt: 'f', pants: 'D', isLongHair: true },
];

export const OUTFIT_COUNT = OUTFITS.length;

function customerGrid(variant: number, frame: 0 | 1): Grid {
  const o = OUTFITS[variant % OUTFITS.length]!;
  const p = painter();
  if (frame === 0) {
    p.rect(13, 24, 2, 5, o.pants);
    p.rect(17, 24, 2, 5, o.pants);
    p.rect(12, 29, 3, 1, 'e');
    p.rect(17, 29, 3, 1, 'e');
  } else {
    p.rect(12, 24, 2, 5, o.pants);
    p.rect(18, 24, 2, 4, o.pants);
    p.rect(11, 29, 3, 1, 'e');
    p.rect(18, 28, 3, 1, 'e');
  }
  p.rect(12, 17, 8, 7, o.shirt);
  p.rect(10, 18, 2, 5, o.shirt);
  p.rect(20, 18, 2, 5, o.shirt);
  p.rect(10, 23, 2, 1, o.skin);
  p.rect(20, 23, 2, 1, o.skin);
  p.disc(16, 12, 4, o.skin);
  p.over(11, 7, 11, 3, o.hair);
  p.px(12, 10, o.hair);
  p.px(20, 10, o.hair);
  if (o.isLongHair) {
    p.rect(11, 10, 2, 6, o.hair);
    p.rect(20, 10, 2, 6, o.hair);
  }
  p.px(14, 12, 'e');
  p.px(18, 12, 'e');
  p.rect(15, 14, 2, 1, 'R');
  p.outline();
  return p.grid;
}

/** Customers face left, toward the counter. */
export function customerSvg(variant: number, frame: 0 | 1): string {
  return gridSvg(mirror(customerGrid(variant, frame)), '');
}
