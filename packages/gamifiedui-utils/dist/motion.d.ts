/** True when the OS asks for less motion or an ancestor sets data-gx-motion="reduce". */
export declare function prefersReducedMotion(el?: Element): boolean;
/** Restarts a one-shot CSS animation keyed on an attribute (data-bump, data-ready, ...). */
export declare function replay(el: HTMLElement, attribute: string): void;
