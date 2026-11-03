import { prefersReducedMotion } from './motion.js';

const LATIN_CPS = 40;
/** CJK glyphs carry a word each, so they type slower to stay readable. */
const CJK_CPS = 16;
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

/** Splits into user-perceived characters, so emoji and CJK never break mid-glyph. */
export function graphemes(text: string, locale?: string): string[] {
  if ('Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/** Reader-facing text speed presets, as multipliers of the default rate. */
export const TEXT_SPEEDS = { slow: 0.5, normal: 1, fast: 2, instant: Infinity } as const;
export type TextSpeed = keyof typeof TEXT_SPEEDS;

const AUTO_BASE_MS = 1200;
const AUTO_LATIN_MS_PER_CHAR = 45;
const AUTO_CJK_MS_PER_CHAR = 110;
const AUTO_MAX_MS = 8000;

/** Pause before "Auto" advances a finished line: long enough to read it, capped for long lines. */
export function autoAdvanceMs(text: string, locale?: string): number {
  const perChar = CJK.test(text) ? AUTO_CJK_MS_PER_CHAR : AUTO_LATIN_MS_PER_CHAR;
  return Math.min(AUTO_MAX_MS, AUTO_BASE_MS + graphemes(text, locale).length * perChar);
}

export interface TypewriterOptions {
  /** Defaults to 40, or 16 when the text contains CJK. */
  charsPerSecond?: number;
  /** Multiplies the rate; pass a TEXT_SPEEDS value. Infinity shows the line at once. */
  speed?: number;
  locale?: string;
  onDone?: () => void;
}

export interface TypewriterHandle {
  /** Shows the whole line now (the "press to skip" behaviour). */
  skip(): void;
  cancel(): void;
  readonly done: boolean;
}

/** Types text into el. Put the full line in a separate aria-live element; mark el aria-hidden. */
export function typewriter(el: HTMLElement, text: string, options: TypewriterOptions = {}): TypewriterHandle {
  const glyphs = graphemes(text, options.locale);
  const cps = (options.charsPerSecond ?? (CJK.test(text) ? CJK_CPS : LATIN_CPS)) * (options.speed ?? 1);
  let shown = 0;
  let timer: number | undefined;
  let finished = false;

  const finish = (): void => {
    window.clearInterval(timer);
    el.textContent = text;
    shown = glyphs.length;
    if (!finished) {
      finished = true;
      options.onDone?.();
    }
  };

  if (prefersReducedMotion(el) || glyphs.length === 0 || !Number.isFinite(cps)) {
    finish();
  } else {
    el.textContent = '';
    timer = window.setInterval(() => {
      shown++;
      el.textContent = glyphs.slice(0, shown).join('');
      if (shown >= glyphs.length) finish();
    }, 1000 / cps);
  }

  return {
    skip: finish,
    cancel: () => window.clearInterval(timer),
    get done() {
      return finished;
    },
  };
}
