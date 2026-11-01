# gamifiedui-icons

## 0.1.0

- First release, under the Apache License 2.0.
- 349 icons on a 16×16 grid: 317 common UI and game icons in 23 categories (interface, media,
  files, equipment, creatures, classes and magic, flags, sports, places, weather and more),
  10 emoji faces and 22 Hong Kong icons. Shipped as Tailwind `@utility` classes
  (`src/index.css`), plain CSS (`src/all.css`), SVG files and `icons.json` with 繁體 and 简体
  labels and a `category` per icon.
- Every icon has an animated `gx-ia-*` version, driven by 20 pixel-snapped motion presets
  (`gx-im-*`) or hand-drawn frames (fire, laugh, wink, write, tablet, heartbeat, coin-spin,
  bell-ring, typing, loading). They respect reduced motion and can be stopped with
  `gx-icon-paused`, `gx-icon-hover-play` or `gx-icons-paused`.
