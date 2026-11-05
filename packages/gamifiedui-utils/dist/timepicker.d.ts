export type TimeMode = 'single' | 'range';
/** Times are 24-hour "HH:MM" strings everywhere in the API. */
export interface TimeRange {
    start: string;
    end: string;
    /** Length in minutes; an overnight range counts through midnight. */
    minutes: number;
    /** The end is on the next day (end is earlier than start). */
    isOvernight: boolean;
}
export interface TimeListLabels {
    /** Single mode heading; range mode uses pickStart / pickEnd. */
    title?: string;
    pickStart?: string;
    pickEnd?: string;
    /** Accessible name of the list. */
    list?: string;
    /** Visible tag on an end time that falls on the next day. */
    nextDay?: string;
    /** Spoken and shown with the next-day tag. */
    nextDayLong?: string;
    duration?: (minutes: number) => string;
}
export interface TimeListOptions {
    mode?: TimeMode;
    /** Minutes between options. */
    step?: number;
    min?: string;
    max?: string;
    value?: string | null;
    range?: {
        start: string;
        end?: string | null;
    } | null;
    isDisabled?: (time: string) => boolean;
    /** Let a range end earlier than it starts, meaning the next day (night shifts, raids). */
    allowOvernight?: boolean;
    /** Option text; defaults to "HH:MM". */
    format?: (time: string) => string;
    labels?: TimeListLabels;
    onSelect?: (time: string) => void;
    onRangeSelect?: (range: TimeRange) => void;
}
export interface TimeListHandle {
    readonly value: string | null;
    readonly range: {
        start: string;
        end: string | null;
    } | null;
    setValue(time: string | null): void;
    setRange(range: {
        start: string;
        end?: string | null;
    } | null): void;
    /** Swaps the text, e.g. after a language change. */
    setLabels(labels: TimeListLabels): void;
    /** Moves focus to the selected option, or the one nearest the current time. */
    focus(): void;
    destroy(): void;
}
/** 570 -> "09:30". */
export declare function formatTime(minutes: number): string;
/** "9:30", "0930", "9:30 pm" -> minutes after midnight; null when it is not a time. */
export declare function parseTime(text: string): number | null;
/** Builds a range, counting through midnight when end is earlier than start. */
export declare function timeRange(start: string, end: string): TimeRange;
/**
 * Renders a gx-time list of times in steps (a listbox). Keys: Up / Down, PageUp / PageDown (an
 * hour), Home / End, Enter or Space to pick, and typing digits jumps to a time. In range mode the
 * first pick is the start and the second the end; hovering or moving shows a preview.
 */
export declare function timeList(root: HTMLElement, options?: TimeListOptions): TimeListHandle;
export interface TimePickerOptions extends Omit<TimeListOptions, 'onSelect' | 'onRangeSelect'> {
    /** Range mode: a second field for the end time. Without it both times share the first field. */
    endInput?: HTMLInputElement;
    /** Joins a range in a single field. */
    separator?: string;
    onChange?: (value: string | TimeRange) => void;
}
export interface TimePickerHandle {
    readonly list: TimeListHandle;
    open(): void;
    close(): void;
    destroy(): void;
}
/**
 * Text field + toggle + [popover] panel holding a gx-time list. Typing a time ("9:30", "21:00",
 * "9:30 pm") updates the list; picking fills the field with "HH:MM", fires "input", closes the
 * panel and returns focus to the toggle.
 */
export declare function timePicker(input: HTMLInputElement, toggle: HTMLButtonElement, panel: HTMLElement, options?: TimePickerOptions): TimePickerHandle;
