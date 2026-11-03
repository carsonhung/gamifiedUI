/**
 * A captcha-free spam guard for forms: a hidden honeypot field people never fill, plus a minimum
 * fill time, since bots post at once. Pair it with a question only a real player can answer.
 */
export interface SpamGuardOptions {
    /** Name of the honeypot input; something bots love to fill, like `website`. */
    honeypot?: string;
    /** People take at least this long to read and fill the form. */
    minFillMs?: number;
}
export interface SpamGuardHandle {
    /** True when the honeypot is filled or the form came back too fast. */
    isSuspicious(): boolean;
    /** Restarts the fill timer, e.g. when the form is shown again. */
    reset(): void;
    destroy(): void;
}
export declare function spamGuard(form: HTMLFormElement, { honeypot, minFillMs }?: SpamGuardOptions): SpamGuardHandle;
