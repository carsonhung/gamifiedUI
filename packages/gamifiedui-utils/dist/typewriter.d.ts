/** Splits into user-perceived characters, so emoji and CJK never break mid-glyph. */
export declare function graphemes(text: string, locale?: string): string[];
/** Reader-facing text speed presets, as multipliers of the default rate. */
export declare const TEXT_SPEEDS: {
    readonly slow: 0.5;
    readonly normal: 1;
    readonly fast: 2;
    readonly instant: number;
};
export type TextSpeed = keyof typeof TEXT_SPEEDS;
/** Pause before "Auto" advances a finished line: long enough to read it, capped for long lines. */
export declare function autoAdvanceMs(text: string, locale?: string): number;
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
export declare function typewriter(el: HTMLElement, text: string, options?: TypewriterOptions): TypewriterHandle;
