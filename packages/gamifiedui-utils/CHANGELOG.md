# gamifiedui-utils

## 0.2.0

- `confirmDialog({ message, title?, confirmLabel?, cancelLabel?, tone?, scene?, className? })`:
  a yes/no question in a `gx-dialog` instead of `window.confirm`, which itch.io and other
  iframes can block. Resolves `true` only for the confirm button; Cancel has focus first.

- `typewriter` takes a `speed` multiplier; `TEXT_SPEEDS` (slow, normal, fast, instant) and
  `autoAdvanceMs(text)` (reading pause for an Auto mode, longer for CJK).
- `mapZoom(viewport, options)`: wheel and toolbar zoom for a `gx-map` that keeps the point
  under the cursor fixed; `zoomAround()` is the pure scroll maths. `wheel: 'modifier'` zooms
  only with Ctrl or ⌘ so a map inside a long page doesn't trap scrolling (`'never'` turns the
  wheel off); `initial: 'fit-width'` starts at the largest step with no sideways scrollbar
  (`fitWidthZoom()` is the maths), and the handle reports the resolved `initial`.
- `fitMapPlates(root, padding?)` sizes each `gx-map-plate` to its name and status text, for
  labels whose length changes with the language.
- `painter` / pixel helpers: paint a grid from shapes or text rows, auto-outline it and render
  merged pixel runs as SVG.
- `spamGuard(form)`: honeypot field plus a minimum fill time for captcha-free form spam checks.

## 0.1.0

- First release, under the Apache License 2.0.
- `toast`, `typewriter`, `graphemes`, `rollNumber`, `cooldown`, `isCoolingDown`, `floatText`,
  `burst`, `tabs`, `sliderFill`, `videoPlayOverlay`, `prefersReducedMotion`, `replay`.
- `timer` / `formatDuration`, `calendar` and `datePicker` (single date or range),
  `toISODate` / `parseISODate`, `dropzone`, `formatBytes`, `matchesAccept`.
