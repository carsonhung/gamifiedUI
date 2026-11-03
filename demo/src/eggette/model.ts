import {
  BASE_PRICE,
  BATTER_PER_MIX,
  CASH_NOTES,
  COOK_SIDE_MS,
  CUSTOMER_ICONS,
  DAY_MS,
  DOUBLE_ORDER_CHANCE,
  ELECTRIC_MIX_MS,
  FAN_PATIENCE_BONUS,
  FLAVOUR_POWDER,
  FLAVOURS,
  FLIP_WINDOW_MS,
  GOLDEN_SLICE_MS,
  GOLDEN_TIP,
  MAX_PANS,
  MAX_REPUTATION,
  MIX_MS,
  OCTOPUS_CHANCE,
  OCTOPUS_READER_CHANCE,
  PAN_PRICES,
  PATIENCE_MS,
  READY_WINDOW_MS,
  RECIPE,
  REP_ANGRY,
  REP_GOLDEN,
  REP_HAPPY,
  REP_WRONG_CHANGE,
  SHOP_LEVELS,
  SPAWN_REP_FACTOR,
  START_COINS,
  START_PANS,
  START_REPUTATION,
  START_STOCK,
  STOCK_PACKS,
  UPGRADE_PRICES,
  type Flavour,
  type Ingredient,
  type ShopLevel,
  type UpgradeId,
} from './config';

export type Random = () => number;

export type PanPhase = 'empty' | 'sideA' | 'flip' | 'sideB' | 'ready' | 'burnt';

export interface Pan {
  phase: PanPhase;
  flavour: Flavour;
  /** Clock time the current phase started. */
  phaseAt: number;
  isGoldenFlip: boolean;
}

export interface Waffle {
  flavour: Flavour;
  isGolden: boolean;
}

export interface Customer {
  id: number;
  icon: string;
  order: Flavour[];
  arrivedAt: number;
  patienceMs: number;
}

export interface Payment {
  customerId: number;
  total: number;
  /** Cash note handed over, or null for an Octopus card tap. */
  paid: number | null;
  given: number[];
  tip: number;
}

export interface DayStats {
  served: number;
  lost: number;
  revenue: number;
  spent: number;
  burnt: number;
  golden: number;
}

export interface Owned {
  mixer: boolean;
  chocolate: boolean;
  matcha: boolean;
  fan: boolean;
  octopus: boolean;
}

export type Phase = 'intro' | 'open' | 'closed';

export interface GameState {
  phase: Phase;
  day: number;
  /** Milliseconds since the shop opened today. */
  clock: number;
  coins: number;
  reputation: number;
  stock: Record<Ingredient, number>;
  batter: Record<Flavour, number>;
  flavour: Flavour;
  mixStartedAt: number | null;
  mixFlavour: Flavour;
  pans: Pan[];
  tray: Waffle[];
  queue: Customer[];
  payment: Payment | null;
  nextSpawnAt: number;
  nextId: number;
  shopLevel: number;
  owned: Owned;
  stats: DayStats;
}

export type GameEvent =
  | { kind: 'arrive'; customer: Customer }
  | { kind: 'passBy' }
  | { kind: 'angry'; customer: Customer }
  | { kind: 'mixed'; flavour: Flavour }
  | { kind: 'needFlip'; pan: number }
  | { kind: 'ready'; pan: number }
  | { kind: 'burnt'; pan: number }
  | { kind: 'closing' }
  | { kind: 'dayOver' };

export type Fail = 'noCoins' | 'noStock' | 'noBatter' | 'busy' | 'noWaffles' | 'maxed' | 'locked' | 'closed';
export type Result<T = void> = { ok: true; value: T } | { ok: false; reason: Fail };

const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const fail = (reason: Fail): Result<never> => ({ ok: false, reason });

const emptyPan = (): Pan => ({ phase: 'empty', flavour: 'original', phaseAt: 0, isGoldenFlip: false });
const emptyStats = (): DayStats => ({ served: 0, lost: 0, revenue: 0, spent: 0, burnt: 0, golden: 0 });
const clampRep = (n: number): number => Math.min(MAX_REPUTATION, Math.max(0, n));

export function newGame(): GameState {
  return {
    phase: 'intro',
    day: 1,
    clock: 0,
    coins: START_COINS,
    reputation: START_REPUTATION,
    stock: { ...START_STOCK },
    batter: { original: 0, chocolate: 0, matcha: 0 },
    flavour: 'original',
    mixStartedAt: null,
    mixFlavour: 'original',
    pans: Array.from({ length: START_PANS }, emptyPan),
    tray: [],
    queue: [],
    payment: null,
    nextSpawnAt: 0,
    nextId: 1,
    shopLevel: 0,
    owned: { mixer: false, chocolate: false, matcha: false, fan: false, octopus: false },
    stats: emptyStats(),
  };
}

export const levelOf = (state: GameState): ShopLevel => SHOP_LEVELS[state.shopLevel] ?? SHOP_LEVELS[0]!;
export const priceOf = (state: GameState, flavour: Flavour): number => BASE_PRICE[flavour] + levelOf(state).priceBonus;
export const mixMs = (state: GameState): number => (state.owned.mixer ? ELECTRIC_MIX_MS : MIX_MS);
export const isUnlocked = (state: GameState, flavour: Flavour): boolean => flavour === 'original' || state.owned[flavour];
export const unlockedFlavours = (state: GameState): Flavour[] => FLAVOURS.filter((f) => isUnlocked(state, f));
export const isDayDone = (state: GameState): boolean => state.clock >= DAY_MS;

function pick<T>(items: readonly T[], random: Random): T {
  return items[Math.floor(random() * items.length)] ?? items[0]!;
}

function spawnInterval(state: GameState, random: Random): number {
  const repFactor = 1 - (state.reputation - START_REPUTATION) * SPAWN_REP_FACTOR;
  return levelOf(state).spawnMs * repFactor * (0.7 + random() * 0.6);
}

/** Empties everything that only lives within one shop day: pans, mixer, counter and queue. */
export function clearShift(state: GameState): void {
  state.clock = 0;
  state.queue = [];
  state.payment = null;
  state.tray = [];
  state.mixStartedAt = null;
  state.pans = state.pans.map(emptyPan);
}

export function startDay(state: GameState, random: Random): void {
  clearShift(state);
  state.phase = 'open';
  state.stats = emptyStats();
  state.nextSpawnAt = 1500 + random() * 1500;
}

function makeCustomer(state: GameState, random: Random): Customer {
  const flavours = unlockedFlavours(state);
  const size = random() < DOUBLE_ORDER_CHANCE ? 2 : 1;
  return {
    id: state.nextId++,
    icon: pick(CUSTOMER_ICONS, random),
    order: Array.from({ length: size }, () => pick(flavours, random)),
    arrivedAt: state.clock,
    patienceMs: PATIENCE_MS * (state.owned.fan ? FAN_PATIENCE_BONUS : 1) * (0.85 + random() * 0.3),
  };
}

/** Advances the shop by `dt` milliseconds and reports what happened. */
export function tick(state: GameState, dt: number, random: Random): GameEvent[] {
  if (state.phase !== 'open') return [];
  const events: GameEvent[] = [];
  const wasDone = isDayDone(state);
  state.clock += dt;
  const now = state.clock;

  if (!wasDone && isDayDone(state)) events.push({ kind: 'closing' });

  if (state.mixStartedAt !== null && now - state.mixStartedAt >= mixMs(state)) {
    state.batter[state.mixFlavour] += BATTER_PER_MIX;
    state.mixStartedAt = null;
    events.push({ kind: 'mixed', flavour: state.mixFlavour });
  }

  state.pans.forEach((pan, i) => {
    const age = now - pan.phaseAt;
    if (pan.phase === 'sideA' && age >= COOK_SIDE_MS) {
      pan.phase = 'flip';
      pan.phaseAt += COOK_SIDE_MS;
      events.push({ kind: 'needFlip', pan: i });
    } else if (pan.phase === 'sideB' && age >= COOK_SIDE_MS) {
      pan.phase = 'ready';
      pan.phaseAt += COOK_SIDE_MS;
      events.push({ kind: 'ready', pan: i });
    } else if ((pan.phase === 'flip' && age >= FLIP_WINDOW_MS) || (pan.phase === 'ready' && age >= READY_WINDOW_MS)) {
      pan.phase = 'burnt';
      pan.phaseAt = now;
      state.stats.burnt++;
      events.push({ kind: 'burnt', pan: i });
    }
  });

  state.queue = state.queue.filter((customer) => {
    const isPaying = state.payment?.customerId === customer.id;
    if (isPaying || now - customer.arrivedAt < customer.patienceMs) return true;
    state.stats.lost++;
    state.reputation = clampRep(state.reputation + REP_ANGRY);
    events.push({ kind: 'angry', customer });
    return false;
  });

  if (!isDayDone(state) && now >= state.nextSpawnAt) {
    if (state.queue.length < levelOf(state).seats) {
      const customer = makeCustomer(state, random);
      state.queue.push(customer);
      events.push({ kind: 'arrive', customer });
    } else {
      state.stats.lost++;
      events.push({ kind: 'passBy' });
    }
    state.nextSpawnAt = now + spawnInterval(state, random);
  }

  if (isDayDone(state) && state.queue.length === 0 && !state.payment) {
    state.phase = 'closed';
    state.pans = state.pans.map(emptyPan);
    state.mixStartedAt = null;
    state.tray = [];
    events.push({ kind: 'dayOver' });
  }
  return events;
}

export function buyStock(state: GameState, ingredient: Ingredient): Result {
  if (ingredient === 'cocoa' && !state.owned.chocolate) return fail('locked');
  if (ingredient === 'matcha' && !state.owned.matcha) return fail('locked');
  const pack = STOCK_PACKS[ingredient];
  if (state.coins < pack.price) return fail('noCoins');
  state.coins -= pack.price;
  state.stock[ingredient] += pack.units;
  state.stats.spent += pack.price;
  return ok(undefined);
}

export function missingForMix(state: GameState, flavour: Flavour): Ingredient[] {
  const needs: Partial<Record<Ingredient, number>> = { ...RECIPE };
  const powder = FLAVOUR_POWDER[flavour];
  if (powder) needs[powder] = (needs[powder] ?? 0) + 1;
  return (Object.entries(needs) as [Ingredient, number][]).filter(([item, n]) => state.stock[item] < n).map(([item]) => item);
}

export function startMix(state: GameState): Result {
  if (state.phase !== 'open') return fail('closed');
  if (state.mixStartedAt !== null) return fail('busy');
  if (missingForMix(state, state.flavour).length > 0) return fail('noStock');
  const powder = FLAVOUR_POWDER[state.flavour];
  for (const [item, n] of Object.entries(RECIPE) as [Ingredient, number][]) state.stock[item] -= n;
  if (powder) state.stock[powder] -= 1;
  state.mixStartedAt = state.clock;
  state.mixFlavour = state.flavour;
  return ok(undefined);
}

export function pour(state: GameState, index: number): Result {
  const pan = state.pans[index];
  if (!pan || pan.phase !== 'empty') return fail('busy');
  if (state.phase !== 'open') return fail('closed');
  if (state.batter[state.flavour] <= 0) return fail('noBatter');
  state.batter[state.flavour]--;
  Object.assign(pan, { phase: 'sideA', flavour: state.flavour, phaseAt: state.clock, isGoldenFlip: false });
  return ok(undefined);
}

export function flip(state: GameState, index: number): Result<boolean> {
  const pan = state.pans[index];
  if (!pan || pan.phase !== 'flip') return fail('busy');
  pan.isGoldenFlip = state.clock - pan.phaseAt <= GOLDEN_SLICE_MS;
  pan.phase = 'sideB';
  pan.phaseAt = state.clock;
  return ok(pan.isGoldenFlip);
}

/** Takes a ready waffle to the counter, or scrapes a burnt one into the bin. */
export function collect(state: GameState, index: number): Result<Waffle | null> {
  const pan = state.pans[index];
  if (!pan || (pan.phase !== 'ready' && pan.phase !== 'burnt')) return fail('busy');
  const waffle =
    pan.phase === 'ready'
      ? { flavour: pan.flavour, isGolden: pan.isGoldenFlip && state.clock - pan.phaseAt <= GOLDEN_SLICE_MS }
      : null;
  if (waffle) state.tray.push(waffle);
  Object.assign(pan, emptyPan());
  return ok(waffle);
}

/** Waffles on the counter that would fill this order, golden ones first; null if short. */
function takeOrder(tray: Waffle[], order: Flavour[]): Waffle[] | null {
  const pool = [...tray].sort((a, b) => Number(b.isGolden) - Number(a.isGolden));
  const taken: Waffle[] = [];
  for (const flavour of order) {
    const at = pool.findIndex((w) => w.flavour === flavour);
    if (at < 0) return null;
    taken.push(...pool.splice(at, 1));
  }
  return taken;
}

export function canServe(state: GameState): boolean {
  const front = state.queue[0];
  return !!front && !state.payment && takeOrder(state.tray, front.order) !== null;
}

export function serve(state: GameState, random: Random): Result<Payment> {
  const front = state.queue[0];
  if (!front) return fail('noWaffles');
  if (state.payment) return fail('busy');
  const taken = takeOrder(state.tray, front.order);
  if (!taken) return fail('noWaffles');
  taken.forEach((w) => state.tray.splice(state.tray.indexOf(w), 1));
  const total = front.order.reduce((sum, f) => sum + priceOf(state, f), 0);
  const golden = taken.filter((w) => w.isGolden).length;
  const octopusChance = state.owned.octopus ? OCTOPUS_READER_CHANCE : OCTOPUS_CHANCE;
  const notes = CASH_NOTES.filter((n) => n >= total);
  const paid = random() < octopusChance ? null : random() < 0.7 ? (notes[0] ?? total) : pick(notes, random);
  state.stats.golden += golden;
  state.payment = { customerId: front.id, total, paid, given: [], tip: golden * GOLDEN_TIP };
  return ok(state.payment);
}

export function giveCoin(state: GameState, value: number): void {
  state.payment?.given.push(value);
}

export function undoCoin(state: GameState): void {
  state.payment?.given.pop();
}

export const changeDue = (payment: Payment): number => (payment.paid ?? payment.total) - payment.total;
export const changeGiven = (payment: Payment): number => payment.given.reduce((a, b) => a + b, 0);

export interface Settlement {
  isCorrect: boolean;
  earned: number;
  tip: number;
}

/** Hands over the change (or takes the Octopus tap) and sends the customer off. */
export function settle(state: GameState): Result<Settlement> {
  const payment = state.payment;
  if (!payment) return fail('busy');
  const given = changeGiven(payment);
  const isCorrect = given === changeDue(payment);
  const tip = isCorrect ? payment.tip : 0;
  const earned = (payment.paid ?? payment.total) - given + tip;
  state.coins += earned;
  state.stats.revenue += earned;
  state.stats.served++;
  const repGain = isCorrect ? REP_HAPPY + (payment.tip > 0 ? REP_GOLDEN : 0) : REP_WRONG_CHANGE;
  state.reputation = clampRep(state.reputation + repGain);
  state.queue = state.queue.filter((c) => c.id !== payment.customerId);
  state.payment = null;
  return ok({ isCorrect, earned, tip });
}

export function upgradePrice(state: GameState, id: UpgradeId): number | null {
  if (id === 'pan') return state.pans.length >= MAX_PANS ? null : (PAN_PRICES[state.pans.length - START_PANS] ?? null);
  if (id === 'expand') return SHOP_LEVELS[state.shopLevel + 1]?.cost ?? null;
  return state.owned[id] ? null : UPGRADE_PRICES[id];
}

export function buyUpgrade(state: GameState, id: UpgradeId): Result {
  const price = upgradePrice(state, id);
  if (price === null) return fail('maxed');
  if (state.coins < price) return fail('noCoins');
  state.coins -= price;
  if (id === 'pan') {
    state.pans.push(emptyPan());
  } else if (id === 'expand') {
    state.shopLevel++;
  } else {
    state.owned[id] = true;
  }
  return ok(undefined);
}

export function nextDay(state: GameState): void {
  state.day++;
  state.phase = 'intro';
}

export const hasWon = (state: GameState): boolean =>
  state.shopLevel === SHOP_LEVELS.length - 1 && state.reputation >= MAX_REPUTATION - 0.5;
