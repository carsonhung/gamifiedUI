export interface MapZoomOptions {
    min?: number;
    max?: number;
    step?: number;
    /**
     * Starting zoom, and what reset() returns to. 'fit-width' picks the largest step that shows the
     * whole map width without a sideways scrollbar, measured when mapZoom runs and on reset().
     */
    initial?: number | 'fit-width';
    /**
     * When the mouse wheel zooms. 'always' (default) captures every wheel turn over the map;
     * 'modifier' zooms only with Ctrl or ⌘ held, so a plain wheel keeps scrolling the page past a
     * map that sits inside a long screen; 'never' leaves zooming to the buttons and pinch.
     */
    wheel?: 'always' | 'modifier' | 'never';
    /** Buttons with data-gx-map-zoom="in" | "out" | "reset" and a [data-gx-map-readout] are looked up here. */
    controls?: ParentNode;
    onChange?: (zoom: number) => void;
}
export interface MapZoomHandle {
    readonly zoom: number;
    /** The resolved starting zoom, so callers can tell a fitted view from one the player zoomed. */
    readonly initial: number;
    set(zoom: number): void;
    zoomIn(): void;
    zoomOut(): void;
    reset(): void;
    destroy(): void;
}
export interface ScrollPoint {
    left: number;
    top: number;
}
/** New scroll offsets that keep the content point under `pointer` (viewport coords) fixed when zoom changes. */
export declare function zoomAround(scroll: ScrollPoint, pointer: ScrollPoint, before: number, after: number): ScrollPoint;
/** The largest zoom step at which `contentWidth` fits in `viewportWidth`, kept within min and max. */
export declare function fitWidthZoom(viewportWidth: number, contentWidth: number, range: {
    min: number;
    max: number;
    step: number;
}): number;
/**
 * Sizes each .gx-map-plate to the widest .gx-map-name / .gx-map-status text in its .gx-map-place,
 * centred on that text. Call it after the svg is in the document (text has no width before
 * layout) and again when the labels change, such as after switching language.
 */
export declare function fitMapPlates(root: ParentNode, padding?: number): void;
/**
 * Zoom for a .gx-map-viewport holding one <svg viewBox>. The svg is resized from its viewBox
 * (so it stays crisp) and the viewport's scrollbars pan; the mouse wheel zooms around the cursor.
 */
export declare function mapZoom(viewport: HTMLElement, options?: MapZoomOptions): MapZoomHandle;
