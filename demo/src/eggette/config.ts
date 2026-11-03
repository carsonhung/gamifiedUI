export const SAVE_KEY = 'gx-eggette-save-v1';
export const LOCALE_KEY = 'gx-eggette-locale';

export const TICK_MS = 100;
/** One shop day, 12:00 to 21:00 on the clock. */
export const DAY_MS = 150_000;
export const OPEN_HOUR = 12;
export const CLOSE_HOUR = 21;

export const POSE_RESET_MS = 1400;

export type Ingredient = 'flour' | 'egg' | 'sugar' | 'milk' | 'cocoa' | 'matcha';
export type Flavour = 'original' | 'chocolate' | 'matcha';

export const INGREDIENTS: Ingredient[] = ['flour', 'egg', 'sugar', 'milk', 'cocoa', 'matcha'];
export const FLAVOURS: Flavour[] = ['original', 'chocolate', 'matcha'];

export interface StockPack {
  units: number;
  price: number;
}

export const STOCK_PACKS: Record<Ingredient, StockPack> = {
  flour: { units: 5, price: 20 },
  egg: { units: 12, price: 24 },
  sugar: { units: 5, price: 10 },
  milk: { units: 5, price: 15 },
  cocoa: { units: 4, price: 24 },
  matcha: { units: 4, price: 32 },
};

/** One mix of batter. Flavoured batter adds one unit of its powder. */
export const RECIPE: Partial<Record<Ingredient, number>> = { flour: 1, egg: 2, sugar: 1, milk: 1 };
export const FLAVOUR_POWDER: Partial<Record<Flavour, Ingredient>> = { chocolate: 'cocoa', matcha: 'matcha' };
export const BATTER_PER_MIX = 4;
export const MIX_MS = 4000;
export const ELECTRIC_MIX_MS = 2000;

/** Pan timings: cook side A, flip within the window, cook side B, collect within the window. */
export const COOK_SIDE_MS = 3500;
export const FLIP_WINDOW_MS = 3000;
export const READY_WINDOW_MS = 5000;
/** Acting inside this slice of a window makes the waffle golden (worth a tip). */
export const GOLDEN_SLICE_MS = 1600;

export const BASE_PRICE: Record<Flavour, number> = { original: 16, chocolate: 20, matcha: 22 };
export const GOLDEN_TIP = 2;

export const START_COINS = 120;
export const START_STOCK: Record<Ingredient, number> = { flour: 3, egg: 6, sugar: 3, milk: 3, cocoa: 0, matcha: 0 };
export const START_PANS = 2;
export const MAX_PANS = 6;
export const PAN_PRICES = [80, 140, 220, 320];

export const PATIENCE_MS = 32_000;
export const FAN_PATIENCE_BONUS = 1.4;
export const MAX_ORDER_SIZE = 2;
export const DOUBLE_ORDER_CHANCE = 0.3;
export const CASH_NOTES = [20, 50, 100, 500];
export const CHANGE_COINS = [1, 2, 5, 10, 20];
export const OCTOPUS_CHANCE = 0.3;
export const OCTOPUS_READER_CHANCE = 0.6;

export const START_REPUTATION = 3;
export const MAX_REPUTATION = 5;
export const REP_HAPPY = 0.15;
export const REP_GOLDEN = 0.05;
export const REP_ANGRY = -0.35;
export const REP_WRONG_CHANGE = -0.25;

export interface ShopLevel {
  id: 'stall' | 'shop' | 'flagship';
  seats: number;
  priceBonus: number;
  spawnMs: number;
  /** Cost to reach this level from the one before. */
  cost: number;
}

export const SHOP_LEVELS: ShopLevel[] = [
  { id: 'stall', seats: 3, priceBonus: 0, spawnMs: 9000, cost: 0 },
  { id: 'shop', seats: 5, priceBonus: 2, spawnMs: 7000, cost: 300 },
  { id: 'flagship', seats: 7, priceBonus: 4, spawnMs: 5200, cost: 700 },
];
/** Each reputation star away from 3 speeds up or slows down customers by this share. */
export const SPAWN_REP_FACTOR = 0.12;

export type UpgradeId = 'pan' | 'mixer' | 'chocolate' | 'matcha' | 'fan' | 'octopus' | 'expand';

export const UPGRADE_PRICES: Record<Exclude<UpgradeId, 'pan' | 'expand'>, number> = {
  mixer: 150,
  chocolate: 100,
  matcha: 160,
  fan: 90,
  octopus: 120,
};

export const CUSTOMER_ICONS = ['student', 'teacher', 'police', 'nurse', 'chef', 'boy', 'girl', 'male', 'female', 'doctor'];
