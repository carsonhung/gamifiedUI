# gamifiedui-css

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
- Particles: `gx-burst` / `gx-particle` bursts and CSS-only `gx-ambient` snow, rain, embers and petals.
- Prebuilt CDN stylesheets in `dist/` (`gamifiedui.min.css`, `gamifiedui-core.min.css`) that
  need no Tailwind.
- All motion follows `prefers-reduced-motion` and `data-gx-motion="reduce"`.
