# gamifiedui-utils

Optional JavaScript helpers for [gamifiedui-css](../gamifiedui-css). The components need no
script. These helpers drive the few effects that only work with script: toasts, typewriter
text, number rolls, skill cooldowns, floating damage numbers and particle bursts. They have
no dependencies, are tree-shakeable ESM, and work with any framework.

```bash
npm i gamifiedui-utils
```

```js
import { toast, typewriter, burst } from 'gamifiedui-utils';
```

Or from a CDN, with no build step:

```html
<script type="module">
  import { toast } from 'https://cdn.jsdelivr.net/npm/gamifiedui-utils@0.3/+esm';
  toast({ title: 'Saved', body: 'Progress written to slot 1.', tone: 'success' });
</script>
```

Every helper honours `prefers-reduced-motion` and `data-gx-motion="reduce"`. Under reduced
motion, text appears at once, numbers jump, and decorative bursts are skipped.

## API

| Helper | What it does |
|---|---|
| `toast({ title, body?, tone?, icon?, duration?, limit?, dismissLabel?, stack? })` | Adds a `gx-toast` to the `gx-toast-stack` region, creating the region if needed. It pauses on hover and focus, and plays the exit animation before it is removed. `danger` uses `role="alert"`; every other tone uses `role="status"`. Returns `{ element, dismiss }`. |
| `confirmDialog({ message, title?, confirmLabel?, cancelLabel?, tone?, scene?, className? })` | Asks a yes/no question in a `gx-dialog` and resolves `true` or `false`; use it instead of `window.confirm`, which itch.io and other iframes can block. `scene` goes in a `gx-dialog-scene` above the message (a portrait beside a `gx-textbox`). Cancel has focus first, and Escape cancels. |
| `holdButton(button, { onPress, onRelease?, keys? })` | Makes a press-and-hold control for mini-games (pour, charge, heat). The pointer is captured, so a thumb that slides off keeps holding until it lifts; the long-press menu and the trailing click are cancelled; `data-pressed` keeps the button sunk while held. Space and Enter hold it while focused (`keys: []` when the game reads keys itself). Returns `{ isHeld, destroy }`. |
| `typewriter(el, text, { charsPerSecond?, locale?, onDone? })` | Types text grapheme by grapheme (safe for emoji and CJK), slowing down for CJK. Returns `{ skip, cancel, done }`. |
| `graphemes(text, locale?)` | Splits text into user-perceived characters with `Intl.Segmenter`. |
| `rollNumber(el, to, { from?, duration?, steps?, format? })` | Steps a number to its new value and bumps the closest `gx-counter`. Returns a Promise. |
| `quantity(root, { pageSteps?, onChange? })` | Wires a `gx-quantity`: buttons step by their `data-step`, holding repeats and speeds up, Home / End and PageUp / PageDown work on the field, and values clamp to the input's `min`, `max` and `step`. Returns `{ value, set, destroy }`. |
| `cooldown(button, seconds, { steps?, onReady? })` | Runs a `gx-skill` cooldown: the sweep, the timer text and `aria-disabled`, then the ready flash. Returns `{ cancel }`. |
| `isCoolingDown(button)` | Returns `true` while a cooldown is running. |
| `floatText(layer, text, { kind?, x?, y? })` | Spawns a `gx-float` number (`damage`, `heal`, `xp`, `crit`) in a `gx-float-layer`. |
| `burst(host, { kind?, className?, x?, y?, count?, spread?, largeEvery? })` | Fires a particle burst in a positioned element. Pass `className: 'gx-i-coin'` to use an icon shape. `kind: 'confetti'` mixes colours and adds a zigzag ribbon every third piece. |
| `tabs(tablist)` | Wires up `role="tablist"`: click, the arrow keys, Home and End, roving `tabindex`, and showing the panel. Returns `{ select, destroy }`. |
| `gridNav(root, { selector?, onMove? })` | Arrow-key cursor over a `gx-inventory` or `gx-card-grid`: one tab stop for the whole grid, arrows move by cell and by row using the columns the browser laid out, Home / End go to the row's ends and Ctrl+Home / End to the first and last cell. Call `refresh()` after adding or removing cells. Returns `{ focus, refresh, destroy }`. |
| `sliderFill(root?)` | Keeps `--gx-value` in sync on every `gx-slider` (for the WebKit fill). Returns a cleanup function. |
| `videoPlayOverlay(video, button)` | Shows a `gx-video-play` button until the video starts, then hands over to native controls. |
| `timer(el, seconds, { mode?, warnAt?, criticalAt?, autoStart?, onDone? })` | Runs a `gx-timer` countdown (`mode: 'up'` for a stopwatch). It measures elapsed time, so a throttled background tab doesn't drift. Returns `{ start, pause, reset, seconds, running }`. `formatDuration(90)` gives `"01:30"`. |
| `calendar(el, { mode?, value?, range?, min?, max?, isDisabled?, locale?, firstDay?, decorate?, onSelect?, onRangeSelect? })` | Renders a `gx-calendar`. Month and weekday names come from `Intl`, and the week starts on the locale's first day. Keys: the arrows, Home and End, PageUp and PageDown (add Shift for a year). In `mode: 'range'`, the second pick ends the range, and hovering shows a preview. |
| `datePicker(input, toggle, panel, { mode?, endInput?, format?, parse?, onChange?, ...calendar })` | Wires a `gx-datepicker`. Typing a date updates the calendar, and picking one fills the field (YYYY-MM-DD by default) and returns focus to the toggle. |
| `timeList(el, { mode?, step?, min?, max?, value?, range?, isDisabled?, allowOvernight?, format?, labels?, onSelect?, onRangeSelect? })` | Renders a `gx-time` list of times every `step` minutes (default 30). Keys: Up and Down, PageUp and PageDown (an hour), Home and End, Enter or Space to pick, and typing digits jumps to a time (`9`, `930`, `21`). In `mode: 'range'` the second pick ends the range; an end earlier than the start means the next day unless `allowOvernight: false`. Times are `"HH:MM"` strings. Returns `{ value, range, setValue, setRange, setLabels, focus, destroy }`. |
| `timePicker(input, toggle, panel, { mode?, endInput?, separator?, onChange?, ...timeList })` | Wires a `gx-timepicker`. Typing `9:30`, `21:00` or `9:30 pm` updates the list, and picking fills the field with `HH:MM` and returns focus to the toggle. `onChange` gets a time or `{ start, end, minutes, isOvernight }`. |
| `parseTime(text)`, `formatTime(minutes)`, `timeRange(start, end)` | `"9:30 pm"` to 1290 minutes, 570 to `"09:30"`, and a range with its length in minutes, counted through midnight when the end is earlier. |
| `toISODate(date)`, `parseISODate(text)` | Local YYYY-MM-DD with no time-zone shift. |
| `dropzone(zone, { onFiles, onReject?, accept?, maxSize?, multiple? })` | Adds drag and drop to a `gx-dropzone`. Dropped and picked files go through the same type, size and count checks. |
| `formatBytes(n, locale?)`, `matchesAccept(file, accept)` | Upload helpers. |
| `prefersReducedMotion(el?)`, `replay(el, attribute)` | Low-level motion helpers. `replay` restarts a `data-*` animation such as `data-bump`. |

## License

[Apache License 2.0](LICENSE). See [NOTICE](NOTICE).
