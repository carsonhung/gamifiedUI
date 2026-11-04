export interface HoldButtonOptions {
    onPress: () => void;
    onRelease?: () => void;
    /** Keys that hold the button while it has focus; pass [] when the game reads keys itself. */
    keys?: readonly string[];
}
export interface HoldButtonHandle {
    isHeld(): boolean;
    destroy(): void;
}
/**
 * Turns a button into a press-and-hold control for mini-games (pour, charge, heat). The pointer
 * is captured, so a thumb that slides off mid-hold keeps holding until it lifts; the long-press
 * menu and the click that would follow are cancelled; and data-pressed keeps the button sunk
 * while held. Add the gx-btn-hold class for the touch styles; this helper adds it too.
 */
export declare function holdButton(button: HTMLElement, options: HoldButtonOptions): HoldButtonHandle;
