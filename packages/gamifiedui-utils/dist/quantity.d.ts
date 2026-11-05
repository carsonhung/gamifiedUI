export interface QuantityOptions {
    /** Steps per PageUp / PageDown on the field. */
    pageSteps?: number;
    onChange?: (value: number) => void;
}
export interface QuantityHandle {
    readonly value: number;
    /** Clamps to min / max and snaps to step, like a press would. */
    set(value: number): void;
    destroy(): void;
}
/**
 * Wires a gx-quantity: − / + buttons (any [data-step], e.g. "-1", "1", "10") with press-and-hold
 * repeat, Home / End and PageUp / PageDown on the field, clamping to the input's min, max and
 * step, and a data-bump pop. Buttons at a limit get aria-disabled so focus stays on them.
 */
export declare function quantity(root: HTMLElement, options?: QuantityOptions): QuantityHandle;
