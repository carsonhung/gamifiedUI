import { t } from './core';

const DEMO_ONLY_ATTRIBUTES = ['data-i18n', 'data-i18n-label', 'data-code', 'data-code-extra'];
const COPIED_RESET_MS = 1500;

function stripDemoAttributes(root: Element): void {
  for (const el of [root, ...root.querySelectorAll('*')]) {
    DEMO_ONLY_ATTRIBUTES.forEach((name) => el.removeAttribute(name));
  }
}

function dedent(html: string): string {
  const lines = html.replace(/^\s*\n/, '').trimEnd().split('\n');
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)?.[0].length ?? 0);
  const cut = Math.min(...indents);
  return lines.map((l) => l.slice(cut)).join('\n');
}

/**
 * Markup of one example: its contents minus the heading, plus any dialogs it opens. Call before
 * widget setup so it captures the authored markup, not runtime state.
 */
export function snippetFor(section: HTMLElement): string {
  const clone = section.cloneNode(true) as HTMLElement;
  clone.querySelector(`#${section.getAttribute('aria-labelledby')}`)?.remove();
  stripDemoAttributes(clone);
  const parts = [dedent(clone.innerHTML)];
  for (const id of section.dataset.codeExtra?.split(',') ?? []) {
    const extra = document.getElementById(id.trim())?.cloneNode(true) as HTMLElement | undefined;
    if (!extra) continue;
    stripDemoAttributes(extra);
    parts.push(dedent(`  ${extra.outerHTML}`));
  }
  return parts.join('\n\n');
}

export function codeView(source: string): HTMLDivElement {
  const view = document.createElement('div');
  view.className = 'demo-code';
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'gx-btn gx-btn-ghost gx-btn-sm demo-code-copy';
  copy.textContent = t('copyCode');
  copy.dataset.i18n = 'copyCode';
  const status = document.createElement('span');
  status.className = 'demo-code-status';
  status.setAttribute('role', 'status');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(source);
      status.textContent = t('copied');
    } catch (error) {
      console.error('[demo] copy failed', error);
      status.textContent = t('copyFailed');
    }
    window.setTimeout(() => (status.textContent = ''), COPIED_RESET_MS);
  });
  const pre = document.createElement('pre');
  pre.tabIndex = 0;
  const code = document.createElement('code');
  code.textContent = source;
  pre.append(code);
  view.append(copy, status, pre);
  return view;
}

