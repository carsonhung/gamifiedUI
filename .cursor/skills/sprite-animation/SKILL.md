---
name: sprite-animation
description: Turn a sprite sheet or strip into a gamifiedUI animation with the gx-sprite utilities, including frame maths, scaling and reduced motion. Use when the user adds an animated character, icon, effect or loading spinner made of frames.
---

# Sprite animation

## 1. Check the asset

- Licence first (see `asset-licensing`): CC0 or drawn in code. Record it in `docs/ASSETS.md`.
- Measure: frame width and height in source pixels, frame count, spacing. Grid sheets must be
  cut or re-packed into one horizontal strip per animation with zero spacing.

## 2. Apply the utilities

```html
<div
  class="gx-sprite gx-sprite-w-16 gx-sprite-h-16 gx-sprite-frames-8 gx-sprite-scale-4 gx-sprite-ms-800 bg-[url(/assets/kenney/slime-strip.png)]"
  role="img" aria-label="Slime idle"></div>
```

- `gx-sprite-w/h` are source pixels; `gx-sprite-scale` is a whole number.
- Duration = frames x per-frame time (8 frames at 100ms = `gx-sprite-ms-800`).
- One-shot effects: add `[animation-iteration-count:1]` and `[animation-fill-mode:forwards]`.
- Pause: `gx-sprite-paused`. Decorative sprites: `aria-hidden="true"` instead of a label.

## 3. Verify the maths

- Frames visibly slice or drift: frame count, cell width and sheet width disagree. The sheet
  must be exactly `frames * w` pixels wide.
- Blurry: missing `image-rendering: pixelated` (included in `gx-sprite`) or a fractional scale.
- With Reduce motion on, the first frame shows still.

## 4. Generated sprites

For demo art, draw frames on a canvas (see `createSlimeStrip()` in `demo/src/main.ts`) and set
`backgroundImage` to `canvas.toDataURL()`. Colours there may be literal.
