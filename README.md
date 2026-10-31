# gamifiedUI

**Game-style 2D / 2.5D UI for Tailwind CSS v4. Free and open source.**

Turn everyday components into game parts:

- buttons that press into the page
- RPG panels with pixel frames
- HP / MP / XP bars that drain in steps
- dialogue boxes, quest logs and loot cards
- sprite animation and isometric scenes
- 239 pixel icons, each with a stoppable animated version

It is CSS only, so it works with Vue, React, Svelte or plain HTML.

**[Live demo](https://carsonhung.github.io/gamifiedUI/)**, in English, 繁中 and 简中.

## Quick start

```bash
npm i gamifiedui-css gamifiedui-icons tailwindcss @tailwindcss/vite
```

```css
@import "tailwindcss";
@import "gamifiedui-css";
@import "gamifiedui-icons";
```

```html
<button class="gx-btn gx-btn-danger">
  <i class="gx-icon gx-i-sword" aria-hidden="true"></i> Attack
</button>

<div class="gx-bar gx-bar-hp" role="meter" aria-label="HP"
     aria-valuemin="0" aria-valuemax="100" aria-valuenow="64" style="--gx-value: 0.64"></div>

<i class="gx-icon gx-ia-slime" aria-hidden="true"></i> <!-- animated -->
```

No build step? Link the prebuilt stylesheets instead:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gamifiedui-css@0.1/dist/gamifiedui.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gamifiedui-icons@0.1/src/all.css">
```

## What's inside

### Components

There are 35 component families, all prefixed `gx-`:

- **Controls:** buttons, chips, forms, sliders, uploads, date pickers and calendars.
- **Containers:** panels, dialogs, drawers, tabs, accordions, menus, tables, pagination and steppers.
- **Game parts:** HP / MP / XP bars, skill slots with cooldowns, item and loot cards, quest logs, rewards, ratings, timers and counters.
- **Feedback:** toasts, alerts, tooltips, badges, spinners, skeletons, floating damage text and particle bursts.
- **Scenes:** sprite-sheet animation and isometric scenes.

Each family is documented in the [gamifiedui-css README](packages/gamifiedui-css/README.md).

### Icons

There are **239 pixel icons** on a 16×16 grid, sorted into 19 categories. Each icon ships as:

- a Tailwind utility (`gx-i-heart`)
- a plain CDN class
- a standalone SVG (`svg/heart.svg`)

The categories are interface, media, files, stationery, communication, devices, shopping, equipment, stats, awards, creatures, food, home, people, places, transport, school, nature, and emoji / Hong Kong.

Every icon also has an animated version, `gx-ia-*`:

- **Motion presets:** 20 of them, such as bob, pop, spin, ring, shake and drive.
- **Hand-drawn frame animations:** fire, laughing, a hopping slime, a sea with moving waves, and a blinking Christmas tree, among others.

To stop animations, use `gx-icon-paused`, `gx-icon-hover-play` or `.gx-icons-paused` on a parent. Reduced motion turns them all off. Tier tones (`gx-icon-gold`, `-silver`, `-bronze`, `-diamond`) colour any icon.

The machine-readable lists are `icons.json` and `categories.json`, with English, 繁中 and 简中 labels. See the [gamifiedui-icons README](packages/gamifiedui-icons/README.md).

### Optional JavaScript

`gamifiedui-utils` is small, has no dependencies, and is tree-shakeable. It provides:

- toasts and typewriter dialogue
- rolling counters and cooldown timers
- floating text and particle bursts
- tabs, calendars and uploads

## Principles

- **Plain HTML first.** Components use real `<button>`s and native `<dialog>`s. State comes from `aria-*` and `data-*` attributes, so no JavaScript is required.
- **Game feel without jank.** Only `translate`, `scale`, `rotate` and `opacity` animate, in pixel-snapped `steps()`.
- **Reduced motion built in.** `prefers-reduced-motion` or `data-gx-motion="reduce"` stops every animation.
- **Themeable.** Everything comes from tokens. Era themes are set with `data-gx-theme`: `gameboy` and `parchment`.
- **Accessible.** Components keep visible focus, meters use ARIA, and decorative icons are hidden from screen readers.

## Packages

| Package | Version | Contents |
|---|---|---|
| [`gamifiedui-css`](packages/gamifiedui-css) | 0.1.0 | Tokens, themes, components, particles, sprite and iso utilities, CDN build |
| [`gamifiedui-icons`](packages/gamifiedui-icons) | 0.1.0 | 239 pixel icons in 19 categories, animated versions, SVGs, JSON metadata |
| [`gamifiedui-utils`](packages/gamifiedui-utils) | 0.1.0 | Optional JavaScript helpers |
| `gamifiedui-sfx` | Planned | Procedural UI sounds, no audio files |
| `gamifiedui-vue`, `gamifiedui-react` | Planned | Component wrappers |

## Development

```bash
npm install
npm test               # Tailwind compile, CSS rule checks, and freshness checks for icons, CDN CSS and utils dist
npm run build:packages # rebuild icons, CDN CSS and utils dist (commit the results)
npm run demo           # playground at http://localhost:5173
npm run build          # packages, then the demo
```

Icons are drawn as ASCII grids in [`packages/gamifiedui-icons/icons/`](packages/gamifiedui-icons/icons). The build turns them into CSS masks, SVGs and frame strips, and it fails if any icon is missing a category.

The `dist/` folders are committed so that jsDelivr's GitHub mirror can serve them from any tag.

## License

[Apache License 2.0](LICENSE). It is free for commercial use and includes an explicit patent grant. See [NOTICE](NOTICE).
