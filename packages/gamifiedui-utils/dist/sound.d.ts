/** Anything with a mute switch and a 0..1 volume, such as createSfx() and createMusic() from gamifiedui-sfx. */
export interface SoundTarget {
    muted: boolean;
    volume: number;
}
export interface SoundControlOptions {
    onChange?: (state: {
        muted: boolean;
        volume: number;
    }) => void;
}
export interface SoundControlHandle {
    /** Redraws from the first target, e.g. after the game changed the volume itself. */
    sync(): void;
    destroy(): void;
}
/**
 * Wires a gx-sound group to one or more targets. The first target is the source of truth (give it
 * the storageKey), and the others are brought in line with it at once. Moving the slider unmutes.
 */
export declare function soundControl(root: HTMLElement, targets: readonly SoundTarget[], { onChange }?: SoundControlOptions): SoundControlHandle;
