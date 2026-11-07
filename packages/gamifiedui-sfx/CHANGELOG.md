# Changelog

## Unreleased

- Music themes take optional `leadWave` and `bassWave` (balanced per wave), a `drums` score
  (`k`, `s`, `h`) and `isLoop: false` for one-shot fanfares.
- Switching themes now fades the old one out (`fade`, 0.4 s by default; 0 cuts as before).
- `Music` gains a `volume` property, and scores accept flats such as `Bb2`.
- Noise tones take a `filter` (`lowpass`, `bandpass` or `highpass`), and `play()` takes a
  `delay` in seconds.
- The README documents `createMusic()`.

## 0.3.0

- New built-in sounds: `gift` (paper rustle and pop), `flip` (a card turning over),
  `heartUp` (a rising sparkle for affection) and `heartFade` (a soft falling letdown).

## 0.2.0

- `createMusic()`: looped chiptune background music from tiny text scores (`lead`, optional
  `bass`, hat and kick), with `define`, `play(name | null)` and `muted`.
- `createVoice()`: character lines via speech synthesis (pitched per character) with chiptune
  talk-blip fallback; `say`, `blips`, `cancel` and `muted`.
- New built-in sound `success`.

## 0.1.0

- First release. `createSfx()` with `play`, `define`, `volume`, `muted` and `bind`.
- 22 procedural chiptune sounds in four groups: interface, items, movement and combat, and progress.
- Declarative `data-gx-sfx` (click) and `data-gx-sfx-hover` (pointer enter) attributes.
- Optional `storageKey` to remember volume and mute between visits.
