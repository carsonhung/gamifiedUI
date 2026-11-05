export interface GridNavOptions {
    /** Cells to move between, relative to the root. Defaults to slots and cards, direct or in `<li>`. */
    selector?: string;
    /** Called after the cursor moves, e.g. to play a hover sound. */
    onMove?: (cell: HTMLElement, index: number) => void;
}
export interface GridNavHandle {
    /** Moves the cursor (and its single tab stop) to a cell. */
    focus(index: number): void;
    /** Re-reads the cells after adding or removing some. */
    refresh(): void;
    destroy(): void;
}
/**
 * Arrow-key cursor over a gx-inventory or gx-card-grid: one tab stop, arrows move by cell or
 * row, Home/End go to the row's ends, Ctrl+Home/End to the first and last cell.
 */
export declare function gridNav(root: HTMLElement, { selector, onMove }?: GridNavOptions): GridNavHandle;
