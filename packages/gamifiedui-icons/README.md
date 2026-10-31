# gamifiedui-icons

97 pixel icons drawn on a 16×16 grid for [gamifiedui-css](../gamifiedui-css): 67 common UI and
game icons, 10 emoji faces and 22 Hong Kong icons. Every icon also has an animated version.
Each icon is one CSS class. It is a mask filled with `currentColor`, so it takes the text
colour and any `gx-icon` tone.

```bash
npm i gamifiedui-icons
```

```css
/* Tailwind v4: only the icons you use are emitted */
@import "tailwindcss";
@import "gamifiedui-css";
@import "gamifiedui-icons";
```

```html
<!-- No build step: every icon as plain CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gamifiedui-icons@0.1/src/all.css">
```

```html
<span class="gx-icon gx-i-egg-tart" aria-hidden="true"></span>
<button class="gx-btn" aria-label="Settings"><span class="gx-icon gx-icon-sm gx-i-gear" aria-hidden="true"></span></button>
```

Icons are decorative, so mark them `aria-hidden="true"` and put the meaning in text or in an
`aria-label`. Keep sizes at multiples of 16px (`gx-icon-sm` 16, default 32, `gx-icon-lg` 48,
`gx-icon-xl` 64) so the pixels stay square.

Also shipped:

- `svg/<name>.svg` files using `fill="currentColor"`, and `svg/ia-<name>.svg` frame strips.
- `icons.json`, with the name, set, motion and English / 繁體 / 简体 labels for each icon.

## Animated icons

Swap `gx-i-NAME` for `gx-ia-NAME` to animate any icon:

```html
<span class="gx-icon gx-ia-heart" aria-hidden="true"></span>      <!-- beats -->
<span class="gx-icon gx-ia-gear" aria-hidden="true"></span>       <!-- turns -->
<span class="gx-icon gx-ia-thumb-up" aria-hidden="true"></span>   <!-- pops -->
```

Most icons move with a **motion preset** that snaps in whole icon pixels: `bob`, `float`,
`pulse`, `beat`, `pop`, `spin`, `spin-slow`, `wiggle`, `ring`, `swing`, `shake`,
`nudge-{right,left,up,down}`, `drive`, `blink`, `squint`, `flip` and `tick`. Each icon has a
default in `icons/motion.mjs`; to choose another, pair the static class with a preset
class: `gx-i-coin gx-im-spin`.

Some icons are redrawn **frame by frame** instead: `fire`, `laugh`, `wink`, plus these extras
that have no static version: `write`, `tablet`, `heartbeat`, `coin-spin`, `bell-ring`, `typing`
and `loading`.

**Stopping them** (needs `gamifiedui-css`):

| Class | Effect |
|---|---|
| `gx-icon-paused` | Pauses one icon. |
| `gx-icon-hover-play` | Plays only while the parent (a button, card or tile) is hovered or focused. |
| `gx-icons-paused` | On any container: pauses every animated icon inside it. |

Animations also stop under `prefers-reduced-motion: reduce` and inside
`[data-gx-motion="reduce"]`, where frame icons rest on frame 0.

## Icons

**Common:** heart, star, coin, check, close, plus, minus, chevron-{right,left,down,up}, menu,
search, home, gear, user, lock, bell, mail, play, pause, sound, info, warning, sword, shield,
potion, key, gift, trophy, clock, chat, reload, fire, bolt, sparkle, calendar, hourglass,
arrow-{right,left,down,up}, upload, download, file, folder, image, trash, edit, copy, link,
share, eye, filter, logout, cart, pin, flag, bookmark, camera, globe, cloud, sun, moon, music,
thumb-up, thumb-down.

**Emoji:** smile, laugh, wink, sad, cry, angry, surprised, love, cool, neutral.

**Hong Kong:**

| Class | 繁體 | English |
|---|---|---|
| `gx-i-egg-tart` | 蛋撻 | Egg tart |
| `gx-i-milk-tea` | 奶茶 | Milk tea |
| `gx-i-pineapple-bun` | 菠蘿包 | Pineapple bun |
| `gx-i-dim-sum` | 點心 | Dim sum steamer |
| `gx-i-egg-waffle` | 雞蛋仔 | Egg waffle |
| `gx-i-fishball` | 魚蛋 | Fish balls |
| `gx-i-tram` | 電車 | Tram |
| `gx-i-minibus` | 小巴 | Red minibus |
| `gx-i-ferry` | 天星小輪 | Star Ferry |
| `gx-i-junk-boat` | 帆船 | Junk boat |
| `gx-i-bauhinia` | 洋紫荊 | Bauhinia |
| `gx-i-mahjong` | 麻雀 | Mahjong tile |
| `gx-i-lai-see` | 利是 | Lai see packet |
| `gx-i-signal-1`, `-3`, `-8` | 風球 | Typhoon signals |
| `gx-i-lantern` | 燈籠 | Lantern |
| `gx-i-mooncake` | 月餅 | Mooncake |
| `gx-i-lion-rock` | 獅子山 | Lion Rock |
| `gx-i-rice-bowl` | 飯碗 | Rice bowl |

## Adding an icon

Icons are ASCII grids in `icons/common.mjs`, `icons/emoji.mjs` and `icons/hk.mjs`: `#` is a
solid pixel, `+` is 50% alpha, and `.` is empty. A symmetric icon can list only its left 8
columns and set `mirror: true`. A variant can reuse another icon with `from` and a transform
(`flipX`, `flipY`, `rot90`, `rot180` or `rot270`). Give it a motion in `icons/motion.mjs`
(otherwise it bobs), or add frames to `icons/animated.mjs`; frame 0 is the reduced-motion pose.
Run `npm run build` to regenerate the CSS, SVGs and `icons.json`. `npm test` fails if any of
them are stale.

## License

All icons are original work for this project, under the [Apache License 2.0](LICENSE).
See [NOTICE](NOTICE).
