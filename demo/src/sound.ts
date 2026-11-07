import { createMusic, createSfx, SOUNDS } from 'gamifiedui-sfx';
import { soundControl } from 'gamifiedui-utils';
import { byId } from './core';

function defineThemes(music: ReturnType<typeof createMusic>): void {
  music.define('town', {
    bpm: 112,
    lead: 'E5 - G5 - A5 - G5 E5 | D5 - E5 - C5 - - . | E5 - G5 - A5 - C6 A5 | G5 - E5 D5 C5 - - .',
    bass: 'C3 - G2 - C3 - G2 - | F2 - C3 - F2 - C3 - | A2 - E3 - A2 - E3 - | G2 - D3 - C3 - G2 -',
    drums: 'k . h . s . h . | k . h k s . h .',
  });
  music.define('battle', {
    bpm: 150,
    lead: 'A4 C5 E5 A5 G5 E5 C5 E5 | F5 - E5 - D5 - E5 - | A4 C5 E5 A5 Bb5 A5 G5 E5 | F5 E5 D5 C#5 D5 - E5 -',
    bass: 'A2 A2 A3 A2 A2 A2 A3 A2 | F2 F2 F3 F2 G2 G2 G3 G2',
    bassWave: 'sawtooth',
    drums: 'k h s h k k s h',
  });
  music.define('fanfare', { bpm: 140, lead: 'G4 C5 E5 G5 - E5 G5 - | C6 - - - - - . .', bass: 'C3 - - - G2 - - - | C3 - - - - - . .', isLoop: false });
}

export function setupSound(): void {
  const sfx = createSfx({ volume: 0.4, storageKey: 'gx-demo-sfx' });
  const music = createMusic();
  defineThemes(music);
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
  const syncToggle = (): void => toggle.setAttribute('aria-pressed', String(!sfx.muted));
  const control = soundControl(byId('sound-control'), [sfx, music], { onChange: syncToggle });
  toggle.addEventListener('click', () => {
    sfx.muted = !sfx.muted;
    music.muted = sfx.muted;
    syncToggle();
    control.sync();
    sfx.play('select');
  });
  syncToggle();

  const slider = byId<HTMLInputElement>('sfx-volume');
  slider.value = String(Math.round(sfx.volume * 100));
  slider.style.setProperty('--gx-value', String(sfx.volume));
  slider.addEventListener('input', () => {
    sfx.volume = Number(slider.value) / 100;
    slider.style.setProperty('--gx-value', String(sfx.volume));
    control.sync();
  });
  slider.addEventListener('change', () => sfx.play('blip'));

  const themeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-music]'));
  themeButtons.forEach((button) =>
    button.addEventListener('click', () => {
      const name = button.dataset.music || null;
      // Stopping first lets a second click replay the fanfare, which otherwise stays finished.
      music.play(null);
      music.play(name);
      themeButtons.forEach((b) => {
        if (b.dataset.music) b.setAttribute('aria-pressed', String(b.dataset.music === name));
      });
    }),
  );
}
