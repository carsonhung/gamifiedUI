export type ToastTone = 'info' | 'success' | 'warning' | 'danger' | 'achievement';
export interface ToastOptions {
    title: string;
    body?: string;
    tone?: ToastTone;
    /** Short decorative glyph shown in the icon box. */
    icon?: string;
    /** Auto-dismiss delay in ms; 0 keeps it until closed. Paused while hovered or focused. */
    duration?: number;
    /** Oldest toasts are removed past this count. */
    limit?: number;
    dismissLabel?: string;
    /** Defaults to the first .gx-toast-stack, created on <body> when missing. */
    stack?: HTMLElement;
}
export interface ToastHandle {
    element: HTMLElement;
    dismiss(): void;
}
/** Shows a gx-toast. Errors use role="alert", everything else role="status". */
export declare function toast(options: ToastOptions): ToastHandle;
