export type CalendarMode = 'single' | 'range';
export interface DateRange {
    start: Date;
    end: Date | null;
}
export interface CalendarOptions {
    mode?: CalendarMode;
    value?: Date | null;
    range?: DateRange | null;
    /** Month to show first; defaults to the value, the range start or today. */
    month?: Date;
    min?: Date;
    max?: Date;
    isDisabled?: (date: Date) => boolean;
    /** BCP 47 tag for month and weekday names; defaults to <html lang>. */
    locale?: string;
    /** 0 = Sunday ... 6 = Saturday; defaults to the locale's week start. */
    firstDay?: number;
    /** Runs for every day button after it is drawn: add data-event, data-claimed, gx-rarity-*. */
    decorate?: (day: HTMLButtonElement, date: Date) => void;
    labels?: {
        previous?: string;
        next?: string;
    };
    onSelect?: (date: Date) => void;
    onRangeSelect?: (range: {
        start: Date;
        end: Date;
    }) => void;
}
export interface CalendarHandle {
    readonly value: Date | null;
    readonly range: DateRange | null;
    setValue(date: Date | null): void;
    setRange(range: DateRange | null): void;
    setMonth(date: Date): void;
    setLocale(locale: string): void;
    /** Redraws, re-running decorate (after your own data changes). */
    refresh(): void;
    /** Moves focus to the active day. */
    focus(): void;
    destroy(): void;
}
/** Local calendar date as YYYY-MM-DD (no UTC shift). */
export declare function toISODate(date: Date): string;
/** Parses YYYY-MM-DD as a local date; null for anything else or an impossible date. */
export declare function parseISODate(text: string): Date | null;
/** Renders an accessible month grid into root (a .gx-calendar) with full keyboard support. */
export declare function calendar(root: HTMLElement, options?: CalendarOptions): CalendarHandle;
export interface DatePickerOptions extends Omit<CalendarOptions, 'onSelect' | 'onRangeSelect'> {
    /** Range mode: a second field for the end date. Without it both dates share the first field. */
    endInput?: HTMLInputElement;
    format?: (date: Date) => string;
    parse?: (text: string) => Date | null;
    /** Joins a range in a single field. */
    separator?: string;
    onChange?: (value: Date | {
        start: Date;
        end: Date;
    }) => void;
}
export interface DatePickerHandle {
    readonly calendar: CalendarHandle;
    open(): void;
    close(): void;
    destroy(): void;
}
/**
 * Text field + toggle + [popover] panel. Typing a date updates the calendar; picking one fills
 * the field (YYYY-MM-DD by default), fires "input", closes the panel and returns focus.
 */
export declare function datePicker(input: HTMLInputElement, toggle: HTMLButtonElement, panel: HTMLElement, options?: DatePickerOptions): DatePickerHandle;
