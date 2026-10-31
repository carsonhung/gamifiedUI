---
name: iso-scene
description: Build 2.5D isometric UI with CSS - tile grids, raised blocks, cards that lift, cubes with faces - using gx-iso and Tailwind 3D utilities. Use when the user wants an isometric map, board, menu, card or "2.5D" layout.
---

# Isometric scene

## 1. Root and space

```html
<div class="flex h-56 min-w-0 items-center justify-center overflow-hidden">
  <div class="gx-iso grid grid-cols-4 gap-1"> ...tiles... </div>
</div>
```

- `gx-iso` is the true-isometric camera (orthographic): no `perspective-*` anywhere above it.
- The parent reserves height and clips (`overflow-hidden`, `min-w-0`): the rotated scene is
  wider than its layout box.

## 2. Height

- Lift a tile with `translate-z-*` (Tailwind) and animate only `translate`:
  `transition-[translate] duration-(--gx-motion-fast) ease-[steps(2,end)] hover:translate-z-4 active:translate-z-4 focus-visible:translate-z-4`.
- Fake side faces cheaply with an inset shadow on the tile, or build real faces (step 3).

## 3. Real cubes

- Cube wrapper: `relative transform-3d`. Faces: `absolute inset-0` with
  top `translate-z-[--h]`, front `origin-bottom rotate-x-90`, side `origin-right rotate-y-90`;
  shade each face with `color-mix()` from one base token.
- Every element between `gx-iso` and a face needs `transform-3d`. Anything with `overflow`
  other than `visible`, `filter` or `opacity < 1` in that chain flattens the scene.

## 4. Interaction and accessibility

- Tiles that do something are `<button>`s with labels ("Tile 3, grass"); provide a non-iso
  list or grid alternative when the scene carries information.
- Check hit areas: 3D-transformed elements are hit-tested in their transformed shape.
- Verify keyboard focus is visible on lifted tiles and nothing scrolls horizontally at 375px.
