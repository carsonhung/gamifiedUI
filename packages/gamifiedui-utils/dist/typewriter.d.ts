/** Splits into user-perceived characters, so emoji and CJK never break mid-glyph. */
export declare function graphemes(text: string, locale?: string): string[];
export interface TypewriterOptions {
    /** Defaults to 40, or 16 when the text contains CJK. */
    charsPerSecond?: number;
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
