# gamifiedui-sfx

Chiptune UI sound effects for [gamifiedUI](https://github.com/carsonhung/gamifiedUI), generated live with the Web Audio API.

- There are no audio files and no dependencies, and it adds a few KB.
- It is a separate, optional package. `gamifiedui-css`, `gamifiedui-icons` and `gamifiedui-utils` do not need it.
- Nothing plays until you call `play()` or bind it to elements.

## Install

```bash
npm i gamifiedui-sfx
```

## Use

```ts
import { createSfx } from 'gamifiedui-sfx';

const sfx = createSfx({ volume: 0.5 });

sfx.play('coin');
sfx.play('blip', { pitch: 1.2, volume: 0.5 });
sfx.play('success', { delay: 0.4 }); // after a short wait, e.g. once a sizzle is over
```

### Declarative sounds

Call `bind()` once. After that, any element with `data-gx-sfx` plays a sound when clicked, and any element with `data-gx-sfx-hover` plays one on pointer enter:

```ts
sfx.bind(); // or sfx.bind(someContainer)
```

```html
<button class="gx-btn" data-gx-sfx="confirm">Start</button>
<button class="gx-btn gx-btn-warning" data-gx-sfx="coin">Shop</button>
<ul class="gx-menu" data-gx-sfx-hover="hover">…</ul>
```

Disabled buttons and elements with `aria-disabled="true"` stay silent. `bind()` returns a function that removes the listeners.

### Volume and mute

```ts
sfx.volume = 0.3;   // 0 to 1
sfx.muted = true;

// Remember the player's choice between visits
const sfx = createSfx({ storageKey: 'my-game-sfx' });
```

Always give players a way to mute. A toggle bound to `sfx.muted` is enough.

## Sounds

There are 27 built-in sounds:

| Group | Sounds |
|---|---|
| Interface | `click`, `hover`, `select`, `confirm`, `cancel`, `success`, `error`, `blip`, `notify` |
| Items | `coin`, `pickup`, `open`, `gift` (unwrap), `flip` (a card turning over) |
| Movement and combat | `jump`, `step`, `hit`, `hurt`, `laser`, `explosion`, `heal` |
| Progress | `powerUp`, `levelUp`, `achievement`, `gameOver` |
| Feelings | `heartUp` (affection rises), `heartFade` (a gentle letdown) |

`SOUNDS` exports their definitions, and `SoundName` is the type of their names.

### Custom sounds

A sound is a list of tones. Each tone has these fields:

| Field | Meaning |
|---|---|
| `wave` | `square`, `triangle`, `sawtooth`, `sine` or `noise`. Defaults to `square`. |
| `freq` | Start frequency in Hz. For noise, it is the filter cutoff. |
| `to` | Optional end frequency, reached by sliding over the tone. |
| `at` | Start time in seconds. Tones can overlap. |
| `dur` | Length in seconds. |
| `gain` | Loudness from 0 to 1. Defaults to 0.2. |
| `filter` | For noise only: `lowpass` (the default), `bandpass` or `highpass`. |

```ts
sfx.define('door', [
  { wave: 'noise', freq: 600, dur: 0.08, gain: 0.4 },
  { wave: 'square', freq: 220, to: 110, at: 0.05, dur: 0.2, gain: 0.15 },
]);
sfx.play('door');

// Or play a one-off spec directly
sfx.play([{ wave: 'triangle', freq: 880, to: 1760, dur: 0.2 }]);
```

## Music

`createMusic()` plays chiptune background music from tiny text scores. There is one token per eighth note:

- a note name such as `C5`, `F#3` or `Bb2` starts a note;
- `-` holds it, `.` rests, and `|` is a bar line for the reader;
- in a drum score, `k` is a kick, `s` a snare and `h` a hi-hat.

```ts
import { createMusic } from 'gamifiedui-sfx';

const music = createMusic({ volume: 0.4 });

music.define('town', {
  bpm: 120,
  lead: 'E5 - G5 - | A5 - - . | G5 E5 D5 - | C5 - - .',
  bass: 'C3 - G2 - | F2 - C3 - | G2 - D3 - | C3 - G2 -',
  drums: 'k . h . s . h .',
});
music.define('fanfare', { bpm: 150, lead: 'C5 E5 G5 C6 - - - .', isLoop: false });

music.play('town'); // safe to call on every render
music.play(null);   // stop
music.muted = true;
```

| Theme field | Meaning |
|---|---|
| `bpm` | Beats per minute; each token is half a beat. |
| `lead` | The melody. Its length sets the loop. |
| `bass` | Optional. Loops on its own if shorter than the lead. |
| `leadWave`, `bassWave` | `square` and `triangle` by default. Each wave is balanced to about the same loudness. |
| `drums` | Optional drum score; loops on its own if shorter than the lead. |
| `hatEvery`, `hasKick` | A simpler beat when there is no drum score: a hat every n tokens, a kick on every beat. |
| `isLoop` | `false` plays the theme once (a fanfare) and then stays quiet. Defaults to `true`. |

Switching themes fades the old one out over `fade` seconds (0.4 by default; `createMusic({ fade: 0 })` cuts). Music pauses while the tab is hidden and starts on the first click or key press.

## Notes

- Browsers only start audio after a user gesture. The first `play()` inside a click or key handler unlocks it, and earlier calls are silently skipped.
- It is safe to import during server-side rendering. `play()` does nothing when `AudioContext` is missing.

## License

[Apache License 2.0](LICENSE).
