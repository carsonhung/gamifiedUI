/** 雞蛋仔戰士 (Egg Waffle Warrior): an egg-waffle hero with a waffle-iron shield and a whisk. */
import { painter, type Grid, type Painter, type Pose } from './pixel';

function drawWhisk(p: Painter, raised: boolean): void {
  if (raised) {
    p.rect(25, 12, 2, 5, 'b');
    p.ring(25.5, 6, 3, 5, 's');
    p.ring(25.5, 6, 1, 5, 'S');
    p.rect(24, 10, 4, 1, 'S');
  } else {
    p.rect(24, 19, 5, 2, 'b');
    p.ring(29, 24, 2, 4, 's');
  }
}

function drawShield(p: Painter): void {
  p.disc(6, 18, 5, 'i');
  for (const [x, y] of [
    [3, 15],
    [6, 14],
    [8, 16],
    [3, 18],
    [6, 17],
    [8, 19],
    [4, 21],
    [7, 21],
  ] as const)
    p.bubble(x, y, 'S', 'I', 'I');
  p.px(3, 14, 's');
  p.px(2, 15, 's');
}

export function warriorGrid(pose: Pose): Grid {
  const p = painter();

  p.rect(13, 24, 2, 4, 'o');
  p.rect(17, 24, 2, 4, 'o');
  p.rect(12, 28, 4, 2, 'R');
  p.rect(17, 28, 4, 2, 'R');

  p.rect(11, 15, 10, 9, 'y');
  for (const by of [16, 19, 22]) for (const bx of [12, 15, 18]) p.bubble(bx, by, 'Y', 'y', 'o');
  for (let i = 0; i < 9; i++) {
    p.px(11 + i, 15 + i, 'r');
    p.px(12 + i, 15 + i, 'r');
  }

  if (pose === 'cheer') {
    p.rect(8, 12, 3, 3, 'y');
    p.rect(21, 12, 3, 3, 'y');
    p.rect(7, 10, 2, 2, 'y');
    drawWhisk(p, true);
    for (const [x, y] of [
      [3, 4],
      [5, 8],
      [29, 14],
      [2, 12],
    ] as const)
      p.px(x, y, 'Y');
  } else {
    p.rect(9, 16, 3, 2, 'y');
    p.rect(21, 16, 3, 2, 'y');
    p.rect(24, 15, 2, 3, 'y');
    drawShield(p);
    drawWhisk(p, pose === 'idle');
  }

  p.disc(16, 9, 6, 'y');
  p.disc(14, 7, 2, 'Y');
  for (const [x, y] of [
    [20, 11],
    [21, 9],
    [19, 13],
    [17, 14],
    [21, 10],
  ] as const)
    p.px(x, y, 'o');
  p.over(9, 5, 15, 2, 'r');
  p.over(9, 6, 15, 1, 'R');
  const tails: [number, number][] =
    pose === 'hurt'
      ? [
          [9, 7],
          [8, 8],
          [8, 9],
          [7, 10],
          [9, 8],
        ]
      : [
          [9, 5],
          [8, 4],
          [7, 4],
          [6, 3],
          [9, 6],
          [8, 7],
          [7, 7],
          [6, 8],
        ];
  tails.forEach(([x, y]) => p.px(x, y, 'r'));

  if (pose === 'cheer') {
    [
      [12, 9],
      [13, 8],
      [14, 9],
      [17, 9],
      [18, 8],
      [19, 9],
    ].forEach(([x, y]) => p.px(x!, y!, 'e'));
    p.rect(15, 11, 2, 2, 'R');
  } else if (pose === 'hurt') {
    [
      [12, 8],
      [14, 8],
      [13, 9],
      [12, 10],
      [14, 10],
      [17, 8],
      [19, 8],
      [18, 9],
      [17, 10],
      [19, 10],
    ].forEach(([x, y]) => p.px(x!, y!, 'e'));
    [
      [14, 13],
      [15, 12],
      [16, 13],
      [17, 12],
    ].forEach(([x, y]) => p.px(x!, y!, 'e'));
    p.px(22, 9, 'u');
    p.rect(22, 10, 1, 2, 'u');
  } else {
    p.rect(13, 9, 2, 2, 'e');
    p.rect(17, 9, 2, 2, 'e');
    p.px(13, 9, 'w');
    p.px(17, 9, 'w');
    p.rect(12, 8, 3, 1, 'o');
    p.rect(17, 8, 3, 1, 'o');
    p.rect(15, 12, 2, 1, 'e');
    p.px(14, 11, 'e');
    p.px(17, 11, 'e');
  }
  p.px(12, 11, 'p');
  p.px(20, 11, 'p');

  p.outline();
  return p.grid;
}
