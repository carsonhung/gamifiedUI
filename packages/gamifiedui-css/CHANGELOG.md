# gamifiedui-css

## Unreleased

- Quantity: `gx-quantity`, a `− N +` stepper with raised `gx-quantity-btn` buttons, a recessed
  number field without native spinners, and a `data-bump` pop on change.
- Confetti: `gx-particle-confetti` (five theme colours by position, a longer fall) and
  `gx-particle-ribbon` (a 3 x 8 pixel zigzag streamer) for bursts, and a CSS-only
  `gx-ambient-confetti` loop whose pieces tumble as they fall. Hidden under reduced motion,
  like the other particles.
- `gx-card-grid`: a responsive grid for `gx-card` (directly or in `<li>`). Columns fill from
  `--gx-card-grid-min` (12rem; `gx-card-grid-sm` 8rem, `gx-card-grid-lg` 18rem), cards in a row
  share a height, and the gap leaves room for each card's raised depth.
- `gx-inventory`: a recessed tray of `gx-slot` cells with a fixed column count
  (`--gx-inventory-cols`, default 6). Slots shrink rather than wrap on narrow screens, so the
  layout keeps matching arrow-key movement; below a 44px touch target the tray scrolls
  sideways instead of the page. `aria-disabled="true"` dims locked cells.
  Pair either with `gridNav()` in gamifiedui-utils.
- `gx-time` and `gx-timepicker`: a time list (`gx-time-option` with selected, range, disabled
  and next-day `gx-time-tag` states, plus `gx-time-summary`) and a field + toggle + popover
  that shares the `gx-datepicker` look and anchoring. `timeList()` / `timePicker()` in
  gamifiedui-utils render and wire them.

## 0.3.0

- Mini-game parts: `gx-gauge` (a timing gauge with a target zone, a sweet spot and a marker;
  `gx-gauge-vertical` with `gx-gauge-fill` for hold-to-fill), `gx-lane` (a rhythm lane with a
  hit line and notes), `gx-dpad` (four buttons in a cross that light up to show a pattern) and
  `gx-btn-hold` (no long-press menu or text selection on phones). The game loop writes
  `--gx-value`, `--gx-zone-*` and `--gx-at` every frame, so none of them transition.
- `gx-dialog` parts for questions: `gx-dialog-scene` (a portrait beside a `gx-textbox`, which
  widens the dialog on larger screens), `gx-dialog-text` and `gx-dialog-actions` (buttons
  aligned right). `confirmDialog()` in gamifiedui-utils builds them.
- `gx-flip`: a card draw / reveal. Each card shows its back, then turns over once when
  inserted; stagger a row with `--gx-flip-delay`, frame it with `gx-rarity-*`. Reduced motion
  shows the face at once. Pair it with the new `flip` sound in gamifiedui-sfx.

## 0.2.0

- New `glass` theme (XR-style): lightly translucent flat surfaces, a thin light rim, soft
  depth, no bevels or gradients, pill controls and sentence-case labels.
- New `vintage` theme: a classic Windows PC game desktop (white window frames, thin grey
  borders, soft shadows, rounded tiles, light blue taskbar tone).
- Breaking: the `gameboy` and `parchment` themes are removed; elements using them fall back to
  `arcade`. Use `vintage`, or copy their old `--color-gx-*` values from 0.1.0 into your own theme.
- `--color-gx-page` / `--color-gx-on-page` (utilities `bg-gx-page`, `text-gx-on-page`) for
  the background behind panels, so light-surface themes keep readable page text. HUD wells
  (`gx-counter`, `gx-quest`, `gx-timer`, `gx-skill-key`) now use them, and `--color-gx-on-ink`
  colours text on dark scrims (video overlays, skill cooldowns), so all stay legible on light
  themes.
- Desktop shell: `gx-desktop` with `gx-desktop-icon` launchers, `gx-window` (title bar,
  controls, body), `gx-taskbar` and `gx-start-menu`.
- Shape hooks any theme can set (all default to the existing pixel look, so nothing changes
  without them): `--gx-radius`, `--gx-radius-control`, `--gx-radius-field`,
  `--gx-radius-check`, `--gx-backdrop`, `--gx-elevation`,
  `--gx-case`, `--color-gx-frame`, `--gx-line`, `--gx-focus-width`, `--gx-bevel`,
  `--gx-sheen`, `--gx-bar-height`, `--gx-bar-texture`, `--gx-bar-easing`, `--gx-stripe`.
- Rounded themes now round alert and toast icon badges and the toast close button, and drop the
  tone stripe (`--gx-stripe: 0`) that bent into a crescent at large radii.
- Toggled ghost buttons (`aria-pressed="true"`) take an accent tint, so the state shows in
  themes without depth.
- `gx-map`: a themed world-map viewport and toolbar plus SVG parts (land, roads, places with
  current / visited / unexplored / locked states, pin, name plates).
- `gx-hint` (control hint line that fades with `data-hidden`), `gx-credit` (corner info chip)
  and `gx-statusbar` (status line under a window or panel).
- Visual-novel reader controls: `gx-textbox-controls` (text speed, Auto, Skip, Log) and the
  `gx-textbox-log` history list.
- `gx-btn-tint` with `--gx-btn-tint`: give a button any colour in one property; hover follows
  it and the label turns black or white by the tint's lightness (`--gx-btn-tint-fg` to
  override).
- `gx-btn-tile`: an item, shop or level button with a picture (`gx-btn-art`) beside a label
  (`gx-btn-label`) and a meta line (`gx-btn-meta`). `gx-btn-tile-stacked` puts the picture on
  top as a postcard; `--gx-btn-art-size` and `--gx-btn-art-ratio` size it.

## 0.1.0

- First release, under the Apache License 2.0.
- Tokens (`--color-gx-*` including `--color-gx-track` for empty bars, `--font-gx`, `--gx-px`, `--gx-depth`, motion and z-index scales) and
  three era themes: `arcade` (default), `gameboy`, `parchment` via `data-gx-theme`.
- Components: `gx-btn` (2.5D press), `gx-panel`, `gx-bar` (HP/MP/XP), `gx-badge`,
  `gx-dialog` (native `<dialog>`), `gx-textbox` (RPG dialogue box).
- Feedback: `gx-alert`, `gx-toast` in a `gx-toast-stack` (with an "achievement unlocked"
  variant and a stepped slide-in / slide-out), `gx-spinner`.
- Navigation and overlays: `gx-tabs` / `gx-tab`, `gx-tooltip` (hover and focus).
- Forms: `gx-field`, `gx-input`, `gx-checkbox`, `gx-radio`, `gx-switch`.
- Game parts: `gx-card`, `gx-slot` (inventory cell with count), `gx-kbd`, and the shared
  `gx-rarity-{common,rare,epic,legendary}` modifier with `--color-gx-*` rarity tokens.
- Media: `gx-frame` (pixel picture frame with caption, aspect and pixelated modifiers),
  `gx-avatar`, `gx-video` (frame for native `<video controls>` plus a `gx-video-play` overlay).
- Chinese / CJK: Fusion Pixel 12px fallback in `--font-gx`, Simplified glyphs under
  `:lang(zh-Hans)`, `--gx-text-{sm,md,lg}` size tokens that snap to 12px / 24px for
  `zh`, `ja` and `ko`, and `line-break: strict`.
- Utilities: `gx-depth-*`, `gx-pixel-frame`, `gx-pixelated`, `gx-iso`, `gx-sprite` with
  `gx-sprite-{w,h,frames,scale,ms}-*`.
- Menus and navigation: `gx-menu` (blinking ▶ cursor), `gx-dropdown`, `gx-accordion`,
  `gx-pagination`, `gx-breadcrumb`, `gx-drawer`, `gx-stepper`.
- Data display: `gx-slider`, `gx-table` with `gx-rank-{1,2,3}`, `gx-chip`, `gx-divider`,
  `gx-skeleton`.
- Game UI: `gx-rating` (hearts or stars), `gx-counter`, `gx-reward` (level-up / loot modal),
  `gx-quest` / `gx-objective`, `gx-skill` (cooldown sweep), `gx-float` (damage and heal numbers).
- `gx-icon` sizes snap to the 16px icon grid (16 / 32 / 48 / 64px), plus tones,
  `gx-icon-shadow` and `gx-icon-tile`. Icons themselves come from `gamifiedui-icons`.
- Time and dates: `gx-timer` (countdown / stopwatch readout with warning, critical and done
  states), `gx-calendar` (today, selection, ranges, events, daily-login stamps) and
  `gx-datepicker` (popover calendar for a date or a date range).
- Upload: `gx-dropzone` (works as a plain file picker, marching-ants border while dragging),
  `gx-file-list` / `gx-file` with progress and error states.
- Particles: `gx-burst` / `gx-particle` bursts and CSS-only `gx-ambient` snow, rain, embers and petals.
- Prebuilt CDN stylesheets in `dist/` (`gamifiedui.min.css`, `gamifiedui-core.min.css`) that
  need no Tailwind.
- All motion follows `prefers-reduced-motion` and `data-gx-motion="reduce"`.
