import { createSfx, SOUNDS } from 'gamifiedui-sfx';
import { byId } from './core';

export function setupSound(): void {
  const sfx = createSfx({ volume: 0.4, storageKey: 'gx-demo-sfx' });
  sfx.bind();

  const board = byId('sfx-board');
  for (const name of Object.keys(SOUNDS)) {
    const button = document.createElement('button');
    button.className = 'gx-btn gx-btn-ghost gx-btn-sm';
    button.dataset.gxSfx = name;
    button.textContent = name;
    board.append(button);
  }

  const toggle = byId<HTMLButtonElement>('sound-toggle');
  const sync = (): void => toggle.setAttribute('aria-pressed', String(!sfx.muted));
  toggle.addEventListener('click', () => {
    sfx.muted = !sfx.muted;
    sync();
    sfx.play('select');
  });
  sync();

  const slider = byId<HTMLInputElement>('sfx-volume');
  slider.value = String(Math.round(sfx.volume * 100));
  slider.style.setProperty('--gx-value', String(sfx.volume));
  slider.addEventListener('input', () => {
    sfx.volume = Number(slider.value) / 100;
    slider.style.setProperty('--gx-value', String(sfx.volume));
  });
  slider.addEventListener('change', () => sfx.play('blip'));
}
