# gamifiedui-css

Game-style 2D / 2.5D components for Tailwind CSS v4. CSS only, works with any framework.

```bash
npm i gamifiedui-css tailwindcss @tailwindcss/vite
npm i @fontsource/press-start-2p   # optional pixel font
npm i @fontsource/fusion-pixel-12px-proportional-tc   # optional, Chinese (Traditional)
npm i @fontsource/fusion-pixel-12px-proportional-sc   # optional, Chinese (Simplified)
```

```css
/* app.css */
@import "tailwindcss";
@import "gamifiedui-css";
```

The stylesheet is a Tailwind v4 entry point, so Tailwind must process it (Vite or PostCSS
plugin). Without that the build succeeds but `@theme` and `@utility` stay unprocessed.

## CDN (no build step)

`dist/` holds prebuilt stylesheets that need no Tailwind:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/press-start-2p/index.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gamifiedui-css@0.1/dist/gamifiedui.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gamifiedui-icons@0.1/src/all.css">
```

| File | Contains |
|---|---|
| `dist/gamifiedui.min.css` | Tailwind preflight (reset), every token, all components and utilities |
| `dist/gamifiedui-core.min.css` | the same without preflight, for pages that bring their own reset |

Both have an unminified `.css` twin, and `unpkg.com/gamifiedui-css` serves the same files.
Before the npm release, or to pin a commit, use jsDelivr's GitHub mirror:
`https://cdn.jsdelivr.net/gh/carsonhung/gamifiedUI@<tag>/packages/gamifiedui-css/dist/gamifiedui.min.css`.

The prebuilt files can't generate arbitrary values. They include `gx-depth-0` to `-8`,
`gx-sprite-{w,h}-{8,12,16,24,32,48,64,96,128}`, `gx-sprite-frames-1` to `-16`,
`gx-sprite-scale-1` to `-8`, `gx-sprite-ms-100` to `-2000` (in steps of 100) and `sr-only`.
Any other value can be set inline: `style="--gx-sprite-frames: 24"`. For Chinese, also load
`@fontsource/fusion-pixel-12px-proportional-tc` (or `-sc`) the same way.

## Components

| Class | Markup | Modifiers |
|---|---|---|
| `gx-btn` | `<button>` | `gx-btn-{primary,danger,success,warning,ghost}`, `gx-btn-{sm,lg}`, `aria-pressed="true"` |
| `gx-panel` | any block | `gx-panel-title`, `gx-panel-flat` |
| `gx-bar` | `role="meter"` + `style="--gx-value: 0.6"` | `gx-bar-{hp,mp,xp}`, `gx-bar-smooth`, `gx-bar-critical` |
| `gx-badge` | `<span>` | `gx-badge-{primary,danger,success}` |
| `gx-dialog` | `<dialog>` opened with `showModal()` | |
| `gx-textbox` | dialogue box | `gx-textbox-{speaker,text,next,choices}` |
| `gx-alert` | block, `role="alert"` only if urgent | `gx-alert-{info,success,warning,danger}`, parts `-icon`, `-title`, `-body` |
| `gx-toast` | inside one `gx-toast-stack` region; `role="status"` / `"alert"` | same tones + `gx-toast-achievement`, parts `-icon`, `-title`, `-body`, `-close`; `data-leaving` plays the exit |
| `gx-spinner` | inside `role="status"` with text | `gx-spinner-lg` |
| `gx-tooltip` | wrapper; content `role="tooltip"` linked by `aria-describedby` | `gx-tooltip-bottom` |
| `gx-tabs` / `gx-tab` | `role="tablist"` / `role="tab"` + `aria-selected` | panel: `gx-panel gx-tab-panel` |
| `gx-field`, `gx-input` | `<input>`, `<textarea>`, `<select>` | `gx-field-{label,hint,error}`, `aria-invalid="true"` |
| `gx-checkbox`, `gx-radio`, `gx-switch` | native inputs (`role="switch"` for the switch) in `label.gx-choice` | |
| `gx-card` | block, or `<button>` / `<a>` to make it pressable | `gx-card-{title,meta}`, `gx-rarity-*` |
| `gx-slot` | inventory cell, `<button aria-pressed>` | `gx-slot-count`, `gx-rarity-*` |
| `gx-kbd` | `<kbd>` key prompt | |
| `gx-rarity-*` | modifier for cards and slots | `common`, `rare`, `epic`, `legendary` (also print the name) |
| `gx-frame` | `<figure>` around `<img>`, `<picture>`, `<canvas>` or `<video>` | `gx-frame-caption`, `gx-frame-pixelated`, `gx-frame-cover` + `gx-frame-{square,wide,portrait}`, `gx-rarity-*` |
| `gx-avatar` | `<span>` with an `<img alt>`, or initials + `role="img" aria-label` | `gx-avatar-{sm,lg}`, `gx-rarity-*` |
| `gx-video` | `gx-frame gx-video` > `gx-video-screen` > `<video controls>` with `<track kind="captions">` | `gx-video-play` start overlay (a real `<button>`) |
| `gx-menu` / `gx-menu-item` | `<ul>` of `<button>`s or links; blinking ▶ cursor on hover, focus and `aria-current` | `gx-menu-hint` |
| `gx-dropdown` | `<details>` > `<summary>` + `gx-dropdown-panel` | `gx-dropdown-end` |
| `gx-accordion` | `<details>` (share a `name` for one-open-at-a-time) | `gx-accordion-meta`, `gx-accordion-body` |
| `gx-slider` | `<input type="range">`; script sets `--gx-value` (0..1) for the WebKit fill | `gx-slider-{hp,mp,xp}` |
| `gx-table` | `<table>` in `gx-table-wrap`; `tr[aria-current]` highlights a row | `gx-table-num`, `gx-rank` + `gx-rank-{1,2,3}` |
| `gx-pagination` / `gx-page` | `<ul>` of buttons or links, `aria-current="page"` | `gx-breadcrumb` (`<nav><ol>`) |
| `gx-drawer` | `<dialog>` opened with `showModal()` | `gx-drawer-start` |
| `gx-stepper` / `gx-step` | `<ol>`; `data-state="cleared\|current\|locked"` | `gx-step-node` |
| `gx-chip` | `<span>`, or `<button aria-pressed>` for a filter | tones as buttons |
| `gx-divider` | `<hr>` | `gx-divider-text` (a labelled divider) |
| `gx-skeleton` | placeholder inside `aria-busy="true"` | `gx-skeleton-{text,avatar,block}`, `--gx-skeleton-w` |
| `gx-rating` | `role="img"` + `aria-label`, `style="--gx-value: 3"` | `gx-rating-stars`, `gx-rating-{sm,lg}`, `--gx-rating-max` |
| `gx-counter` | icon + `gx-counter-value`; `data-bump` plays a pop | `gx-counter-{xp,hp}` |
| `gx-reward` | `gx-dialog gx-reward` with `gx-reward-item` (spinning rays) | `gx-reward-{title,name}` |
| `gx-quest` / `gx-objective` | HUD quest tracker; `data-done` ticks an objective | `gx-quest-{title,list}`, `gx-objective-{text,count}` |
| `gx-skill` | `<button>`; `--gx-cooldown` (1..0) sweeps, `aria-disabled` while cooling | `gx-skill-key`, `gx-skill-timer`, `data-ready` |
| `gx-float` | short text in a `gx-float-layer`; rises and fades once | `gx-float-{damage,heal,xp,crit}` |
| `gx-timer` | `role="timer"` with `gx-timer-label` + `<time class="gx-timer-value">`; `--gx-value` (1..0) drains the strip | `data-state="warning\|critical\|done"`, `gx-timer-lg` |
| `gx-calendar` | month grid of `<button class="gx-day">`; rendered by `calendar()` in `gamifiedui-utils` | day: `aria-current="date"`, `aria-pressed`, `data-range="start\|middle\|end\|preview"`, `data-outside`, `aria-disabled`, `data-event` + `gx-rarity-*`, `data-claimed` |
| `gx-datepicker` | `.gx-input` + `gx-datepicker-toggle` + `[popover].gx-datepicker-panel` holding a `gx-calendar` | single date or a range; anchored under the field where CSS anchor positioning exists |
| `gx-dropzone` | `<label>` wrapping `<input type="file">` (click and keyboard work without JS) | `gx-dropzone-{title,hint}`, `data-dragging`, `data-invalid` |
| `gx-file-list` / `gx-file` | `<ul>` of uploads | `gx-file-{name,size,remove,status}`, `gx-bar gx-file-progress`, `data-state="uploading\|done\|error"` |
| `gx-icon` | `<span aria-hidden="true">` + an icon class from `gamifiedui-icons` | `gx-icon-{sm,lg,xl}` (16/48/64px; default 32), tones, `gx-icon-shadow`, `gx-icon-tile`; stop animated `gx-ia-*` icons with `gx-icon-paused`, `gx-icon-hover-play` or `gx-icons-paused` on a container |

## Particles

- **Bursts:** a `gx-burst` inside any positioned element, holding `gx-particle` children.
  Each child gets `--gx-dx`, `--gx-dy` (in rem), `--gx-rot` and `--gx-delay`. Colours are
  `gx-particle-{coin,heart,xp,petal,rarity}` and `gx-particle-lg`. Add an icon class such as
  `gx-i-coin` to use that shape. `burst()` in `gamifiedui-utils` builds all of this for you.
- **Ambient:** `<div class="gx-ambient gx-ambient-snow" aria-hidden="true">` with 12 empty
  `<i>`, placed inside a positioned element. It needs no script. Kinds are
  `snow`, `rain`, `embers` and `petals`.

Both are hidden under reduced motion, since they are decoration.

## JavaScript

Every component works without script. A few effects only make sense when driven, so
[`gamifiedui-utils`](../gamifiedui-utils) ships small optional helpers for them: toasts,
typewriter, number roll, skill cooldown, floating text, bursts, tabs, the slider fill, timers,
calendars and date (range) pickers, and drag-and-drop upload.

A file button needs no script: `<label class="gx-btn">Choose file<input type="file" class="sr-only"></label>`.

## Utilities

- `gx-depth-{n}`: depth of raised components, in pixel units (`--gx-px`, default 4px).
- `gx-pixel-frame`, `gx-pixelated`.
- `gx-iso`: true isometric camera (orthographic). Pair children with Tailwind `transform-3d`
  and `translate-z-*`.
- `gx-sprite` with `gx-sprite-w-16 gx-sprite-frames-8 gx-sprite-scale-4 gx-sprite-ms-800` and
  `bg-[url(/hero.png)]`: horizontal sprite strip played with `steps()`.

## Themes and motion

Set `data-gx-theme="gameboy"` or `"parchment"` on any element (themes nest). Override any
`--color-gx-*` token to make your own. Every animation stops under
`prefers-reduced-motion: reduce` or inside `data-gx-motion="reduce"` (for an in-app setting).

## Chinese, Japanese and Korean

Press Start 2P only covers Latin, so `--font-gx` falls back to Fusion Pixel 12px (Traditional
Chinese by default). Set `lang` on `<html>` or any element:

- `lang="zh-Hant"` / `zh-TW` / `zh-HK`: Traditional glyphs.
- `lang="zh-Hans"` / `zh-CN` / `zh-SG`: Simplified glyphs.
- Any `zh`, `ja` or `ko`: pixel-font sizes snap to 12px and 24px (the font's grid, so glyphs
  stay crisp) and `line-break: strict` keeps punctuation off line starts.

Each Fusion Pixel file is about 600 KB, but browsers only fetch it once a CJK character is on
screen. For typewriter effects, split text with `Intl.Segmenter` (graphemes), not `slice`.

## License

[Apache License 2.0](LICENSE). Free for commercial use, with an explicit patent grant. See
[NOTICE](NOTICE).
