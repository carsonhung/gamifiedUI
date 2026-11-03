# Changelog

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
