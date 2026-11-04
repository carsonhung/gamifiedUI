# gamifiedUI

[![Live demo](https://img.shields.io/badge/demo-live-f7c948)](https://carsonhung.github.io/gamifiedUI/)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8)](https://tailwindcss.com)

**Game-style 2D / 2.5D UI for Tailwind CSS v4. Free and open source.**

Initiated by [Carson Hung](https://github.com/carsonhung). *Game for a better world together.*

Turn everyday components into game parts:

- buttons that press into the page
- RPG panels with pixel frames
- HP / MP / XP bars that drain in steps
- dialogue boxes, quest logs and loot cards
- sprite animation and isometric scenes
- 349 pixel icons, each with a stoppable animated version
- optional chiptune sound effects, generated live with no audio files

The core is CSS only, so it works with Vue, React, Svelte or plain HTML.

**[Live demo](https://carsonhung.github.io/gamifiedUI/)**, in English, 繁中 and 简中. It includes
**[Egg Waffle Warrior (雞蛋仔戰士)](https://carsonhung.github.io/gamifiedUI/eggette.html)**, a small
Hong Kong egg waffle shop game built only from gamifiedUI classes, so you can play it in each theme.
The full street game **[掃街 · 夜繽紛 (EatWellHK)](https://carsonks.itch.io/eatwellhk)** is also made
with gamifiedUI.

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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gamifiedui-css@0.2/dist/gamifiedui.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gamifiedui-icons@0.2/src/all.css">
```

Adding gamifiedUI to a site that already has its own styles, such as a Tailwind v3 app? Link
`gamifiedui-core.min.css` instead. `gamifiedui.min.css` starts with Tailwind's preflight reset,
which restyles headings, links, lists and tables across the whole page. The core build leaves it
out: it styles `gx-` classes only, apart from setting gamifiedUI's own variables and
`line-break: strict` on Chinese, Japanese and Korean pages.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gamifiedui-css@0.2/dist/gamifiedui-core.min.css">
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

There are **349 pixel icons** on a 16×16 grid, sorted into 24 categories. Each icon ships as:

- a Tailwind utility (`gx-i-heart`)
- a plain CDN class
- a standalone SVG (`svg/heart.svg`)

The categories are interface, media, files, stationery, communication, devices, shopping, equipment, stats, awards, creatures, classes and magic, flags, sports, food, home, clothing, people, places, transport, school, weather, nature, and emoji / Hong Kong.

Some highlights:

- **RPG:** 17 classes and spells, such as knight, wizard, necromancer, white magic and cure, plus monsters from slime and goblin to zombie, dinosaur and boss.
- **Everyday life:** shops, a bank, a hospital and a post office, plus buses, trains, boats, weather, clothing and sports.
- **Files:** PDF, PPT, DOC and HTML badges, folders and contracts.
- **Flags:** Hong Kong, China, Japan, Korea, the US and the UK.
- **Hong Kong:** 22 local icons, including the MTR, the tram, the Star Ferry, red minibuses and HKU's Main Building.

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

### Sound effects (optional)

`gamifiedui-sfx` is a separate package. It generates 22 chiptune sounds live with Web Audio, such as click, coin, hit, heal and levelUp, so it ships no audio files. Nothing plays until you ask it to.

```ts
import { createSfx } from 'gamifiedui-sfx';

const sfx = createSfx({ volume: 0.5, storageKey: 'my-game-sfx' }); // remembers volume and mute
sfx.bind(); // every [data-gx-sfx] element now plays its sound on click
sfx.play('levelUp');
```

```html
<button class="gx-btn" data-gx-sfx="coin">Buy</button>
```

See the [gamifiedui-sfx README](packages/gamifiedui-sfx/README.md) for the sound list and for defining your own.

## Principles

- **Plain HTML first.** Components use real `<button>`s and native `<dialog>`s. State comes from `aria-*` and `data-*` attributes, so no JavaScript is required.
- **Game feel without jank.** Only `translate`, `scale`, `rotate` and `opacity` animate, in pixel-snapped `steps()`.
- **Reduced motion built in.** `prefers-reduced-motion` or `data-gx-motion="reduce"` stops every animation.
- **Themeable.** Everything comes from tokens. Themes are set with `data-gx-theme`: `arcade` (default), `vintage` (classic Windows PC game desktop), and `glass` (modern XR-style spatial glass).
- **Accessible.** Components keep visible focus, meters use ARIA, and decorative icons are hidden from screen readers.

## Packages

| Package | Version | Contents |
|---|---|---|
| [`gamifiedui-css`](packages/gamifiedui-css) | 0.1.0 | Tokens, themes, components, particles, sprite and iso utilities, CDN build |
| [`gamifiedui-icons`](packages/gamifiedui-icons) | 0.1.0 | 349 pixel icons in 24 categories, animated versions, SVGs, JSON metadata |
| [`gamifiedui-utils`](packages/gamifiedui-utils) | 0.1.0 | Optional JavaScript helpers |
| [`gamifiedui-sfx`](packages/gamifiedui-sfx) | 0.1.0 | Optional chiptune sound effects made with Web Audio, no audio files |
| `gamifiedui-vue`, `gamifiedui-react` | Planned | Component wrappers |

## Development

```bash
npm install
npm test               # Tailwind compile, CSS rule checks, and freshness checks for icons, CDN CSS, utils and sfx dist
npm run build:packages # rebuild icons, CDN CSS, utils and sfx dist (commit the results)
npm run demo           # playground at http://localhost:5173
npm run build          # packages, then the demo
```

Icons are drawn as ASCII grids in [`packages/gamifiedui-icons/icons/`](packages/gamifiedui-icons/icons): `#` is a solid pixel, `+` is half-tone and `.` is empty. To add one, draw it in `common.mjs`, list it in a category in `categories.mjs`, and optionally give it a default motion in `motion.mjs`. The build turns it into CSS masks, SVGs and frame strips, and it fails if an icon is missing a category or is listed twice.

The `dist/` folders are committed so that jsDelivr's GitHub mirror can serve them from any tag. The demo is deployed to GitHub Pages on every push to `master`.

## Support and contribute

gamifiedUI is free. If it helps your project:

- **Sponsor** the work on [GitHub Sponsors](https://github.com/sponsors/carsonhung).
- **Contribute your design back.** Built a look for your game? Turn it into a theme so other
  games can use it: follow the checklist in [CONTRIBUTING.md](CONTRIBUTING.md#contribute-your-theme),
  or [propose a theme](https://github.com/carsonhung/gamifiedUI/issues/new?template=theme.yml)
  with screenshots and we'll build it together.
- **Credit the packages.** A small credit is welcome but never required, for example
  `<p class="gx-credit">Made with <a href="https://github.com/carsonhung/gamifiedUI">gamifiedUI</a></p>`
  (the open-source `gamifiedui-css`, `gamifiedui-icons`, `gamifiedui-utils` and `gamifiedui-sfx`).

Bug reports, icon requests and pull requests are welcome too.

## Author

gamifiedUI was started by [Carson Hung](https://github.com/carsonhung) and is built with
everyone who contributes. *Game for a better world together.*

## License

[Apache License 2.0](LICENSE). It is free for commercial use and includes an explicit patent grant. See [NOTICE](NOTICE).
