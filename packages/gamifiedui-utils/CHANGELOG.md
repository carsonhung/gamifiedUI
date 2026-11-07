# gamifiedui-utils

## Unreleased

- `dayCycle(el, { day, part, weather?, label? })` and `DAY_PART_ANGLES`: set a `gx-daycycle` so
  its wheel always turns forward, a full turn per day, with `clear`, `cloudy`, `rain` or `storm`
  weather (adding the clouds part when needed).
- `soundControl(root, targets, { onChange? })`: wires a `gx-sound` mute toggle and volume slider
  to any `{ muted, volume }` targets, keeping them in step with the first.

## 0.4.0

- `quantity(root, { pageSteps?, onChange? })`: wires a `gx-quantity` stepper with press-and-hold
  repeat, keyboard jumps and min / max / step clamping. Buttons at a limit get `aria-disabled`
  so keyboard focus stays put.
- `burst(host, { kind: 'confetti' })`: mixed-colour confetti with a zigzag ribbon every third
  piece, for level-ups, milestones and wins.
- `gridNav(root, { selector?, onMove? })`: an arrow-key cursor over a `gx-inventory` or
  `gx-card-grid` with a single tab stop. Up and Down move by the columns the browser laid out,
  so auto-fill grids reflow without config; Home / End and Ctrl+Home / End jump to row and grid
  ends. Returns `{ focus, refresh, destroy }`.
- `timeList(el, options)` and `timePicker(input, toggle, panel, options)`: pick a time or a
  time range in `step`-minute slots, with `min` / `max`, typed digits to jump, an hour per
  PageUp / PageDown, and overnight ranges (`22:00 – 06:00`, tagged `+1`, with the length in the
  summary). Plus `parseTime`, `formatTime` and `timeRange`.

## 0.3.0

- `holdButton(button, { onPress, onRelease?, keys? })`: press-and-hold for mini-games that
  keeps holding when a thumb slides off the button and blocks the phone long-press menu.
- `confirmDialog({ message, title?, confirmLabel?, cancelLabel?, tone?, scene?, className? })`:
  a yes/no question in a `gx-dialog` instead of `window.confirm`, which itch.io and other
  iframes can block. Resolves `true` only for the confirm button; Cancel has focus first.

## 0.2.0

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
