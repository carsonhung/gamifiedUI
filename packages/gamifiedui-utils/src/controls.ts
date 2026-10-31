export interface TabsHandle {
  select(index: number, focus?: boolean): void;
  destroy(): void;
}

/** ARIA tabs: click, Left/Right/Home/End, roving tabindex, panels via aria-controls. */
export function tabs(tablist: HTMLElement): TabsHandle {
  const items = Array.from(tablist.querySelectorAll<HTMLElement>('[role="tab"]'));

  const select = (index: number, focus = true): void => {
    items.forEach((tab, i) => {
      const isSelected = i === index;
      tab.setAttribute('aria-selected', String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
      if (panel) panel.hidden = !isSelected;
    });
    if (focus) items[index]?.focus();
  };

  const onClick = (e: Event): void => {
    const index = items.indexOf((e.target as Element).closest('[role="tab"]') as HTMLElement);
    if (index >= 0) select(index);
  };
  const onKey = (e: KeyboardEvent): void => {
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (current < 0) return;
    const last = items.length - 1;
    const next =
      e.key === 'ArrowRight' ? (current + 1) % items.length
      : e.key === 'ArrowLeft' ? (current - 1 + items.length) % items.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : -1;
    if (next < 0) return;
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
export function sliderFill(root: ParentNode = document): () => void {
  const sliders = Array.from(root.querySelectorAll<HTMLInputElement>('input.gx-slider'));
  const sync = (slider: HTMLInputElement): void => {
    const min = Number(slider.min || 0);
    const max = Number(slider.max || 100);
    slider.style.setProperty('--gx-value', ((Number(slider.value) - min) / (max - min)).toFixed(3));
  };
  const onInput = (e: Event): void => sync(e.target as HTMLInputElement);
  sliders.forEach((slider) => {
    sync(slider);
    slider.addEventListener('input', onInput);
  });
  return () => sliders.forEach((slider) => slider.removeEventListener('input', onInput));
}

/** Wires a .gx-video-play overlay: hides native controls until the user starts playback. */
export function videoPlayOverlay(video: HTMLVideoElement, button: HTMLButtonElement): void {
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
