# gamifiedui-icons

## 0.2.0 (unreleased)

- Breaking: the `interface` category is split into `navigation`, `actions` and `alerts-time`.
  Tools (hammer, axe, rod, dig, stick) move from `equipment` to a new `tools` category, and
  celebrations (gift, balloon, kite, christmas-tree) move from `awards` to `celebrations`.
- Categories now belong to one of five groups (interface, game, world, life, culture). Each
  entry in `categories.json` has a `group`, and the new `groups.json` export lists the groups
  with 繁體 and 简体 names.
- New `fast-forward` icon, animated with `nudge-right`.
- `egg-waffle` is redrawn as staggered round bubbles on a scalloped sheet, so it no longer
  looks like a square grid waffle.
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
