export interface RollOptions {
    from?: number;
    duration?: number;
    /** Whole-number steps, not every frame, to match the stepped look. */
    steps?: number;
    format?: (value: number) => string;
}
/** Rolls the number in el up or down to `to`, then pops the surrounding .gx-counter. */
export declare function rollNumber(el: HTMLElement, to: number, options?: RollOptions): Promise<void>;
