/** New scroll offsets that keep the content point under `pointer` (viewport coords) fixed when zoom changes. */
export function zoomAround(scroll, pointer, before, after) {
    const scale = after / before;
    return {
        left: (scroll.left + pointer.left) * scale - pointer.left,
        top: (scroll.top + pointer.top) * scale - pointer.top,
    };
}
/** The largest zoom step at which `contentWidth` fits in `viewportWidth`, kept within min and max. */
export function fitWidthZoom(viewportWidth, contentWidth, range) {
    if (contentWidth <= 0 || viewportWidth <= 0)
        return range.min;
    // Floor, not round: rounding up would bring back the sideways scrollbar the fit is meant to remove.
    const fit = Math.floor(viewportWidth / contentWidth / range.step + 1e-9) * range.step;
    return Math.min(range.max, Math.max(range.min, fit));
}
/**
 * Sizes each .gx-map-plate to the widest .gx-map-name / .gx-map-status text in its .gx-map-place,
 * centred on that text. Call it after the svg is in the document (text has no width before
 * layout) and again when the labels change, such as after switching language.
 */
export function fitMapPlates(root, padding = 12) {
    for (const place of root.querySelectorAll('.gx-map-place')) {
        const plate = place.querySelector('.gx-map-plate');
        const texts = Array.from(place.querySelectorAll('.gx-map-name, .gx-map-status'));
        if (!plate || texts.length === 0)
            continue;
        const width = Math.max(...texts.map((text) => text.getComputedTextLength())) + padding;
        const x = Number(texts[0].getAttribute('x'));
        plate.setAttribute('x', String(x - width / 2));
        plate.setAttribute('width', String(width));
    }
}
/**
 * Zoom for a .gx-map-viewport holding one <svg viewBox>. The svg is resized from its viewBox
 * (so it stays crisp) and the viewport's scrollbars pan; the mouse wheel zooms around the cursor.
 */
export function mapZoom(viewport, options = {}) {
    const min = options.min ?? 0.5;
    const max = options.max ?? 2;
    const step = options.step ?? 0.25;
    const wheel = options.wheel ?? 'always';
    const controls = options.controls ?? viewport.parentElement ?? viewport;
    const svg = viewport.querySelector('svg');
    if (!svg)
        throw new Error('[gamifiedui] mapZoom needs an <svg> inside the viewport');
    const clamp = (value) => Math.min(max, Math.max(min, Math.round(value / step) * step));
    const resolveInitial = () => options.initial === 'fit-width'
        ? fitWidthZoom(viewport.clientWidth, svg.viewBox.baseVal.width, { min, max, step })
        : clamp(options.initial ?? 1);
    const buttons = (kind) => Array.from(controls.querySelectorAll(`[data-gx-map-zoom="${kind}"]`));
    const readout = controls.querySelector('[data-gx-map-readout]');
    let initial = resolveInitial();
    let zoom = initial;
    const render = () => {
        const box = svg.viewBox.baseVal;
        svg.setAttribute('width', String(box.width * zoom));
        svg.setAttribute('height', String(box.height * zoom));
        buttons('in').forEach((b) => (b.disabled = zoom >= max));
        buttons('out').forEach((b) => (b.disabled = zoom <= min));
        buttons('reset').forEach((b) => (b.disabled = zoom === initial));
        if (readout)
            readout.textContent = `${Math.round(zoom * 100)}%`;
    };
    const set = (next, pointer) => {
        const before = zoom;
        zoom = clamp(next);
        if (zoom === before)
            return;
        const anchor = pointer ?? { left: viewport.clientWidth / 2, top: viewport.clientHeight / 2 };
        render();
        const scroll = zoomAround({ left: viewport.scrollLeft, top: viewport.scrollTop }, anchor, before, zoom);
        viewport.scrollLeft = scroll.left;
        viewport.scrollTop = scroll.top;
        options.onChange?.(zoom);
    };
    const reset = () => {
        initial = resolveInitial();
        set(initial);
        render();
    };
    const onWheel = (e) => {
        if (wheel === 'modifier' && !e.ctrlKey && !e.metaKey)
            return;
        e.preventDefault();
        const rect = viewport.getBoundingClientRect();
        set(zoom + (e.deltaY < 0 ? step : -step), { left: e.clientX - rect.left, top: e.clientY - rect.top });
    };
    const onClick = (e) => {
        const kind = e.target.closest('[data-gx-map-zoom]')?.dataset.gxMapZoom;
        if (kind === 'in')
            set(zoom + step);
        else if (kind === 'out')
            set(zoom - step);
        else if (kind === 'reset')
            reset();
    };
    if (wheel !== 'never')
        viewport.addEventListener('wheel', onWheel, { passive: false });
    controls.addEventListener('click', onClick);
    render();
    return {
        get zoom() {
            return zoom;
        },
        get initial() {
            return initial;
        },
        set: (next) => set(next),
        zoomIn: () => set(zoom + step),
        zoomOut: () => set(zoom - step),
        reset,
        destroy() {
            viewport.removeEventListener('wheel', onWheel);
            controls.removeEventListener('click', onClick);
        },
    };
}
