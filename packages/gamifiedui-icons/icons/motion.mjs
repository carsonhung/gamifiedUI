/* Motion presets for any icon: gx-im-<preset> (or the per-icon gx-ia-<name> shortcut).
   Moves are whole icon pixels (1px of the 16 grid = 0.0625em) and every segment jumps
   (steps(1, end)), so pixel art never blurs mid-move. Keyframe values are complete
   declarations; `origin` pins transform-origin for rotations. */
const P = 0.0625; // one icon pixel, in em

export const PRESETS = {
  bob: { ms: 800, frames: [[0, 'translate: 0 0'], [50, `translate: 0 -${P}em`]] },
  float: { ms: 1600, frames: [[0, 'translate: 0 0'], [25, `translate: 0 -${P}em`], [50, `translate: 0 -${P * 2}em`], [75, `translate: 0 -${P}em`]] },
  pulse: { ms: 800, frames: [[0, 'scale: 1'], [50, 'scale: 1.125']] },
  beat: { ms: 1000, frames: [[0, 'scale: 1'], [10, 'scale: 1.125'], [20, 'scale: 1'], [30, 'scale: 1.125'], [40, 'scale: 1']] },
  pop: { ms: 1400, frames: [[0, 'scale: 1'], [10, 'scale: 1.25'], [20, 'scale: 1.125'], [30, 'scale: 1']] },
  spin: { ms: 800, frames: Array.from({ length: 8 }, (_, i) => [i * 12.5, `rotate: ${i * 45}deg`]) },
  'spin-slow': { ms: 2400, frames: Array.from({ length: 8 }, (_, i) => [i * 12.5, `rotate: ${i * 45}deg`]) },
  wiggle: { ms: 800, frames: [[0, 'rotate: 0deg'], [25, 'rotate: -10deg'], [50, 'rotate: 0deg'], [75, 'rotate: 10deg']] },
  ring: {
    ms: 1400,
    origin: '50% 0',
    frames: [[0, 'rotate: 0deg'], [8, 'rotate: -15deg'], [16, 'rotate: 15deg'], [24, 'rotate: -10deg'], [32, 'rotate: 10deg'], [40, 'rotate: 0deg']],
  },
  swing: { ms: 1000, origin: '20% 80%', frames: [[0, 'rotate: 0deg'], [20, 'rotate: -20deg'], [40, 'rotate: 10deg'], [60, 'rotate: 0deg']] },
  shake: {
    ms: 900,
    frames: [[0, 'translate: 0 0'], [10, `translate: -${P}em 0`], [20, `translate: ${P}em 0`], [30, `translate: -${P}em 0`], [40, `translate: ${P}em 0`], [50, 'translate: 0 0']],
  },
  'nudge-right': { ms: 900, frames: [[0, 'translate: 0 0'], [33, `translate: ${P}em 0`], [66, `translate: ${P * 2}em 0`]] },
  'nudge-left': { ms: 900, frames: [[0, 'translate: 0 0'], [33, `translate: -${P}em 0`], [66, `translate: -${P * 2}em 0`]] },
  'nudge-up': { ms: 900, frames: [[0, 'translate: 0 0'], [33, `translate: 0 -${P}em`], [66, `translate: 0 -${P * 2}em`]] },
  'nudge-down': { ms: 900, frames: [[0, 'translate: 0 0'], [33, `translate: 0 ${P}em`], [66, `translate: 0 ${P * 2}em`]] },
  drive: { ms: 600, frames: [[0, 'translate: 0 0'], [50, `translate: 0 -${P}em`]] },
  blink: { ms: 1000, frames: [[0, 'opacity: 1'], [50, 'opacity: 0.3']] },
  squint: { ms: 2400, frames: [[0, 'scale: 1 1'], [90, 'scale: 1 0.25'], [95, 'scale: 1 1']] },
  flip: { ms: 1200, frames: [[0, 'scale: 1 1'], [25, 'scale: 0.5 1'], [50, 'scale: 0.125 1'], [75, 'scale: 0.5 1']] },
  tick: { ms: 1000, frames: [[0, 'rotate: 0deg'], [50, 'rotate: 8deg']] },
};

/* Default preset per icon for gx-ia-<name>; unlisted icons bob. */
export const DEFAULTS = {
  'thumb-up': 'pop', 'thumb-down': 'nudge-down',
  'zoom-in': 'pulse', 'zoom-out': 'pulse', photos: 'float', phone: 'shake', mobile: 'shake', mute: 'blink',
  money: 'wiggle', 'money-bag': 'bob', pouch: 'bob', backpack: 'bob', helmet: 'pop', armor: 'pulse', bow: 'pulse',
  wand: 'swing', spellbook: 'float', stamina: 'nudge-right', mana: 'float', poison: 'pulse',
  dead: 'wiggle', ghost: 'float',
  bottle: 'wiggle', soap: 'bob', toothbrush: 'shake', bread: 'pulse', food: 'bob', meat: 'wiggle', fish: 'wiggle',
  rod: 'swing', stick: 'swing', tree: 'wiggle', wood: 'bob', metal: 'pulse', axe: 'swing', bulb: 'blink',
  'medal-gold': 'ring', 'medal-silver': 'ring', 'medal-bronze': 'ring', diamond: 'pulse', building: 'bob', shop: 'pulse',
  smoke: 'float', dig: 'nudge-down', mug: 'wiggle', sand: 'bob', water: 'nudge-down', ship: 'wiggle',
  shark: 'nudge-right', sleep: 'float', bedroom: 'bob', dress: 'wiggle', male: 'pulse', female: 'pulse', armchair: 'bob',
  notebook: 'wiggle', paper: 'bob', paint: 'wiggle', drawing: 'swing', window: 'pulse', glass: 'wiggle',
  earphone: 'beat', laptop: 'bob', desktop: 'bob',
  chair: 'bob', classroom: 'pulse', lecture: 'bob', blackboard: 'pulse', bowl: 'bob', teacher: 'bob',
  police: 'bob', soldier: 'nudge-up', king: 'pop', queen: 'pop', prince: 'bob', princess: 'bob',
  vegetable: 'wiggle', sandwich: 'bob', coffee: 'wiggle', tea: 'wiggle', alcohol: 'wiggle',
  chick: 'bob', cow: 'wiggle', sheep: 'bob', pig: 'wiggle', horse: 'bob', goblin: 'wiggle', fist: 'shake', 'fingers-crossed': 'wiggle', student: 'bob', boy: 'bob', girl: 'bob', dog: 'wiggle', cat: 'wiggle', castle: 'pulse', boss: 'shake', drawer: 'bob', book: 'wiggle', car: 'drive', hammer: 'swing', flowers: 'wiggle', herbs: 'wiggle', bar: 'wiggle', restaurant: 'bob', hotel: 'bob', inn: 'bob', cave: 'pulse',
  dungeon: 'pulse', guild: 'swing', create: 'pop', map: 'wiggle', 'mouse-pad': 'bob', scissors: 'shake', clip: 'swing', sticker: 'wiggle',
  archive: 'bob', drink: 'wiggle', guts: 'beat', pixel: 'blink', mouse: 'wiggle', keyboard: 'pulse', charger: 'blink', medicine: 'wiggle',
  cards: 'wiggle', 'credit-card': 'nudge-right', microphone: 'wiggle', speaker: 'pulse',
  stop: 'pulse', go: 'nudge-right', 'volume-up': 'pulse', 'volume-down': 'pulse',
  smile: 'bob', sad: 'nudge-down', cry: 'shake', angry: 'shake', surprised: 'pop', love: 'beat', cool: 'wiggle', neutral: 'bob',
  heart: 'beat', star: 'pop', coin: 'flip', check: 'pop', close: 'shake', plus: 'pulse', minus: 'pulse',
  'chevron-right': 'nudge-right', 'chevron-left': 'nudge-left', 'chevron-down': 'nudge-down', 'chevron-up': 'nudge-up',
  menu: 'pulse', search: 'wiggle', gear: 'spin-slow', lock: 'shake', bell: 'ring', play: 'pulse', pause: 'blink',
  sound: 'pulse', info: 'blink', warning: 'blink', sword: 'swing', potion: 'wiggle', key: 'wiggle', gift: 'shake',
  scooter: 'drive', 'roller-skate': 'drive', bicycle: 'drive', 'solar-panel': 'pulse', desk: 'bob', bathtub: 'bob', shower: 'wiggle', 'stairs-up': 'nudge-up', 'stairs-down': 'nudge-down',
  trophy: 'pop', award: 'ring', clock: 'tick', reload: 'spin', bolt: 'blink', sparkle: 'pop', hourglass: 'spin-slow',
  'arrow-right': 'nudge-right', 'arrow-left': 'nudge-left', 'arrow-down': 'nudge-down', 'arrow-up': 'nudge-up',
  upload: 'nudge-up', download: 'nudge-down', image: 'float', trash: 'shake', edit: 'wiggle', link: 'pulse',
  share: 'pulse', eye: 'squint', logout: 'nudge-right', cart: 'nudge-right', pin: 'float', flag: 'wiggle',
  camera: 'blink', globe: 'flip', cloud: 'float', sun: 'spin-slow', moon: 'wiggle', music: 'wiggle',
  'milk-tea': 'wiggle', 'dim-sum': 'float', tram: 'drive', minibus: 'drive', ferry: 'float', 'junk-boat': 'float',
  bauhinia: 'spin-slow', mahjong: 'flip', 'lai-see': 'wiggle', 'signal-1': 'blink', 'signal-3': 'blink',
  'signal-8': 'blink', lantern: 'ring', mooncake: 'pulse', 'lion-rock': 'float',
};

export const FALLBACK = 'bob';
