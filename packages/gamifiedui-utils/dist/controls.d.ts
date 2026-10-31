export interface TabsHandle {
    select(index: number, focus?: boolean): void;
    destroy(): void;
}
/** ARIA tabs: click, Left/Right/Home/End, roving tabindex, panels via aria-controls. */
export declare function tabs(tablist: HTMLElement): TabsHandle;
/** Keeps --gx-value in sync on every input.gx-slider under root (WebKit has no fill pseudo). */
export declare function sliderFill(root?: ParentNode): () => void;
/** Wires a .gx-video-play overlay: hides native controls until the user starts playback. */
export declare function videoPlayOverlay(video: HTMLVideoElement, button: HTMLButtonElement): void;
