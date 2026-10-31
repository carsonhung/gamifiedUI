import { prefersReducedMotion } from './motion.js';
const LATIN_CPS = 40;
/** CJK glyphs carry a word each, so they type slower to stay readable. */
const CJK_CPS = 16;
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
/** Splits into user-perceived characters, so emoji and CJK never break mid-glyph. */
export function graphemes(text, locale) {
    if ('Segmenter' in Intl) {
        const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });
        return Array.from(segmenter.segment(text), (s) => s.segment);
    }
    return Array.from(text);
}
/** Types text into el. Put the full line in a separate aria-live element; mark el aria-hidden. */
export function typewriter(el, text, options = {}) {
    const glyphs = graphemes(text, options.locale);
    const cps = options.charsPerSecond ?? (CJK.test(text) ? CJK_CPS : LATIN_CPS);
    let shown = 0;
    let timer;
    let finished = false;
    const finish = () => {
        window.clearInterval(timer);
        el.textContent = text;
        shown = glyphs.length;
        if (!finished) {
            finished = true;
            options.onDone?.();
        }
    };
    if (prefersReducedMotion(el) || glyphs.length === 0) {
        finish();
    }
    else {
        el.textContent = '';
        timer = window.setInterval(() => {
            shown++;
            el.textContent = glyphs.slice(0, shown).join('');
            if (shown >= glyphs.length)
                finish();
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
