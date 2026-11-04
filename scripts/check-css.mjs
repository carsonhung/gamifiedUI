// Compiles gamifiedui-css through Tailwind and enforces the motion and theming rules.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compile } from '@tailwindcss/node';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'packages', 'gamifiedui-css', 'src');
const TOKEN_FILES = new Set(['tokens.css', 'themes.css']);
const ALLOWED_TRANSITION_PROPS = new Set(['translate', 'scale', 'rotate', 'transform', 'opacity']);

const COMPONENT_SELECTORS = [
  '.gx-btn',
  '.gx-btn-tint',
  '.gx-btn-tile',
  '.gx-btn-art',
  '.gx-panel',
  '.gx-bar',
  '.gx-badge',
  '.gx-dialog',
  '.gx-dialog-scene',
  '.gx-dialog-actions',
  '.gx-gauge',
  '.gx-gauge-vertical',
  '.gx-lane',
  '.gx-dpad',
  '.gx-btn-hold',
  '.gx-textbox',
  '.gx-alert',
  '.gx-toast-stack',
  '.gx-toast',
  '.gx-toast-achievement',
  '.gx-spinner',
  '.gx-tooltip-content',
  '.gx-tabs',
  '.gx-tab',
  '.gx-input',
  '.gx-checkbox',
  '.gx-radio',
  '.gx-switch',
  '.gx-card',
  '.gx-slot',
  '.gx-kbd',
  '.gx-rarity-legendary',
  '.gx-frame',
  '.gx-frame-caption',
  '.gx-avatar',
  '.gx-video-screen',
  '.gx-video-play',
  '.gx-menu',
  '.gx-menu-item',
  '.gx-dropdown-panel',
  '.gx-accordion',
  '.gx-slider',
  '.gx-table',
  '.gx-rank-1',
  '.gx-page',
  '.gx-drawer',
  '.gx-stepper',
  '.gx-step-node',
  '.gx-chip',
  '.gx-divider',
  '.gx-skeleton',
  '.gx-rating',
  '.gx-rating-stars',
  '.gx-counter',
  '.gx-reward-item',
  '.gx-flip',
  '.gx-flip-back',
  '.gx-flip-face',
  '.gx-quest',
  '.gx-objective',
  '.gx-skill',
  '.gx-float',
  '.gx-icon',
  '.gx-icon-tile',
  '.gx-burst',
  '.gx-particle',
  '.gx-ambient',
  '.gx-timer',
  '.gx-calendar',
  '.gx-day',
  '.gx-datepicker-toggle',
  '.gx-datepicker-panel',
  '.gx-dropzone',
  '.gx-file',
  '.gx-file-remove',
  '.gx-desktop',
  '.gx-desktop-icon',
  '.gx-window',
  '.gx-window-titlebar',
  '.gx-taskbar',
  '.gx-start-menu',
  '.gx-map',
  '.gx-map-viewport',
  '.gx-map-place',
  '.gx-hint',
  '.gx-credit',
  '.gx-statusbar',
];
const UTILITY_CASES = {
  'gx-depth-2': '--gx-depth: calc(var(--gx-px) * 2)',
  'gx-sprite-frames-8': '--gx-sprite-frames: 8',
  'gx-sprite-w-16': '--gx-sprite-w: calc(16 * 1px)',
  'gx-sprite-scale-4': '--gx-sprite-scale: 4',
  'gx-sprite-ms-800': '--gx-sprite-duration: calc(800 * 1ms)',
  'gx-sprite': 'steps(var(--gx-sprite-frames, 1), end)',
  'gx-iso': 'rotateX(54.7356deg) rotateZ(-45deg)',
  'gx-pixelated': 'image-rendering: pixelated',
  'gx-pixel-frame': 'box-shadow',
  'bg-gx-primary': 'background-color: var(--color-gx-primary)',
  'font-gx': 'font-family: var(--font-gx)',
};

const failures = [];
const fail = (message) => failures.push(message);

async function listCss(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => (e.isDirectory() ? listCss(path.join(dir, e.name)) : [path.join(dir, e.name)])),
  );
  return files.flat().filter((f) => f.endsWith('.css'));
}

function ruleBlock(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`\\.${escaped}\\s*\\{[^}]*\\}`))?.[0] ?? '';
}

async function checkCompiled() {
  const compiler = await compile('@import "tailwindcss";\n@import "./index.css";', {
    base: SRC,
    onDependency: () => {},
  });
  const css = compiler.build(Object.keys(UTILITY_CASES));

  for (const selector of COMPONENT_SELECTORS) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!new RegExp(`${escaped}\\s*[,{]`).test(css)) fail(`compiled CSS is missing component ${selector}`);
  }
  for (const [candidate, expected] of Object.entries(UTILITY_CASES)) {
    const block = ruleBlock(css, candidate);
    if (!block) fail(`utility ${candidate} was not generated`);
    else if (!block.includes(expected)) fail(`utility ${candidate} lacks "${expected}"`);
  }
  if (!/prefers-reduced-motion: reduce[\s\S]*?--gx-motion-fast: 0ms/.test(css)) {
    fail('reduced-motion media query does not zero the motion tokens');
  }
  if (!/:lang\(zh-Hans\)[\s\S]*?Fusion Pixel 12px Proportional SC/.test(css)) {
    fail('zh-Hans does not switch --font-gx to the Simplified Chinese pixel font');
  }
  if (!/:lang\(zh\)[\s\S]*?--gx-text-md: 0\.75rem/.test(css)) {
    fail('CJK text does not snap pixel-font sizes to the 12px grid');
  }
}

async function checkSourceRules() {
  for (const file of await listCss(SRC)) {
    const name = path.relative(SRC, file);
    const source = (await readFile(file, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');

    for (const [, value] of source.matchAll(/transition(?:-property)?\s*:\s*([^;]+);/g)) {
      for (const part of value.split(/,(?![^(]*\))/)) {
        const prop = part.trim().split(/\s+/)[0];
        if (!ALLOWED_TRANSITION_PROPS.has(prop)) {
          fail(`${name}: transition on "${prop}" (only ${[...ALLOWED_TRANSITION_PROPS].join(', ')})`);
        }
      }
    }

    if (!TOKEN_FILES.has(path.basename(file)) && /#[0-9a-fA-F]{3,8}\b/.test(source)) {
      fail(`${name}: raw hex colour outside tokens.css / themes.css`);
    }

    const hasReducedFallback = /prefers-reduced-motion/.test(source);
    for (const [, value] of source.matchAll(/animation\s*:\s*([^;]+);/g)) {
      const isTokenTimedOnce = value.includes('--gx-motion-') && !value.includes('infinite');
      if (value.trim() !== 'none' && !isTokenTimedOnce && !hasReducedFallback) {
        fail(`${name}: animation "${value.trim()}" needs motion tokens or a prefers-reduced-motion fallback`);
      }
    }
  }
}

await checkCompiled();
await checkSourceRules();

if (failures.length) {
  console.error(`[check-css] ${failures.length} problem(s):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log('[check-css] ok');
