export type FloatKind = 'damage' | 'heal' | 'xp' | 'crit' | 'plain';
export interface FloatOptions {
    kind?: FloatKind;
    /** Horizontal position in percent of the layer; random 38-62 by default. */
    x?: number;
    /** Vertical start in percent of the layer. */
    y?: number;
}
/** Floating combat text inside a .gx-float-layer. Decorative: announce the value separately. */
export declare function floatText(layer: HTMLElement, text: string, options?: FloatOptions): HTMLElement;
export type BurstKind = 'spark' | 'coin' | 'heart' | 'xp' | 'petal' | 'rarity' | 'confetti';
export interface BurstOptions {
    kind?: BurstKind;
    /** Extra classes per particle, e.g. "gx-i-coin" for an icon shape. Write the full class name
        in your source so Tailwind generates it. */
    className?: string;
    /** Burst origin in percent of the host box. */
    x?: number;
    y?: number;
    count?: number;
    /** Travel distance range in rem. */
    spread?: [number, number];
    /** Every nth particle is large. 0 disables. */
    largeEvery?: number;
}
/** One-shot particle burst inside a positioned host. Skipped entirely under reduced motion. */
export declare function burst(host: HTMLElement, options?: BurstOptions): void;
