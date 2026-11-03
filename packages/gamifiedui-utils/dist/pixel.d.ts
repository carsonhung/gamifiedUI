/**
 * Pixel-sprite kit: paint a grid from shapes or text rows, auto-outline it, render it as an SVG
 * of merged pixel runs. Colours are hex strings, or short keys looked up in a palette you pass.
 */
export type PixelGrid<C extends string = string> = (C | null)[][];
export type Palette = Readonly<Record<string, string>>;
export interface Painter<C extends string = string> {
    grid: PixelGrid<C>;
    width: number;
    height: number;
    px(x: number, y: number, c: C): void;
    rect(x: number, y: number, w: number, h: number, c: C): void;
    disc(cx: number, cy: number, r: number, c: C): void;
    ring(cx: number, cy: number, rx: number, ry: number, c: C): void;
    /** Paints only over pixels already filled, e.g. a headband that follows the head. */
    over(x: number, y: number, w: number, h: number, c: C): void;
    /** Text rows, one character per pixel; `.` and spaces are empty. Characters are colour keys. */
    rows(lines: readonly string[], x?: number, y?: number): void;
    /** Rings every filled shape with a one-pixel outline. */
    outline(c: C): void;
}
export declare function painter<C extends string = string>(width?: number, height?: number): Painter<C>;
/** A grid as an SVG string; one rect per same-colour run keeps the markup small. */
export declare function gridSvg(grid: PixelGrid, label?: string, palette?: Palette): string;
/** Mirror a grid left to right, for sprites facing the other way. */
export declare function mirrorGrid<C extends string>(grid: PixelGrid<C>): PixelGrid<C>;
