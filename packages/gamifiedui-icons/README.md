# gamifiedui-icons

56 pixel icons drawn on a 16×16 grid for [gamifiedui-css](../gamifiedui-css): 36 common UI and
game icons plus 20 Hong Kong icons. Each icon is one CSS class. It is a mask filled with
`currentColor`, so it takes the text colour and any `gx-icon` tone.

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

- `svg/<name>.svg` files using `fill="currentColor"`.
- `icons.json`, with the name, set and English / 繁體 / 简体 labels for each icon.

## Icons

**Common:** heart, star, coin, check, close, plus, minus, chevron-{right,left,down,up}, menu,
search, home, gear, user, lock, bell, mail, play, pause, sound, info, warning, sword, shield,
potion, key, gift, trophy, clock, chat, reload, fire, bolt, sparkle.

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

Icons are ASCII grids in `icons/common.mjs` and `icons/hk.mjs`: `#` is a solid pixel, `+` is
50% alpha, and `.` is empty. A symmetric icon can list only its left 8 columns and set
`mirror: true`. A variant can reuse another icon with `from` and a transform (`flipX`,
`rot90` or `rot270`). Run `npm run build` to regenerate the CSS, SVGs and `icons.json`.
`npm test` fails if any of them are stale.

## License

All icons are original work for this project, under the [Apache License 2.0](LICENSE).
See [NOTICE](NOTICE).
