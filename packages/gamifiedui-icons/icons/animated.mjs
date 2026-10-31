/* Animated 16x16 icons: each entry is a list of frames played with steps() at `fps`.
   Same characters as the static sets ("#" solid, "+" half-tone, "." empty). Frame 0 is what
   reduced-motion users see, so make it a complete, meaningful pose. */
import common from './common.mjs';
import { EYES, GRIN, GRIN_CLOSED, HAPPY_EYES, LEFT_EYE, SMILE, WINK_RIGHT, face } from './emoji.mjs';

const SIZE = 16;
const grid = (fn) =>
  Array.from({ length: SIZE }, (_, y) => Array.from({ length: SIZE }, (_, x) => fn(x, y)).join(''));

const rowsOf = (name) => {
  const icon = common.find((i) => i.name === name);
  return icon.mirror ? icon.rows.map((r) => r + [...r].reverse().join('')) : icon.rows;
};

const shiftX = (rows, dx) =>
  rows.map((row) => (dx > 0 ? '.'.repeat(dx) + row.slice(0, SIZE - dx) : row.slice(-dx) + '.'.repeat(-dx)));

/* Pencil lying along the up-right diagonal with its tip at (tx, ty). */
const pencilAt = (tx, ty) => (x, y) => {
  const across = x + y - (tx + ty);
  const along = x - y - (tx - ty);
  if (across < -1 || across > 1 || along < 0 || along > 15) return null;
  if (along <= 2) return across === 0 ? '#' : null;
  if (along <= 4) return '+';
  if (along === 13) return null;
  return along >= 14 ? '+' : '#';
};

const writing = (tx) =>
  grid((x, y) => {
    const pen = pencilAt(tx, 13)(x, y);
    if (pen) return pen;
    const lineY = x % 4 < 2 ? 13 : 12;
    return x >= 1 && x < tx && y === lineY ? '#' : '.';
  });

/* Tablet with a finger coming up from below: rest, tap (ripple), then swipe the page up. */
const tablet = (frame) => {
  const pressed = frame === 1;
  const scroll = frame < 2 ? 0 : frame - 1;
  const tipY = pressed ? 6 : 5;
  return grid((x, y) => {
    const isFinger = (x === 9 || x === 10) && y >= tipY;
    const isHand = x >= 9 && x <= 14 && y >= 13;
    if (isFinger || isHand) return '#';
    if (pressed && (((x === 8 || x === 11) && y === tipY - 1) || ((x === 9 || x === 10) && y === tipY - 2))) return '+';
    if ((x === 8 || x === 11) && y >= tipY && y <= 13) return '.';
    if (x >= 8 && y >= 13) return '.';
    const inFrame = x >= 1 && x <= 12 && y >= 0 && y <= 12;
    if (!inFrame) return '.';
    if (x === 1 || x === 12 || y === 0 || y >= 11) return y === 11 && (x === 6 || x === 7) ? '.' : '#';
    const line = (y + scroll) % 3 === 1;
    const width = (y + scroll) % 6 === 1 ? 10 : 8;
    return line && x >= 3 && x <= width ? '+' : '.';
  });
};

const smallHeart = (() => {
  const half = [
    '........', '........', '........', '...###..', '..#####.', '..######', '..######', '...#####',
    '....####', '.....###', '......##', '.......#', '........', '........', '........', '........',
  ];
  return half.map((r) => r + [...r].reverse().join(''));
})();

const coin = (a) =>
  grid((x, y) => {
    const outer = ((x - 7.5) / a) ** 2 + ((y - 7.5) / 6.8) ** 2;
    if (outer > 1) return '.';
    if (a < 2) return '#';
    const inner = ((x - 7.5) / (a - 2)) ** 2 + ((y - 7.5) / 4.8) ** 2;
    return inner <= 1 ? '+' : '#';
  });

const typing = (raised) =>
  grid((x, y) => {
    const corner = (x === 1 || x === 14) && (y === 2 || y === 11);
    const inBubble = x >= 1 && x <= 14 && y >= 2 && y <= 11 && !corner;
    const inTail = (y === 12 && x >= 3 && x <= 5) || (y === 13 && x >= 3 && x <= 4) || (y === 14 && x === 3);
    if (!inBubble && !inTail) return '.';
    for (let i = 0; i < 3; i++) {
      const dx = 4 + i * 3;
      const top = i === raised ? 5 : 6;
      if ((x === dx || x === dx + 1) && (y === top || y === top + 1)) return '.';
    }
    return '#';
  });

const SPINNER_DOTS = Array.from({ length: 8 }, (_, k) => {
  const angle = (k / 8) * Math.PI * 2 - Math.PI / 2;
  return [Math.round(7 + Math.cos(angle) * 5), Math.round(7 + Math.sin(angle) * 5)];
});

const spinner = (frame) =>
  grid((x, y) => {
    for (let k = 0; k < 8; k++) {
      const [dx, dy] = SPINNER_DOTS[k];
      if (x < dx || x > dx + 1 || y < dy || y > dy + 1) continue;
      return k === frame ? '#' : '+';
    }
    return '.';
  });

const FIRE = [
  [
    '................', '.......#........', '......##........', '......###.......',
    '.....####..#....', '.....#####.##...', '....##########..', '...###########..',
    '..####+++#####..', '..###++++++###..', '..###+++++####..', '..###++++++###..',
    '...###++++###...', '....########....', '......####......', '................',
  ],
  [
    '................', '........#.......', '.......##.......', '.......###..#...',
    '......####.##...', '.....#########..', '....##########..', '...###########..',
    '..#####+++####..', '..###+++++++##..', '..###++++++###..', '..####+++++###..',
    '...###++++###...', '....########....', '......####......', '................',
  ],
  [
    '.....#..........', '......#.........', '......##....#...', '.....###...##...',
    '.....####.###...', '....##########..', '...###########..', '...###########..',
    '..####++++####..', '..###++++++###..', '..##++++++++##..', '..###++++++###..',
    '...###++++###...', '....########....', '......####......', '................',
  ],
];

const bell = rowsOf('bell');
const heart = rowsOf('heart');
/* Body swings one way while the clapper (bottom rows) swings the other. */
const CLAPPER_FROM = 13;
const swing = (dx) => [...shiftX(bell.slice(0, CLAPPER_FROM), dx), ...shiftX(bell.slice(CLAPPER_FROM), -dx)];

const smileFace = face([...EYES, ...SMILE]);
const winkFace = face([...LEFT_EYE, ...WINK_RIGHT, ...SMILE]);
const laughFace = face([...HAPPY_EYES, ...GRIN]);
const laughClosed = face([...HAPPY_EYES, ...GRIN_CLOSED]);

export default [
  { name: 'fire', en: 'Fire', hant: '火焰', hans: '火焰', fps: 6, frames: [FIRE[0], FIRE[1], FIRE[2], FIRE[1]] },
  { name: 'write', en: 'Writing', hant: '書寫', hans: '书写', fps: 6, frames: [2, 4, 6, 8, 10, 12].map(writing) },
  { name: 'tablet', en: 'Using a tablet', hant: '使用平板', hans: '使用平板', fps: 3, frames: [0, 1, 2, 3].map(tablet) },
  { name: 'heartbeat', en: 'Heartbeat', hant: '心跳', hans: '心跳', fps: 4, frames: [heart, smallHeart, heart, heart] },
  { name: 'coin-spin', en: 'Spinning coin', hant: '旋轉金幣', hans: '旋转金币', fps: 8, frames: [6.8, 4.6, 1.5, 4.6].map(coin) },
  { name: 'bell-ring', en: 'Ringing bell', hant: '響鈴', hans: '响铃', fps: 8, frames: [bell, swing(-1), bell, swing(1)] },
  { name: 'typing', en: 'Typing', hant: '輸入中', hans: '输入中', fps: 4, frames: [0, 1, 2, 3].map(typing) },
  { name: 'loading', en: 'Loading', hant: '載入中', hans: '加载中', fps: 10, frames: Array.from({ length: 8 }, (_, f) => spinner(f)) },
  { name: 'wink', en: 'Wink', hant: '眨眼', hans: '眨眼', fps: 3, frames: [winkFace, winkFace, smileFace, smileFace] },
  { name: 'laugh', en: 'Laugh', hant: '大笑', hans: '大笑', fps: 6, frames: [laughFace, laughClosed] },
];
