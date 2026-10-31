# gamifiedUI

**Game-style 2D / 2.5D UI for Tailwind CSS v4. Free and open source.**

Turn everyday components into game parts: buttons that press into the page, RPG panels with
pixel frames, HP / MP / XP bars that drain in steps, dialogue boxes, sprite animation and
isometric scenes. CSS only, so it works with Vue, React, Svelte or plain HTML.

## Quick start

```bash
npm i gamifiedui-css tailwindcss @tailwindcss/vite
```

```css
@import "tailwindcss";
@import "gamifiedui-css";
```

```html
<button class="gx-btn gx-btn-danger">Quit</button>

<div class="gx-bar gx-bar-hp" role="meter" aria-label="HP"
     aria-valuemin="0" aria-valuemax="100" aria-valuenow="64" style="--gx-value: 0.64"></div>
```

See the [package README](packages/gamifiedui-css/README.md) for every component and utility.

## Principles

- **Plain HTML first.** Real `<button>`s and native `<dialog>`s; state comes from `aria-*` and
  `data-*` attributes, so no JavaScript is required.
- **Game feel without jank.** Only `translate`, `scale` and `opacity` animate, in `steps()`.
- **Reduced motion built in.** `prefers-reduced-motion` or `data-gx-motion="reduce"` stops
  every animation.
- **Themeable.** Era themes via `data-gx-theme` (`gameboy`, `parchment`), all from tokens.

## Packages

| Package | Status |
|---|---|
| [`gamifiedui-css`](packages/gamifiedui-css) | 0.1.0: tokens, themes, button, panel, bar, badge, dialog, textbox, sprite and iso utilities |
| `gamifiedui-sfx` | Planned: procedural UI sounds, no audio files |
| `gamifiedui-utils` | Planned: whole-number zoom, sprite frame style, label fit |
| `gamifiedui-vue`, `gamifiedui-react` | Planned: typewriter dialogue and other behaviour |

## Development

```bash
npm install
npm test        # compile the package through Tailwind and check the motion/theming rules
npm run demo    # playground at http://localhost:5173
npm run build   # build the demo
```

## License

[Apache License 2.0](LICENSE). Free for commercial use, with an explicit patent grant. See
[NOTICE](NOTICE).
