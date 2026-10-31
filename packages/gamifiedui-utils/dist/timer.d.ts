export type TimerMode = 'down' | 'up';
export type TimerState = 'idle' | 'running' | 'warning' | 'critical' | 'done';
export interface TimerOptions {
    /** 'down' counts from seconds to 0; 'up' is a stopwatch that stops at seconds (0 = never). */
    mode?: TimerMode;
    /** Countdown seconds left at which data-state becomes "warning" / "critical". */
    warnAt?: number;
    criticalAt?: number;
    tickMs?: number;
    autoStart?: boolean;
    format?: (seconds: number) => string;
    onTick?: (seconds: number) => void;
    onStateChange?: (state: TimerState) => void;
    onDone?: () => void;
}
export interface TimerHandle {
    start(): void;
    pause(): void;
    reset(seconds?: number): void;
    readonly seconds: number;
    readonly running: boolean;
    destroy(): void;
}
/** 90 -> "01:30", 3725 -> "1:02:05". */
export declare function formatDuration(seconds: number): string;
/**
 * Drives a .gx-timer: the .gx-timer-value text (and datetime on <time>), --gx-value and
 * data-state. Uses elapsed wall time, so a throttled background tab does not drift.
 */
export declare function timer(root: HTMLElement, seconds: number, options?: TimerOptions): TimerHandle;
