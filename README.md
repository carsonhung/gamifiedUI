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

No build step? Link the prebuilt stylesheet instead:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gamifiedui-css@0.1/dist/gamifiedui.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gamifiedui-icons@0.1/src/all.css">
```

See the [package README](packages/gamifiedui-css/README.md) for every component and utility.
The [live demo](https://carsonhung.github.io/gamifiedUI/) shows all of them in English, 繁中 and 简中.

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
| [`gamifiedui-css`](packages/gamifiedui-css) | 0.1.0: tokens, themes, 40+ components, particles, sprite and iso utilities, CDN build |
| [`gamifiedui-icons`](packages/gamifiedui-icons) | 0.1.0: 107 pixel icons on a 16px grid, including emoji and a Hong Kong set, each with an animated version |
| [`gamifiedui-utils`](packages/gamifiedui-utils) | 0.1.0: optional JS for toasts, typewriter, counters, cooldowns, floating text, bursts, tabs |
| `gamifiedui-sfx` | Planned: procedural UI sounds, no audio files |
| `gamifiedui-vue`, `gamifiedui-react` | Planned: component wrappers |

## Development

```bash
npm install
npm test               # Tailwind compile and rule checks, plus a check that icons, CDN CSS and utils dist are fresh
npm run build:packages # rebuild icons, CDN CSS and utils dist (commit the results)
npm run demo           # playground at http://localhost:5173
npm run build          # packages, then the demo
```

`dist/` folders are committed so jsDelivr's GitHub mirror can serve them from any tag.

## License

[Apache License 2.0](LICENSE). Free for commercial use, with an explicit patent grant. See
[NOTICE](NOTICE).
