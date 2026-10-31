---
name: theme-authoring
description: Add or edit a gamifiedUI era theme (e.g. NES, SNES, Game Boy, arcade, parchment, cyberpunk) as a data-gx-theme token set with contrast checks. Use when the user wants a new colour scheme or retro console look.
---

# Theme authoring

## 1. Pick a palette

- Use the real console or genre palette as reference (Game Boy: 4 greens; NES: 54-colour
  hardware palette; parchment: browns and reds).
- Map it onto every token in `tokens.css`'s `@theme` block: `ink`, `surface`, `on-surface`,
  `accent`, `focus`, each tone with its `on-` partner, and `hp` / `mp` / `xp`.
  A partial theme leaks arcade colours.

## 2. Write it

Add a `[data-gx-theme="<name>"] { ... }` block to `packages/gamifiedui-css/src/themes.css`
inside `@layer base`. Raw hex is allowed only there and in `tokens.css`.

## 3. Check contrast

- Text pairs need 4.5:1: `on-surface` on `surface`, each `on-<tone>` on `<tone>`, `accent` on
  `surface` (titles). Focus ring (`focus`) needs 3:1 against both `surface` and the page.
- HP / MP / XP must differ from each other by more than hue for colour-blind users (lightness
  or the bar's text label).

## 4. Show it

- Add a theme button to the demo header (`data-theme-option="<name>"`).
- Check every demo section in the new theme, plus nested themes (`data-gx-theme` on a panel).
- CHANGELOG bullet and README theme list.
