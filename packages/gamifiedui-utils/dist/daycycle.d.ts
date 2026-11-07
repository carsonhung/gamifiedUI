export type DayPart = 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
export type DayWeather = 'clear' | 'cloudy' | 'rain' | 'storm';
/**
 * Where the wheel of a gx-daycycle stands in each part of the day, in degrees from noon: the sun
 * climbs from the east, sinks west and is just above the hills in the evening; at night the moon
 * is up. 90 would put the sun on the horizon.
 */
export declare const DAY_PART_ANGLES: Readonly<Record<DayPart, number>>;
export interface DayCycleOptions {
    /** Days since the start, from 0. Each one adds a full turn, so the wheel never runs back. */
    day: number;
    part: DayPart;
    /** Clear when left out. Clouds need a gx-daycycle-clouds part, which is added if missing. */
    weather?: DayWeather;
    /** Spoken label for the role="img" window, e.g. "Day 3, afternoon, rain". */
    label?: string;
}
/** Sets a gx-daycycle to a day, part and weather; the wheel turns forward from wherever it was. */
export declare function dayCycle(el: HTMLElement, { day, part, weather, label }: DayCycleOptions): void;
