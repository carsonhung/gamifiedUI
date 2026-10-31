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
