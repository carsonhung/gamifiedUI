/* Pixel emoji: a solid 16x16 face with the features cut out (".") or half-toned ("+"),
   so they read in one colour. face() is shared with icons/animated.mjs for blinking frames. */
const SIZE = 16;

const cells = (...spans) => spans.flatMap(([x0, x1, y]) => Array.from({ length: x1 - x0 + 1 }, (_, i) => `${x0 + i},${y}`));

export const EYES = cells([4, 5, 5], [4, 5, 6], [10, 11, 5], [10, 11, 6]);
export const LEFT_EYE = cells([4, 5, 5], [4, 5, 6]);
export const WINK_RIGHT = cells([9, 12, 6]);
export const HAPPY_EYES = cells([5, 5, 5], [4, 4, 6], [6, 6, 6], [10, 10, 5], [9, 9, 6], [11, 11, 6]);
export const SMILE = cells([4, 4, 10], [11, 11, 10], [5, 10, 11]);
export const GRIN = cells([4, 11, 9], [4, 11, 10], [5, 10, 11], [6, 9, 12]);
export const GRIN_CLOSED = cells([4, 11, 10], [5, 10, 11]);

export function face(cut, half = []) {
  const cutSet = new Set(cut);
  const halfSet = new Set(half);
  return Array.from({ length: SIZE }, (_, y) =>
    Array.from({ length: SIZE }, (_, x) => {
      if (Math.hypot(x - 7.5, y - 7.5) > 7.4) return '.';
      const key = `${x},${y}`;
      if (cutSet.has(key)) return '.';
      return halfSet.has(key) ? '+' : '#';
    }).join(''),
  );
}

const FROWN = cells([5, 10, 10], [4, 4, 11], [11, 11, 11]);
const TEARS = cells([4, 4, 8], [4, 4, 9], [11, 11, 8], [11, 11, 9], [4, 4, 10], [11, 11, 10]);
const HEART_EYES = cells([3, 3, 4], [5, 5, 4], [10, 10, 4], [12, 12, 4], [3, 5, 5], [10, 12, 5], [4, 4, 6], [11, 11, 6]);
const SHADES = cells([2, 13, 5], [3, 6, 6], [9, 12, 6]);
const SMIRK = cells([11, 11, 10], [6, 10, 11]);

export default [
  { name: 'smile', en: 'Smile', hant: '微笑', hans: '微笑', rows: face([...EYES, ...SMILE]) },
  { name: 'laugh', en: 'Laugh', hant: '大笑', hans: '大笑', rows: face([...HAPPY_EYES, ...GRIN]) },
  { name: 'wink', en: 'Wink', hant: '眨眼', hans: '眨眼', rows: face([...LEFT_EYE, ...WINK_RIGHT, ...SMILE]) },
  { name: 'sad', en: 'Sad', hant: '傷心', hans: '伤心', rows: face([...EYES, ...FROWN]) },
  { name: 'cry', en: 'Cry', hant: '哭泣', hans: '哭泣', rows: face([...EYES, ...FROWN], TEARS) },
  {
    name: 'angry', en: 'Angry', hant: '生氣', hans: '生气',
    rows: face([...cells([4, 4, 3], [5, 5, 4], [11, 11, 3], [10, 10, 4], [4, 5, 6], [10, 11, 6]), ...cells([5, 10, 11])]),
  },
  { name: 'surprised', en: 'Surprised', hant: '驚訝', hans: '惊讶', rows: face([...EYES, ...cells([7, 8, 9], [7, 8, 10], [7, 8, 11])]) },
  { name: 'love', en: 'Love', hant: '喜愛', hans: '喜爱', rows: face([...HEART_EYES, ...SMILE]) },
  { name: 'cool', en: 'Cool', hant: '型', hans: '酷', rows: face([...SHADES, ...SMIRK]) },
  { name: 'neutral', en: 'Neutral', hant: '無表情', hans: '无表情', rows: face([...EYES, ...cells([5, 10, 10])]) },
];
