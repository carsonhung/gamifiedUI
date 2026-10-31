export interface CooldownOptions {
    /** The sweep moves in this many steps (pixel look). */
    steps?: number;
    tickMs?: number;
    onReady?: () => void;
}
export interface CooldownHandle {
    cancel(): void;
}
/** Puts a .gx-skill on cooldown: aria-disabled, --gx-cooldown sweep, seconds in .gx-skill-timer. */
export declare function cooldown(button: HTMLElement, seconds: number, options?: CooldownOptions): CooldownHandle;
/** True while a skill is cooling down. */
export declare function isCoolingDown(button: HTMLElement): boolean;
