export type ConfirmTone = 'primary' | 'danger' | 'success' | 'warning';
export interface ConfirmOptions {
    message: string;
    /** Heading above the message; also names the dialog for screen readers. */
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: ConfirmTone;
    /** Shown above the message in a gx-dialog-scene, e.g. a portrait beside a gx-textbox. */
    scene?: Node;
    /** Extra classes on the <dialog>, for per-game tweaks. */
    className?: string;
}
/**
 * Asks a yes/no question in a gx-dialog instead of window.confirm, which embeds such as
 * itch.io iframes can block. Resolves true only for the confirm button; Escape, the cancel
 * button and closing the dialog any other way resolve false. Cancel has focus first, so a
 * stray Enter never confirms something destructive.
 */
export declare function confirmDialog(options: ConfirmOptions): Promise<boolean>;
