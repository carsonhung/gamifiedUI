/** ARIA tabs: click, Left/Right/Home/End, roving tabindex, panels via aria-controls. */
export function tabs(tablist) {
    const items = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const select = (index, focus = true) => {
        items.forEach((tab, i) => {
            const isSelected = i === index;
            tab.setAttribute('aria-selected', String(isSelected));
            tab.tabIndex = isSelected ? 0 : -1;
            const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
            if (panel)
                panel.hidden = !isSelected;
        });
        if (focus)
            items[index]?.focus();
    };
    const onClick = (e) => {
        const index = items.indexOf(e.target.closest('[role="tab"]'));
        if (index >= 0)
            select(index);
    };
    const onKey = (e) => {
        const current = items.indexOf(document.activeElement);
        if (current < 0)
            return;
        const last = items.length - 1;
        const next = e.key === 'ArrowRight' ? (current + 1) % items.length
            : e.key === 'ArrowLeft' ? (current - 1 + items.length) % items.length
                : e.key === 'Home' ? 0
                    : e.key === 'End' ? last
                        : -1;
        if (next < 0)
            return;
        e.preventDefault();
        select(next);
    };
    tablist.addEventListener('click', onClick);
    tablist.addEventListener('keydown', onKey);
    const initial = items.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    select(Math.max(0, initial), false);
    return {
        select,
        destroy() {
            tablist.removeEventListener('click', onClick);
            tablist.removeEventListener('keydown', onKey);
        },
    };
}
/** Keeps --gx-value in sync on every input.gx-slider under root (WebKit has no fill pseudo). */
export function sliderFill(root = document) {
    const sliders = Array.from(root.querySelectorAll('input.gx-slider'));
    const sync = (slider) => {
        const min = Number(slider.min || 0);
        const max = Number(slider.max || 100);
        slider.style.setProperty('--gx-value', ((Number(slider.value) - min) / (max - min)).toFixed(3));
    };
    const onInput = (e) => sync(e.target);
    sliders.forEach((slider) => {
        sync(slider);
        slider.addEventListener('input', onInput);
    });
    return () => sliders.forEach((slider) => slider.removeEventListener('input', onInput));
}
/** Wires a .gx-video-play overlay: hides native controls until the user starts playback. */
export function videoPlayOverlay(video, button) {
    video.controls = false;
    button.addEventListener('click', () => {
        video.controls = true;
        void video.play();
    });
    video.addEventListener('play', () => {
        button.hidden = true;
    });
    video.addEventListener('ended', () => {
        button.hidden = false;
        video.controls = false;
        video.currentTime = 0;
    });
}
