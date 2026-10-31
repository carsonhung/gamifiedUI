export type FileRejection = 'type' | 'size' | 'count';
export interface DropzoneOptions {
    /** Defaults to the zone's own input[type=file]. */
    input?: HTMLInputElement;
    /** Same syntax as the input's accept attribute; defaults to it. */
    accept?: string;
    /** Bytes. */
    maxSize?: number;
    /** Defaults to the input's multiple attribute. */
    multiple?: boolean;
    onFiles: (files: File[]) => void;
    onReject?: (file: File, reason: FileRejection) => void;
}
export interface DropzoneHandle {
    destroy(): void;
}
/** 1536 -> "1.5 KB". Uses the locale's number format. */
export declare function formatBytes(bytes: number, locale?: string): string;
/** True when the file matches an accept list such as "image/*,.json,application/pdf". */
export declare function matchesAccept(file: File, accept: string): boolean;
/**
 * Adds drag and drop to a .gx-dropzone. data-dragging is set while files hover it and
 * data-invalid briefly after a rejected drop. Files from the picker go through the same checks.
 */
export declare function dropzone(zone: HTMLElement, options: DropzoneOptions): DropzoneHandle;
