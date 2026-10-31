---
name: add-component
description: Add a new gamifiedUI component (e.g. tabs, toast, inventory slot, tooltip) end to end - CSS, tones, states, motion fallback, demo, check script, docs. Use when the user asks for a new game-style component or a new variant of one.
---

# Add a component

## 1. Design the contract first

- Pick the semantic element (`<button>`, `<dialog>`, `role="tablist"`, ...). If it needs
  behaviour CSS can't express, the CSS still works with attributes alone; JS only sets them.
- Name it per `component-api`: `gx-<name>`, parts `gx-<name>-<part>`, the shared tone names,
  `-sm` / `-lg`. Write the markup example before any CSS.

## 2. Write `packages/gamifiedui-css/src/components/<name>.css`

- Wrap in `@layer components`. Component custom properties first, colours only from
  `--color-gx-*` + `color-mix()`.
- Pixel frame + depth: copy the box-shadow stack from `button.css` or `panel.css`; reserve
  margin for frame and slab.
- States: hover inside `@media (hover: hover)`, `:focus-visible`, pressed via
  `:active` / `aria-pressed` / `[data-pressed]`, disabled via `:disabled` / `aria-disabled`.
- Motion: only `translate` / `scale` / `rotate` / `opacity`, durations from `--gx-motion-*`,
  `steps()` timing. Infinite animations get `animation: none` under
  `prefers-reduced-motion` and `[data-gx-motion="reduce"]`.
- Import it from `src/index.css`.

## 3. Show and guard it

- Add a section to `demo/index.html` with every tone, size and state; wire any behaviour in
  `demo/src/main.ts` with complete class-name strings.
- Add the root selector to `COMPONENT_SELECTORS` in `scripts/check-css.mjs` (and utilities to
  `UTILITY_CASES`).
- Run `npm test`, `npm run build`, `npm run lint --workspace=gamifiedui-demo`.
- Check in the browser: keyboard only, pointer only, all three themes, Reduce motion on, a
  narrow (375px) viewport, no horizontal scroll.

## 4. Document

- Row in the component table of `packages/gamifiedui-css/README.md`.
- Bullet in the package `CHANGELOG.md` under the next version.
