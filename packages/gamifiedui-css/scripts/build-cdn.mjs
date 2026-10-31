// Prebuilds gamifiedui-css into standalone stylesheets for <link> / CDN use (no Tailwind needed).
//   dist/gamifiedui.css(.min)       Tailwind preflight + every token + components + utilities
//   dist/gamifiedui-core.css(.min)  same without preflight, for pages that ship their own reset
// Run with --check to fail when dist/ is stale.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compile, optimize } from '@tailwindcss/node';

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(PKG, 'src');
const DIST = path.join(PKG, 'dist');
const CHECK = process.argv.includes('--check');

const { version } = JSON.parse(await readFile(path.join(PKG, 'package.json'), 'utf8'));
const BANNER = `/*! gamifiedui-css v${version} | Apache-2.0 | https://github.com/carsonhung/gamifiedUI */\n`;

const range = (from, to, step = 1) => Array.from({ length: (to - from) / step + 1 }, (_, i) => from + i * step);
const SPRITE_SIZES = [8, 12, 16, 24, 32, 48, 64, 96, 128];

/** Arbitrary-value utilities cannot be enumerated, so ship the values people actually reach for. */
const CANDIDATES = [
  'gx-pixelated',
  'gx-pixel-frame',
  'gx-iso',
  'gx-sprite',
  'gx-sprite-paused',
  'sr-only',
  'not-sr-only',
  ...range(0, 8).map((n) => `gx-depth-${n}`),
  ...SPRITE_SIZES.flatMap((n) => [`gx-sprite-w-${n}`, `gx-sprite-h-${n}`]),
  ...range(1, 16).map((n) => `gx-sprite-frames-${n}`),
  ...range(1, 8).map((n) => `gx-sprite-scale-${n}`),
  ...range(100, 2000, 100).map((n) => `gx-sprite-ms-${n}`),
];

async function build(withPreflight) {
  const input = [
    '@layer theme, base, components, utilities;',
    '@import "tailwindcss/theme.css" layer(theme);',
    withPreflight ? '@import "tailwindcss/preflight.css" layer(base);' : '',
    '@import "tailwindcss/utilities.css" layer(utilities);',
    '@import "./index.css" theme(static);',
  ].join('\n');
  const compiler = await compile(input, { base: SRC, onDependency: () => {} });
  const css = compiler.build(CANDIDATES);
  return {
    full: BANNER + optimize(css, { minify: false }).code,
    min: BANNER + optimize(css, { minify: true }).code,
  };
}

const outputs = {};
for (const [name, withPreflight] of [['gamifiedui', true], ['gamifiedui-core', false]]) {
  const { full, min } = await build(withPreflight);
  outputs[`${name}.css`] = full;
  outputs[`${name}.min.css`] = min;
}

if (CHECK) {
  const stale = [];
  for (const [file, content] of Object.entries(outputs)) {
    const current = await readFile(path.join(DIST, file), 'utf8').catch(() => '');
    if (current !== content) stale.push(file);
  }
  if (stale.length) {
    console.error(`[build-cdn] stale: ${stale.join(', ')}. Run npm run build:cdn.`);
    process.exit(1);
  }
  console.log('[build-cdn] dist is up to date');
} else {
  await mkdir(DIST, { recursive: true });
  for (const [file, content] of Object.entries(outputs)) {
    await writeFile(path.join(DIST, file), content);
    console.log(`[build-cdn] dist/${file} ${(content.length / 1024).toFixed(1)} KiB`);
  }
}
