import { MESSAGES, type Locale } from './i18n';
import { PAGE_TEXT } from './i18n-pages';

export let locale: Locale = 'en';
const localeListeners: Array<() => void> = [];

export function setLocale(next: Locale): void {
  locale = next;
}

export function onLocaleChange(listener: () => void): void {
  localeListeners.push(listener);
}

export function notifyLocaleChange(): void {
  localeListeners.forEach((listener) => listener());
}

export function t(key: string, vars?: Record<string, string | number>): string {
  let text = MESSAGES[locale].ui[key] ?? PAGE_TEXT[locale][key] ?? MESSAGES.en.ui[key] ?? PAGE_TEXT.en[key] ?? key;
  for (const [name, value] of Object.entries(vars ?? {})) text = text.replaceAll(`{${name}}`, String(value));
  return text;
}

export function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`[demo] missing #${id}`);
  return el as T;
}
