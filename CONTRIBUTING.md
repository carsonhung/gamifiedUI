# Contributing

Thanks for helping. Bug reports, icon requests, new components and themes are all welcome.
If you built a look for your own game on top of gamifiedUI, please consider contributing it
back as a theme so other games can use it too.

## Contribute your theme

A theme is one block in
[`packages/gamifiedui-css/src/themes.css`](packages/gamifiedui-css/src/themes.css):

```css
[data-gx-theme="your-theme"] {
  --color-gx-ink: ...;
  --color-gx-page: ...;
  --color-gx-surface: ...;
  /* every --color-gx-* token you want to change */
  --gx-radius: ...; /* shape hooks are optional; see src/shape.css */
}
```

Checklist before you open a pull request:

1. **Tokens only.** Set `--color-gx-*` tokens and the shape hooks listed at the top of
   `src/shape.css`. Don't add per-component overrides; if a component can't express your look,
   open an issue for a new hook instead.
2. **Name it by its look, not by your app** (`glass`, `vintage`, not `my-game`).
3. **Readable text.** Text tokens need 4.5:1 contrast on their background
   (`on-surface` on `surface`, `on-page` on `page`, `on-primary` on `primary` and so on), and
   the focus colour needs 3:1 against both `page` and `surface`.
4. **State is never colour alone.** Check that selected toggles, the current tab and disabled
   buttons are still clear in your theme.
5. **Try every demo section** with your theme (`npm run demo`, then pick it in the header),
   including Reduce motion and both Chinese locales.
6. **`npm test` passes.** Raw hex colours are allowed in `themes.css` only.
7. In the pull request, add a screenshot of the HUD, dialogue and desktop sections, and a line
   for `packages/gamifiedui-css/CHANGELOG.md` under the unreleased version.

Not ready to write CSS? [Propose a theme](https://github.com/carsonhung/gamifiedUI/issues/new?template=theme.yml)
with screenshots or a palette and we can build it together.

## Icons and components

- Icons are ASCII grids; see "Development" in the [README](README.md#development).
- New components go in `packages/gamifiedui-css/src/components/`, use only `--color-gx-*`
  tokens and the shape hooks, and get a demo section (its code sample is generated from the
  markup) plus a selector in `scripts/check-css.mjs`.

## Sponsor

gamifiedUI is free under the Apache License 2.0. If it saves your team time, you can
[sponsor the work on GitHub](https://github.com/sponsors/carsonhung).
